Nice — layering **Agent Learning (Q-learning)**, **Mutation Operators**, and **Embedded Neural Nets** is exactly the right combo to create _adaptive, creative, and individuated_ agents inside the manifold. Below I give a compact, practical, deterministic implementation plan plus copy-pasteable TypeScript you can drop into your existing codebase (integrates with `ManifoldOS`, `ManifoldEvolutionEngine`, and the cryptographic spine).

I emphasize determinism (seeded RNG), serialization (weights + policy stored as deltas), and safety (agents only act via the spine). Read through then paste the pieces you want.

---

# Plan (quick)

1. Small deterministic RNG (Linear Congruential Generator) for reproducible mutations and exploratory actions.
2. Tiny embedded neural net (MLP) class for agents — small, serializable weights, forward pass only. Training uses simple policy-gradient-ish or evolutionary mutation (lightweight).
3. Q-learning agent wrapper (`QLearnerAgent`) that can use discrete state keys (hash of local features) or consult the MLP as a policy. Q-table persisted in spine.
4. Mutation operators that generate _mutation descriptors_ (not raw geometry) and are applied by `extend_model` deltas (spine records mutation parameters which gltfBridge can turn into geometry).
5. Integration rules for `ManifoldEvolutionEngine`: agent loop step, learning update, mutation commit via `addDelta`.
6. Save agent NN weights and Q-table into the spine via `metadata_update` or `load_model`-style deltas so everything is verifiable/evolvable.

---

# Deterministic utilities (seeded RNG + serializer)

```ts
// deterministic.ts
export class LCG {
  // 32-bit LCG
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  next(): number {
    // constants from Numerical Recipes
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  randRange(a: number, b: number) { return a + (b - a) * this.next(); }
  randInt(a: number, b: number) { return Math.floor(this.randRange(a, b + 1)); }
  choice<T>(arr: T[]) { return arr[this.randInt(0, arr.length - 1)]; }
}

// simple deterministic hash for state -> key (use SHA256 from spine if available)
export function simpleKey(...parts: any[]): string {
  // stable JSON stringify
  return parts.map(p => JSON.stringify(p)).join('|');
}
```

---

# Tiny MLP (serializable, deterministic)

```ts
// mlp.ts
import { LCG } from './deterministic';

export type Tensor = number[];

export class TinyMLP {
  layers: number[]; // e.g. [nIn, nHidden, nOut]
  weights: number[][]; // flattened weight arrays per layer (row-major)
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
      const inN = this.layers[i], outN = this.layers[i + 1];
      const W: number[] = new Array(inN * outN).fill(0).map(() => (rnd.next() * 2 - 1) * 0.5);
      const B: number[] = new Array(outN).fill(0).map(() => (rnd.next() * 2 - 1) * 0.1);
      this.weights.push(W);
      this.biases.push(B);
    }
  }

  forward(x: Tensor): Tensor {
    let a = x.slice();
    for (let l = 0; l < this.weights.length; l++) {
      const W = this.weights[l], b = this.biases[l];
      const inN = this.layers[l], outN = this.layers[l + 1];
      const out: number[] = new Array(outN).fill(0);
      for (let j = 0; j < outN; j++) {
        let s = b[j];
        for (let i = 0; i < inN; i++) s += a[i] * W[j * inN + i];
        // activation: tanh for hidden, softmax handled outside for policy
        out[j] = (l < this.weights.length - 1) ? Math.tanh(s) : s;
      }
      a = out;
    }
    return a;
  }

  // mutate weights (used by evolutionary update)
  mutate(rate = 0.02, scale = 0.1, seed?: number) {
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

  serialize(): any {
    return { layers: this.layers, weights: this.weights, biases: this.biases, seed: this.rngSeed };
  }

  static deserialize(obj: any): TinyMLP {
    const net = new TinyMLP(obj.layers, obj.seed ?? 1337);
    net.weights = obj.weights;
    net.biases = obj.biases;
    return net;
  }
}
```

---

# Mutation Operators (produce mutation descriptors, deterministic)

We avoid editing raw geometry directly inside the engine — instead, produce a mutation descriptor stored in a delta. `gltfBridge` will interpret descriptors into geometry edits when applying an `extend_model` delta.

```ts
// mutation_ops.ts
import { LCG } from './deterministic';

export type MutationDescriptor =
  | { kind: 'vertex_perturb'; magnitude: number; seed: number }
  | { kind: 'subdivide'; factor: number; seed: number }
  | { kind: 'merge_meshes'; strategy: 'overlay' | 'boolean_union' }
  | { kind: 'scale_parts'; factor: number; selector?: string };

export function randomMutation(seed: number): MutationDescriptor {
  const rnd = new LCG(seed);
  const roll = rnd.next();
  if (roll < 0.4) return { kind: 'vertex_perturb', magnitude: rnd.randRange(0.01, 0.15), seed };
  if (roll < 0.7) return { kind: 'subdivide', factor: rnd.randInt(1, 2), seed };
  if (roll < 0.9) return { kind: 'scale_parts', factor: rnd.randRange(0.8, 1.4), selector: 'high_valence' , seed };
  return { kind: 'merge_meshes', strategy: rnd.choice(['overlay','boolean_union']) };
}
```

On the `gltfBridge` side (consumer), implement a deterministic apply:

```ts
// in gltfBridge.applyMutation(document, mutation)
// - vertex_perturb: iterate vertices in deterministic order, add noise via LCG(seed)
// - subdivide: perform limited subdivision
// - scale_parts: scale subsets by selector heuristics
```

(You already have gltfBridge; add `applyMutation(document, descriptor)` that uses the descriptor to mutate meshes. Store the descriptor in `extendedModel.metadata.mutation` so proof exists.)

---

# Q-learning Agent + Policy mixing with MLP

We combine tabular Q for discretized states + MLP policy for continuous decisions. The agent will use Q for high-level choices (spawn, mutate, move) and MLP for parameter selection.

```ts
// agent.ts
import { TinyMLP } from './mlp';
import { LCG, simpleKey } from './deterministic';
import { randomMutation, MutationDescriptor } from './mutation_ops';

export type AgentSpec = {
  id: string;
  seed: number;
  location: string;
  behavior: 'wander'|'builder'|'predator'|'miner';
  qtable?: Record<string, Record<string, number>>; // stateKey → action → Q
  net?: any; // serialized TinyMLP
  energy: number;
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

  alpha = 0.2; // learning rate
  gamma = 0.9; // discount
  epsilon = 0.15; // epsilon-greedy exploration

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

  // create a compact state key from local features
  stateKey(world: any): string {
    const loc = world.universes.get(this.location);
    const key = simpleKey(this.location, Math.floor(loc?.energy ?? 0 / 10), Math.floor(loc?.entropy ?? 0 / 10), Math.floor(this.energy / 10));
    return key;
  }

  policy(world: any): { action: string; params?: any } {
    const key = this.stateKey(world);
    this.qtable[key] = this.qtable[key] ?? Object.fromEntries(this.actions.map(a => [a, 0]));
    // epsilon-greedy
    if (this.rng.next() < this.epsilon) {
      const a = this.rng.choice(this.actions);
      return { action: a };
    }
    // choose max Q, ties random
    const action = Object.entries(this.qtable[key]).reduce((best, [a,q]) => {
      if (q > best.q) return { a, q }; if (q === best.q && this.rng.next() < 0.5) return { a, q }; return best;
    }, { a: this.actions[0], q: -Infinity }).a;

    // parameters from MLP: feed features -> outputs
    const features = this.features(world);
    const raw = this.net.forward(features);
    // interpret raw outputs as param selectors
    const paramSeed = Math.floor((raw[0] + 1) * 1e6) + this.seed;
    const mut = randomMutation(paramSeed);
    return { action, params: { mutation: mut, paramSeed } };
  }

  features(world: any): number[] {
    // small deterministic feature vector: local energy, entropy, degree, agent energy
    const u = world.universes.get(this.location);
    const e = (u?.energy ?? 0) / 100;
    const ent = (u?.entropy ?? 0) / 100;
    const deg = ((u?.ramification ?? 1) - 1) / 4;
    const ae = (this.energy ?? 0) / 100;
    return [e, ent, deg, ae];
  }

  // after reward observed, update Q-table (tabular)
  learn(world: any, action: string, reward: number, nextWorld: any) {
    const sk = this.stateKey(world);
    const sk2 = this.stateKey(nextWorld);
    this.qtable[sk] = this.qtable[sk] ?? Object.fromEntries(this.actions.map(a => [a, 0]));
    this.qtable[sk2] = this.qtable[sk2] ?? Object.fromEntries(this.actions.map(a => [a, 0]));

    const q = this.qtable[sk][action];
    const maxNext = Math.max(...Object.values(this.qtable[sk2]));
    const target = reward + this.gamma * maxNext;
    this.qtable[sk][action] = q + this.alpha * (target - q);

    // lightweight evolutionary update of net if reward high
    if (reward > 5) this.net.mutate(0.05, 0.02, this.seed + Math.floor(Math.random()*10000));
  }

  // serialize agent for storing in spine
  serialize(): AgentSpec {
    return { id: this.id, seed: this.seed, location: this.location, behavior: this.behavior, qtable: this.qtable, net: this.net.serialize(), energy: this.energy };
  }
}
```

---

# Integration: Agent step rule and mutation commit

Add to `ManifoldEvolutionEngine` rules: agent step will ask each agent to select action, then produce spine deltas for actions. Learning updates happen after the resulting block is applied (use reward function based on energy change, new geometry value, or survival).

```ts
// in ManifoldEvolutionEngine.loadDefaultRules()
this.rules.push({
  name: 'agent_brain_step',
  condition: (state) => state.agents && state.agents.size > 0,
  produce: (state) => {
    // pick a random agent, deterministic by seed sequence
    const agents = Array.from((state.agents as Map<string, any>).values());
    const rnd = new LCG( (state.head && state.head.length) ? parseInt(state.head.slice(0,8),16) : 12345 );
    const agentObj = rnd.choice(agents);
    const agent = new QAgent(agentObj); // or rehydrate from serialized spec

    const decision = agent.policy(state);
    switch (decision.action) {
      case 'move':
        // choose target universe
        const keys = Array.from(state.universes.keys());
        const target = keys[rnd.randInt(0, keys.length-1)];
        return {
          action: 'metadata_update',
          payload: { key: `agent_move_${agent.id}_${Date.now()}`, value: { from: agent.location, to: target } },
          author: `agent_${agent.id}`
        };
      case 'spawn':
        return {
          action: 'spawn_universe',
          payload: {
            parent: agent.location,
            ramification: Math.floor(rnd.randRange(1,4)),
            position: jitterAround( state.universes.get(agent.location).position, 1.2 ),
            energy: Math.floor(agent.energy * 0.3),
            entropy: 0,
            stability: 0.9
          },
          author: `agent_${agent.id}`
        };
      case 'mutate':
        const mut: MutationDescriptor = decision.params?.mutation ?? randomMutation(agent.seed);
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
      case 'extend':
        return {
          action: 'extend_model',
          payload: {
            base: 'semantic_model',
            result: `agent_${agent.id}_extend_${Date.now()}`,
            extension: { strategy: 'builder_patch', params: { intensity: rnd.randRange(0.1, 1.0) } },
            universeContext: { location: agent.location }
          },
          author: `agent_${agent.id}`
        };
      default:
        return { action: 'metadata_update', payload: { key: `agent_noop_${agent.id}_${Date.now()}`, value: {} }, author: `agent_${agent.id}` };
    }
  }
});
```

After `addDelta` commits the block, run reward evaluation and `agent.learn(...)`:

```ts
// After commit in the evolution loop
const prevState = worldSnapshot; // world before block applied
const block = this.os['spine'].addDelta(delta);
this.os.broadcastBlock(block);
this.os.update3DView(); // apply
const newState = this.os['spine'].getState();
const reward = computeRewardForAgent(agent, prevState, newState);
agent.learn(prevState, chosenAction, reward, newState);

// then persist updated agent spec back into spine
this.os['spine'].addDelta({
  action: 'metadata_update',
  payload: { key: `agent_spec_${agent.id}`, value: agent.serialize() },
  author: 'autonomous_engine'
});
```

`computeRewardForAgent` can be simple: energy gained by agent, increased universe stability, successful model extension (measure by metadata like triangles added), survival, or semantic novelty (new clause count).

---

# Reward examples (simple)

```ts
function computeRewardForAgent(agent: QAgent, prev: WorldState, next: WorldState): number {
  const prevU = prev.universes.get(agent.location);
  const nextU = next.universes.get(agent.location);
  let r = 0;
  if (nextU?.energy && prevU?.energy) r += (nextU.energy - prevU.energy) * 0.1;
  // reward for model novelty
  r += (next.models.size - prev.models.size) * 5;
  // small reward for producing semantics
  r += (next.semantics.size - prev.semantics.size) * 3;
  // penalty for increasing entropy in same location
  r -= (nextU?.entropy ?? 0) - (prevU?.entropy ?? 0);
  return Math.round(r);
}
```

---

# Persistence & Provenance

- Agents serialize their Q-tables + nets into `metadata_update` deltas so their learning is part of the cryptographic history.
- Mutations are stored as descriptors in model metadata. The gltfBridge applies descriptors deterministically when rendering or exporting, so the GLB contains both geometry and exact mutation provenance.

---

# Safety & Performance notes

- Keep MLP extremely tiny (e.g., 4 → 8 → actionCount). Larger nets are slow to mutate/serialize and harder to reproduce deterministically.
- Q-table can explode if state keys are high-cardinality — discretize features aggressively.
- Training backprop inside the spine would produce non-determinism if randomness not seeded; prefer small evolutionary updates + Q-learning for stability.
- Limit mutation intensity and apply deterministic seeds to keep geometry deterministic and verifiable.

---

# Example: Putting it together (usage)

1. Add `TinyMLP`, `QAgent`, `mutation_ops`, `deterministic` files to codebase.
2. Ensure `state.agents` is a `Map<string, AgentSpec>` in `WorldState` and migrated at startup.
3. Add the `agent_brain_step` rule to `ManifoldEvolutionEngine`.
4. Start `evolution.start()` inside `ManifoldOS`.
5. Observe agents generating deltas; blocks appear in the spine; GLTF exports include proofs and mutations.

---

# Quick realistic example (single evolution cycle)

- Agent at `U42` with energy 60 chooses `mutate` (epsilon-greedy).
- The agent’s MLP outputs a seed, `mutation_ops.randomMutation(seed)` yields `{vertex_perturb, magnitude:0.05}`.
- Engine creates `extend_model` delta with `extension.mutation` descriptor.
- Spine adds block, signed by the agent/engine.
- `gltfBridge.applyMutation` deterministically perturbs vertices using the provided seed and magnitude.
- After rendered, compute reward; agent Q-table updated; agent net mutated a little.
- Updated agent spec stored back in spine as `metadata_update` (weights + qtable). All steps are cryptographically provable.

---

# Next steps I can deliver for you right now (pick any/all)

- A full file `agent-system.ts` that contains `TinyMLP`, `QAgent`, `mutation_ops`, and integration hooks wired to `ManifoldOS` (ready to paste).
- `gltfBridge.applyMutation(document, descriptor)` implementation for deterministic vertex perturb / simple subdivide.
- A stitched example that shows an evolution run of N steps and then exports GLB with proof.
- Visual debugging tools: history playback timeline to watch agent-driven mutations over time.

Which of those would you like me to generate now? I can produce the full `agent-system.ts` and `gltfBridge.applyMutation` in one response so you can drop them straight into your code.