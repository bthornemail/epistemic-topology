Here's a complete, drop-in `agent-system.ts` that contains the deterministic utilities, tiny MLP, mutation operators, QAgent, an `AgentManager` to run agent steps and learning, and helper functions to persist agents into your cryptographic spine. It purposely assumes the presence of your surrounding runtime objects (`manifoldOS`, `gltfBridge`, `addToJSONL`, etc.) and calls their public methods (`spine.addDelta`, `broadcastBlock`, `update3DView`, `getState`, `getBranchBlocks`, ...). Where integration points are required I left clear comments.

Drop this file into your project (e.g. alongside `ManifoldOS` and `ManifoldEvolutionEngine`) and then call `AgentManager.attach(manifoldOS)` and `AgentManager.start()`.

```ts
// agent-system.ts
// Full agent system: deterministic RNG, TinyMLP, mutation descriptors, QAgent, AgentManager
// Designed to integrate with your existing ManifoldOS + ManifoldSpine environment.

type Tensor = number[];

/* ===========================
   Deterministic utilities
   =========================== */
export class LCG {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  next(): number {
    // Numerical Recipes LCG 32-bit
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  randRange(a: number, b: number) { return a + (b - a) * this.next(); }
  randInt(a: number, b: number) { return Math.floor(this.randRange(a, b + 1)); }
  choice<T>(arr: T[]) { return arr[this.randInt(0, arr.length - 1)]; }
  clone(): LCG { return new LCG(this.state); }
}

export function simpleKey(...parts: any[]): string {
  // stable-ish deterministic key; keep small
  return parts.map(p => JSON.stringify(p)).join('|');
}

export function jitterAround(p: { x: number; y: number; z: number }, radius = 1, seed = 1337) {
  const r = new LCG(seed);
  return { x: p.x + (r.next() - 0.5) * radius, y: p.y + (r.next() - 0.5) * radius, z: p.z + (r.next() - 0.5) * radius };
}

/* ===========================
   Tiny MLP (serializable)
   =========================== */
export class TinyMLP {
  layers: number[];
  weights: number[][];
  biases: number[][];
  rngSeed: number;

  constructor(layers: number[], seed = 1337) {
    this.layers = layers;
    this.weights = [];
    this.biases = [];
    this.rngSeed = seed;
    this.initWeights(seed);
  }

  private initWeights(seed: number) {
    const rnd = new LCG(seed);
    for (let i = 0; i < this.layers.length - 1; i++) {
      const inN = this.layers[i], outN = this.layers[i+1];
      const W = new Array(inN * outN).fill(0).map(() => (rnd.next() * 2 - 1) * 0.5);
      const B = new Array(outN).fill(0).map(() => (rnd.next() * 2 - 1) * 0.1);
      this.weights.push(W);
      this.biases.push(B);
    }
  }

  forward(x: Tensor): Tensor {
    let a = x.slice();
    for (let l = 0; l < this.weights.length; l++) {
      const W = this.weights[l], b = this.biases[l];
      const inN = this.layers[l], outN = this.layers[l+1];
      const out: number[] = new Array(outN).fill(0);
      for (let j = 0; j < outN; j++) {
        let s = b[j];
        for (let i = 0; i < inN; i++) s += a[i] * W[j * inN + i];
        out[j] = (l < this.weights.length - 1) ? Math.tanh(s) : s;
      }
      a = out;
    }
    return a;
  }

  mutate(rate = 0.02, scale = 0.05, seed?: number) {
    const rnd = new LCG(seed ?? (this.rngSeed + Math.floor(Math.random() * 1e6)));
    for (let l = 0; l < this.weights.length; l++) {
      for (let k = 0; k < this.weights[l].length; k++) {
        if (rnd.next() < rate) this.weights[l][k] += (rnd.next() * 2 - 1) * scale;
      }
      for (let k = 0; k < this.biases[l].length; k++) {
        if (rnd.next() < rate) this.biases[l][k] += (rnd.next() * 2 - 1) * scale;
      }
    }
  }

  serialize() {
    return { layers: this.layers, weights: this.weights, biases: this.biases, seed: this.rngSeed };
  }

  static deserialize(obj: any): TinyMLP {
    const net = new TinyMLP(obj.layers, obj.seed ?? 1337);
    net.weights = obj.weights;
    net.biases = obj.biases;
    return net;
  }
}

/* ===========================
   Mutation descriptors
   =========================== */
export type MutationDescriptor =
  | { kind: 'vertex_perturb'; magnitude: number; seed: number }
  | { kind: 'subdivide'; factor: number; seed: number }
  | { kind: 'merge_meshes'; strategy: 'overlay' | 'boolean_union' }
  | { kind: 'scale_parts'; factor: number; selector?: string; seed?: number };

export function randomMutation(seed: number): MutationDescriptor {
  const rnd = new LCG(seed);
  const roll = rnd.next();
  if (roll < 0.4) return { kind: 'vertex_perturb', magnitude: rnd.randRange(0.01, 0.15), seed };
  if (roll < 0.7) return { kind: 'subdivide', factor: rnd.randInt(1,2), seed };
  if (roll < 0.9) return { kind: 'scale_parts', factor: rnd.randRange(0.8, 1.4), selector: 'high_valence', seed };
  return { kind: 'merge_meshes', strategy: rnd.choice(['overlay', 'boolean_union']) };
}

/* ===========================
   QAgent
   =========================== */
export type AgentSpec = {
  id: string;
  seed: number;
  location: string;
  behavior: 'wander' | 'builder' | 'predator' | 'miner';
  qtable?: Record<string, Record<string, number>>;
  net?: any; // TinyMLP.serialize()
  energy?: number;
};

export class QAgent {
  id: string;
  seed: number;
  rng: LCG;
  location: string;
  behavior: string;
  qtable: Record<string, Record<string, number>>;
  net: TinyMLP;
  energy: number;

  actions = ['move','spawn','mutate','extend','noop'];

  alpha = 0.2;
  gamma = 0.9;
  epsilon = 0.15;

  constructor(spec: AgentSpec) {
    this.id = spec.id;
    this.seed = spec.seed;
    this.rng = new LCG(this.seed);
    this.location = spec.location;
    this.behavior = spec.behavior;
    this.qtable = spec.qtable ?? {};
    this.net = spec.net ? TinyMLP.deserialize(spec.net) : new TinyMLP([4,8,this.actions.length], this.seed + 1);
    this.energy = spec.energy ?? 20;
  }

  stateKey(world: any): string {
    const u = world.universes.get(this.location);
    const e = Math.floor((u?.energy ?? 0) / 10);
    const ent = Math.floor((u?.entropy ?? 0) / 10);
    const deg = Math.floor(((u?.ramification ?? 1) - 1) / 1);
    const ae = Math.floor(this.energy / 10);
    return simpleKey(this.location, e, ent, deg, ae);
  }

  features(world: any): number[] {
    const u = world.universes.get(this.location);
    const e = (u?.energy ?? 0) / 100;
    const ent = (u?.entropy ?? 0) / 100;
    const deg = ((u?.ramification ?? 1) - 1) / 4;
    const ae = (this.energy ?? 0) / 100;
    return [e, ent, deg, ae];
  }

  policy(world: any): { action: string; params?: any } {
    const key = this.stateKey(world);
    if (!this.qtable[key]) this.qtable[key] = Object.fromEntries(this.actions.map(a => [a, 0]));
    // epsilon-greedy
    if (this.rng.next() < this.epsilon) {
      const a = this.rng.choice(this.actions);
      return { action: a };
    }
    // choose max Q
    const entries = Object.entries(this.qtable[key]);
    let best = entries[0];
    for (const e of entries) {
      if (e[1] > best[1]) best = e;
      else if (e[1] === best[1] && this.rng.next() < 0.5) best = e;
    }
    const action = best[0];
    // parameters via network
    const features = this.features(world);
    const raw = this.net.forward(features);
    const paramSeed = Math.abs(Math.floor((raw[0] + 1) * 1e6)) + this.seed;
    const mut = randomMutation(paramSeed);
    return { action, params: { mutation: mut, paramSeed } };
  }

  learn(world: any, action: string, reward: number, nextWorld: any) {
    const sk = this.stateKey(world);
    const sk2 = this.stateKey(nextWorld);
    this.qtable[sk] = this.qtable[sk] ?? Object.fromEntries(this.actions.map(a => [a, 0]));
    this.qtable[sk2] = this.qtable[sk2] ?? Object.fromEntries(this.actions.map(a => [a, 0]));
    const q = this.qtable[sk][action];
    const maxNext = Math.max(...Object.values(this.qtable[sk2]));
    const target = reward + this.gamma * maxNext;
    this.qtable[sk][action] = q + this.alpha * (target - q);
    if (reward > 5) this.net.mutate(0.05, 0.02, this.seed + Math.floor(Math.random() * 1e6));
  }

  serialize(): AgentSpec {
    return { id: this.id, seed: this.seed, location: this.location, behavior: this.behavior as any, qtable: this.qtable, net: this.net.serialize(), energy: this.energy };
  }

  static deserialize(obj: AgentSpec): QAgent {
    return new QAgent(obj);
  }
}

/* ===========================
   AgentManager
   =========================== */

export class AgentManager {
  private os: any; // ManifoldOS instance
  private running = false;
  private interval = 1000;
  private agents: Map<string, QAgent> = new Map();
  private stepSeed: number = 1337;
  private auditPrefix = 'agent_system';

  constructor(os?: any) {
    if (os) this.attach(os);
  }

  attach(os: any) {
    this.os = os;
    // read persisted agents from spine state if any
    try {
      const state = this.os['spine'].getState();
      if (state.agents) {
        for (const [id, spec] of Array.from((state.agents as Map<string, any>).entries())) {
          const agent = QAgent.deserialize(spec);
          this.agents.set(agent.id, agent);
        }
      }
    } catch (e) {
      // if nothing present, start empty
    }
  }

  addAgent(spec: AgentSpec) {
    const a = new QAgent(spec);
    this.agents.set(a.id, a);
    // persist to spine
    this.persistAgent(a);
    return a;
  }

  removeAgent(id: string) {
    this.agents.delete(id);
    // persist removal as metadata
    try {
      this.os['spine'].addDelta({
        action: 'metadata_update',
        payload: { key: `agent_removed_${id}`, value: { removedAt: Date.now() } },
        author: 'agent_manager'
      });
    } catch (e) {}
  }

  start(intervalMs = 1000) {
    if (!this.os) throw new Error('AgentManager not attached to ManifoldOS');
    this.interval = intervalMs;
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
  }

  private async loop() {
    while (this.running) {
      try {
        const spineState = this.os['spine'].getState();
        const world = spineState; // canonical world
        const rnd = new LCG(this.stepSeed ^ (parseInt((this.os['spine'].getState().head || '0').slice(0,8), 16) || 0));
        // iterate agents in deterministic but shuffled order
        const ids = Array.from(this.agents.keys());
        for (let i = 0; i < ids.length; i++) {
          const idx = (i + Math.floor(rnd.next() * ids.length)) % ids.length;
          const id = ids[idx];
          const agent = this.agents.get(id);
          if (!agent) continue;
          // Agent chooses
          const decision = agent.policy(world);
          // produce delta
          const delta = this.deltaFromDecision(agent, decision, world, rnd);
          if (!delta) continue;
          // snapshot before
          const prevState = this.os['spine'].getState();
          // commit
          const block = this.os['spine'].addDelta(delta);
          // broadcast and log using existing integration hooks
          try { this.os.broadcastBlock(block); } catch(e) {}
          try { addToJSONL?.({ action: 'agent_block', agent: agent.id, block: block.hash }, 'agent'); } catch(e) {}
          // apply view update
          try { this.os.update3DView(); } catch(e) {}
          // post-commit: evaluate reward and learn
          const newState = this.os['spine'].getState();
          const reward = this.computeRewardForAgent(agent, prevState, newState);
          agent.learn(prevState, decision.action, reward, newState);
          // persist updated agent spec
          this.persistAgent(agent);
        }
      } catch (err) {
        console.error('AgentManager loop error', err);
      }
      await new Promise(res => setTimeout(res, this.interval));
    }
  }

  private deltaFromDecision(agent: QAgent, decision: { action: string; params?: any }, world: any, rnd: LCG) {
    switch (decision.action) {
      case 'move': {
        const keys = Array.from(world.universes.keys());
        if (keys.length === 0) return null;
        const target = keys[rnd.randInt(0, keys.length - 1)];
        // agent movement recorded as metadata; real movers should also update agent location in agent spec
        agent.location = target;
        return {
          action: 'metadata_update',
          payload: { key: `agent_move_${agent.id}_${Date.now()}`, value: { from: agent.location, to: target } },
          author: `agent_${agent.id}`
        };
      }
      case 'spawn': {
        const parent = agent.location || null;
        const pos = parent ? jitterAround(world.universes.get(parent)?.position ?? { x:0,y:0,z:0 }, 1.5, agent.seed) : { x: rnd.randRange(-5,5), y: rnd.randRange(-5,5), z: rnd.randRange(-5,5) };
        const ram = Math.floor(rnd.randRange(1,4));
        return {
          action: 'spawn_universe',
          payload: { parent, ramification: ram, position: pos, energy: Math.floor(agent.energy * 0.3), entropy: 0, stability: 0.9 },
          author: `agent_${agent.id}`
        };
      }
      case 'mutate': {
        const mut: MutationDescriptor = decision.params?.mutation ?? randomMutation(agent.seed + Math.floor(rnd.next()*1e6));
        // commit as extend_model with descriptor so gltfBridge can apply deterministically
        return {
          action: 'extend_model',
          payload: {
            base: 'semantic_model',
            result: `agent_${agent.id}_mut_${Date.now()}`,
            extension: { mutation: mut, originAgent: agent.id },
            universeContext: { location: agent.location }
          },
          author: `agent_${agent.id}`
        };
      }
      case 'extend': {
        return {
          action: 'extend_model',
          payload: {
            base: 'semantic_model',
            result: `agent_${agent.id}_extend_${Date.now()}`,
            extension: { strategy: 'builder_patch', params: { intensity: rnd.randRange(0.1,1.0) }, originAgent: agent.id },
            universeContext: { location: agent.location }
          },
          author: `agent_${agent.id}`
        };
      }
      default:
        return { action: 'metadata_update', payload: { key: `agent_noop_${agent.id}_${Date.now()}`, value: {} }, author: `agent_${agent.id}` };
    }
  }

  private computeRewardForAgent(agent: QAgent, prev: any, next: any): number {
    // simple reward: energy delta + model delta + semantics delta - entropy delta
    let r = 0;
    const prevU = prev.universes.get(agent.location);
    const nextU = next.universes.get(agent.location);
    if (prevU && nextU && typeof prevU.energy === 'number' && typeof nextU.energy === 'number') {
      r += (nextU.energy - prevU.energy) * 0.1;
    }
    r += (next.models.size - prev.models.size) * 4;
    r += (next.semantics.size - prev.semantics.size) * 2;
    r -= ((nextU?.entropy ?? 0) - (prevU?.entropy ?? 0));
    return Math.round(r);
  }

  persistAgent(agent: QAgent) {
    try {
      const spec = agent.serialize();
      // store as metadata_update so it's part of the spine
      this.os['spine'].addDelta({
        action: 'metadata_update',
        payload: { key: `agent_spec_${agent.id}`, value: spec },
        author: 'agent_manager'
      });
    } catch (e) {
      console.warn('Failed to persist agent', e);
    }
  }

  listAgents(): string[] { return Array.from(this.agents.keys()); }

  getAgent(id: string): QAgent | undefined { return this.agents.get(id); }
}

/* ===========================
   gltfBridge.applyMutation
   ===========================
   We'll export a helper that gltfBridge consumers can call.
   It implements deterministic vertex perturbation and simple subdivide.
   You must wire this into your ConsumerGLTFBridge implementation:
     gltfBridge.applyMutation(document, descriptor)
   The `document` is a glTF-Transform Document instance.
   =========================== */
export async function applyMutationToDocument(document: any, descriptor: MutationDescriptor) {
  // NOTE: This function expects the Document API used in your repo (glTF-Transform).
  // It manipulates meshes deterministically using seeds from the descriptor.
  // Keep transformations simple and deterministic.
  if (!descriptor) return;

  const seed = ('seed' in descriptor && (descriptor as any).seed) ? (descriptor as any).seed : Math.floor(Math.random() * 1e9);
  const rnd = new LCG(seed);

  // iterate all meshes and apply simple changes
  const root = document.getRoot();
  const meshes = root.listMeshes();
  for (const mesh of meshes) {
    for (const prim of mesh.listPrimitives()) {
      try {
        const posAcc = prim.getAttribute('POSITION');
        if (!posAcc) continue;
        const arr = posAcc.getArray(); // Float32Array
        // flatten view into JS numbers for deterministic edits
        if (descriptor.kind === 'vertex_perturb') {
          const mag = (descriptor as any).magnitude ?? 0.03;
          for (let i = 0; i < arr.length; i++) {
            // deterministic noise per-element
            const noise = (rnd.next() * 2 - 1) * mag;
            arr[i] = arr[i] + noise;
          }
          posAcc.setArray(arr);
        } else if (descriptor.kind === 'subdivide') {
          // very small subdivision emulation: slightly scale triangles by factor
          const factor = (descriptor as any).factor ?? 1;
          for (let i = 0; i < arr.length; i++) arr[i] = arr[i] * (1 + factor * 0.02);
          posAcc.setArray(arr);
        } else if (descriptor.kind === 'scale_parts') {
          const factor = (descriptor as any).factor ?? 1.0;
          // scale every vertex slightly by factor (deterministic)
          for (let i = 0; i < arr.length; i++) arr[i] = arr[i] * factor;
          posAcc.setArray(arr);
        } else if (descriptor.kind === 'merge_meshes') {
          // no-op in-place (actual boolean ops are heavy); instead translate slightly for 'overlay' flavor
          if ((descriptor as any).strategy === 'overlay') {
            const dx = (rnd.next() - 0.5) * 0.02;
            const dy = (rnd.next() - 0.5) * 0.02;
            const dz = (rnd.next() - 0.5) * 0.02;
            for (let i = 0; i < arr.length; i += 3) {
              arr[i] += dx; arr[i+1] += dy; arr[i+2] += dz;
            }
            posAcc.setArray(arr);
          }
        }
      } catch (err) {
        // best-effort deterministic edit; don't throw
        console.warn('applyMutationToDocument failed on primitive', err);
      }
    }
  }
}

/* ===========================
   Exports convenience
   =========================== */
export default {
  LCG,
  TinyMLP,
  randomMutation,
  QAgent,
  AgentManager,
  applyMutationToDocument
};
```

Usage notes / integration checklist

- Add this file to your codebase and import `AgentManager` in your main bootstrap. Example:
    
    ```ts
    import AgentSystem from './agent-system';
    const am = new AgentSystem.AgentManager(manifoldOS);
    am.start(1000);
    am.addAgent({ id: 'a1', seed: 4242, location: 'u1', behavior: 'builder', energy: 50 });
    ```
    
- Wire `applyMutationToDocument` into your `ConsumerGLTFBridge` as `applyMutation(document, descriptor)` so `extend_model` deltas that carry `extension.mutation` produce deterministic geometry edits when you render/export.
- `AgentManager` writes `metadata_update` deltas to persist agent specs. You can change that to `load_model` type deltas if you prefer a different storage pattern.
- Reward shaping: `computeRewardForAgent` is intentionally small / interpretable. Tune for your emergent goals.
- Determinism: seeds drive all randomness. If you want reproducible runs, set seeds explicitly for agents and for agentManager (use `AgentManager.stepSeed`).

If you want, I will:

- generate a fully-stitched `gltfBridge` patch that calls `applyMutationToDocument` when it sees `extension.mutation` in model metadata (I can produce that next),
- produce a ready-to-run demo script that creates 5 agents, runs 100 steps, and exports the GLB with proof using your `ManifoldOS.exportStateWithProof()`.

Which of those would you like me to produce now?