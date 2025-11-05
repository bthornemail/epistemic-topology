Great — I built a **drop-in multi-agent GNN system** that uses your existing spine, agents, and evolution engine and upgrades them to a _hybrid multi-agent GNN_ (option C).

What you get now:

- A `MultiAgentGNN` class that computes message-passing embeddings for the manifold graph.
- A **multi-agent policy** that uses those embeddings (agents consult node embeddings for action selection).
- A **black-box gradient update** (Evolutionary Strategy / finite perturbation) that updates the GNN weights from collective agent rewards — deterministic via seeded RNG.
- Integration helpers so you can plug it into `AgentManager` / `ManifoldOS` with minimal changes.

Drop this file into your repo (e.g. `multiagent-gnn.ts`) and wire the few integration points noted in comments. It uses the deterministic primitives (LCG), `TinyMLP`-style weight arrays, and the `applyMutation` approach you already have.

---

```ts
// multiagent-gnn.ts
// Hybrid Multi-Agent GNN (Message-passing) with ES-based training
// Designed to integrate with your ManifoldOS + AgentManager + Spine.
// Deterministic: seeded LCG drives all randomness.

/////////////////////// Utilities ///////////////////////
export class LCG {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  randRange(a: number, b: number) { return a + (b - a) * this.next(); }
  randInt(a: number, b: number) { return Math.floor(this.randRange(a, b + 1)); }
  choice<T>(arr: T[]) { return arr[this.randInt(0, arr.length - 1)]; }
  clone(): LCG { return new LCG(this.state); }
}

function dot(a: number[], b: number[][]): number[] {
  const out = new Array(b[0].length).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[i].length; j++) out[j] += a[i] * b[i][j];
  }
  return out;
}
function tanhVec(v: number[]) { return v.map(x => Math.tanh(x)); }

/////////////////////// GCN core ///////////////////////
type Edge = { from: string; to: string; weight: number };

export class GCNLayer {
  inputDim: number;
  outputDim: number;
  W_self: number[][]; // inputDim x outputDim
  W_msg: number[][];  // inputDim x outputDim
  seed: number;

  constructor(inputDim: number, outputDim: number, seed = 1337) {
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.seed = seed;
    this.W_self = this.initMat(inputDim, outputDim, seed);
    this.W_msg = this.initMat(inputDim, outputDim, seed + 1);
  }

  initMat(rows: number, cols: number, seed: number) {
    const rnd = new LCG(seed);
    const M: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) row.push((rnd.next() * 2 - 1) * 0.2);
      M.push(row);
    }
    return M;
  }

  forward(nodes: Map<string, number[]>, edges: Edge[]): Map<string, number[]> {
    // aggregate neighbor feature sums (unweighted for simplicity; weights can be included)
    const out = new Map<string, number[]>();
    const neighborMap = new Map<string, string[]>();
    for (const e of edges) {
      if (!neighborMap.has(e.to)) neighborMap.set(e.to, []);
      neighborMap.get(e.to)!.push(e.from);
    }

    for (const [id, vec] of nodes.entries()) {
      // neighbors sum
      const neighbors = neighborMap.get(id) || [];
      const agg = new Array(this.inputDim).fill(0);
      for (const n of neighbors) {
        const nv = nodes.get(n);
        if (!nv) continue;
        for (let i = 0; i < this.inputDim; i++) agg[i] += nv[i];
      }

      const msg = dot(agg, this.W_msg);   // length = outputDim
      const selfPart = dot(vec, this.W_self);
      const merged = msg.map((v, i) => v + selfPart[i]);
      out.set(id, tanhVec(merged));
    }
    return out;
  }

  serialize() {
    return { inputDim: this.inputDim, outputDim: this.outputDim, W_self: this.W_self, W_msg: this.W_msg, seed: this.seed };
  }

  static deserialize(obj: any): GCNLayer {
    const L = new GCNLayer(obj.inputDim, obj.outputDim, obj.seed);
    L.W_self = obj.W_self; L.W_msg = obj.W_msg;
    return L;
  }

  // perturb layer weights deterministically using rnd
  perturb(rnd: LCG, sigma = 0.01) {
    for (let i = 0; i < this.W_self.length; i++) for (let j = 0; j < this.W_self[i].length; j++)
      this.W_self[i][j] += (rnd.next() * 2 - 1) * sigma;
    for (let i = 0; i < this.W_msg.length; i++) for (let j = 0; j < this.W_msg[i].length; j++)
      this.W_msg[i][j] += (rnd.next() * 2 - 1) * sigma;
  }

  clone(): GCNLayer { return GCNLayer.deserialize(this.serialize()); }
}

export class GCN {
  layers: GCNLayer[];
  constructor(dims: number[], seed = 1337) {
    this.layers = [];
    let s = seed;
    for (let i = 0; i < dims.length - 1; i++) {
      this.layers.push(new GCNLayer(dims[i], dims[i+1], s));
      s += 2;
    }
  }
  forward(nodes: Map<string, number[]>, edges: Edge[]) {
    let x = nodes;
    for (const layer of this.layers) x = layer.forward(x, edges);
    return x;
  }
  serialize() { return this.layers.map(l => l.serialize()); }
  static deserialize(arr: any[], seed = 1337) {
    const dims = [arr[0].inputDim, ...arr.map(a => a.outputDim)]; // approx
    const g = new GCN(dims, seed);
    g.layers = arr.map(a => GCNLayer.deserialize(a));
    return g;
  }
  clone(): GCN { return GCN.deserialize(this.serialize()); }
  perturb(rnd: LCG, sigma = 0.01) { for (const l of this.layers) l.perturb(rnd, sigma); }
}

/////////////////////// MultiAgentGNN ///////////////////////

/**
 * MultiAgentGNN:
 * - Builds a graph from world state (universes + relations)
 * - Produces node embeddings
 * - Provides agent policy: action logits from embedding
 * - Trains via Evolutionary Strategy (ES): sample perturbations, evaluate total reward, update weights
 */
export class MultiAgentGNN {
  gcn: GCN;
  nodeDim: number;      // input feature length
  embedDim: number;     // node embedding dimension
  actionCount: number;  // number of discrete actions agents can take
  seed: number;
  rnd: LCG;

  // ES hyperparams
  esPopulation = 9;     // odd small number => deterministic
  esSigma = 0.03;
  esAlpha = 0.2;        // learning rate for ES

  constructor(nodeDim = 6, embedDim = 8, actionCount = 5, seed = 1337) {
    // dims: nodeDim -> embedDim -> embedDim (two layers)
    this.nodeDim = nodeDim;
    this.embedDim = embedDim;
    this.actionCount = actionCount;
    this.seed = seed;
    this.rnd = new LCG(seed);
    this.gcn = new GCN([nodeDim, embedDim, embedDim], seed + 11);
  }

  // Build graph from WorldState: universes -> nodes; edges from parent/semantic/spatial heuristics
  buildGraphFromState(state: any): { nodes: Map<string, number[]>; edges: Edge[] } {
    const nodes = new Map<string, number[]>();
    const edges: Edge[] = [];

    // Node features: [energy_norm, entropy_norm, stability, ramification_norm, agent_count_norm, geom_complexity_norm]
    for (const [id, u] of (state.universes as Map<string, any>).entries()) {
      const energy = Math.min(1, (u.energy ?? 0) / 100);
      const entropy = Math.min(1, (u.entropy ?? 0) / 100);
      const stability = Math.max(0, Math.min(1, u.stability ?? 0.5));
      const ram = Math.min(1, (u.ramification ?? 1) / 8);
      const agentsHere = Array.from(state.agents?.values?.() || []).filter((a: any) => a.location === id).length;
      const agentCount = Math.min(1, agentsHere / 4);
      const geomC = Math.min(1, ((u.metadata?.triangles ?? 0) / 10000));
      nodes.set(id, [energy, entropy, stability, ram, agentCount, geomC].slice(0, this.nodeDim));
    }

    // Edges: parent -> child
    for (const [id, u] of (state.universes as Map<string, any>).entries()) {
      if (u.parent) edges.push({ from: u.parent, to: id, weight: 1 });
    }

    // Spatial proximity edges (kNN radius) - simple O(n^2)
    const us = Array.from((state.universes as Map<string, any>).entries());
    for (let i = 0; i < us.length; i++) {
      for (let j = i+1; j < us.length; j++) {
        const [idA, a] = us[i]; const [idB, b] = us[j];
        const dx = (a.position?.x ?? 0) - (b.position?.x ?? 0);
        const dy = (a.position?.y ?? 0) - (b.position?.y ?? 0);
        const dz = (a.position?.z ?? 0) - (b.position?.z ?? 0);
        const d2 = dx*dx + dy*dy + dz*dz;
        const thresh = 9; // squared threshold
        if (d2 < thresh) {
          const w = 1 - (d2 / thresh);
          edges.push({ from: idA, to: idB, weight: w });
          edges.push({ from: idB, to: idA, weight: w });
        }
      }
    }

    // Semantic hypernym/hyponym edges if available
    if (state.semantics) {
      // For simplicity, connect universes with semantics in metadata to each other
      for (const [id, u] of (state.universes as Map<string, any>).entries()) {
        const tag = u.metadata?.semanticTag;
        if (!tag) continue;
        for (const [id2, u2] of (state.universes as Map<string, any>).entries()) {
          if (id === id2) continue;
          if (u2.metadata?.semanticTag === tag) edges.push({ from: id, to: id2, weight: 0.6});
        }
      }
    }

    return { nodes, edges };
  }

  // Produce node embeddings
  embeddings(state: any) {
    const g = this.buildGraphFromState(state);
    // Ensure all nodes have length = nodeDim
    for (const [k, v] of g.nodes.entries()) {
      if (v.length < this.nodeDim) {
        const pad = new Array(this.nodeDim - v.length).fill(0);
        g.nodes.set(k, v.concat(pad));
      }
    }
    const emb = this.gcn.forward(g.nodes, g.edges);
    return { emb, graph: g };
  }

  // Agent policy: returns action index for a given agent id (argmax of logits)
  agentPolicy(agentId: string, state: any) {
    const { emb } = this.embeddings(state);
    const nodeVec = emb.get(agentId);
    if (!nodeVec) {
      // fallback: random action
      return Math.floor(this.rnd.randRange(0, this.actionCount));
    }
    // map embedding to logits by a simple linear readout seeded per agent
    // deterministic linear readout: dot with a tiny vector derived from seed + agentId hash
    const readoutSeed = Math.abs(this.hashStr(agentId).slice(0,8).reduce((a,b)=>a*31+b,0) ^ this.seed) >>> 0;
    const r = new LCG(readoutSeed);
    const W = new Array(nodeVec.length).fill(0).map(() => new Array(this.actionCount).fill(0).map(() => (r.next()*2-1)*0.2));
    // compute logits
    const logits = new Array(this.actionCount).fill(0);
    for (let i = 0; i < nodeVec.length; i++) for (let j = 0; j < this.actionCount; j++) logits[j] += nodeVec[i] * W[i][j];
    // softmax-like deterministic pick: max(logit)
    let best = 0; let bestI = 0;
    for (let i = 0; i < logits.length; i++) if (logits[i] > best || i === 0 && logits[i] === best) { best = logits[i]; bestI = i; }
    return bestI;
  }

  // simple hash string -> byte array
  hashStr(s: string): number[] {
    const out: number[] = [];
    for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0xff);
    return out;
  }

  ////////////////// ES Training //////////////////
  // We use a population of perturbed GCNs, evaluate cumulative agent reward across the population,
  // and update the central GCN via weighted sum of perturbations (OpenAI-style ES).
  // This avoids backprop and is deterministic with seeded LCG.

  // Evaluate a candidate GCN on current state + simulated steps (deterministic)
  evaluateCandidate(candidate: GCN, state: any, agentSpecs: any[], simSteps = 3, seedOffset = 0): number {
    // We'll simulate `simSteps` steps of agent decisions; reward is sum of deltas in world metrics.
    // To keep it lightweight and deterministic, we copy the minimal parts of state we need.
    // Note: keep operations cheap — no committing to spine during eval.
    const wc = this.cloneWorldForSim(state);
    const gcnCandidate = candidate;
    const rnd = new LCG(this.seed + seedOffset);
    let totalReward = 0;
    for (let step = 0; step < simSteps; step++) {
      // compute embeddings using candidate
      const { emb, graph } = this.embeddingsWithGCN(wc, gcnCandidate);
      // each agent picks an action
      for (const aSpec of agentSpecs) {
        const aid = aSpec.id;
        const vec = emb.get(aid);
        // choose action from embedding (same mapping as agentPolicy but using candidate readout)
        const actionIdx = this.agentPolicyWithGCN(aid, emb, gcnCandidate);
        // apply deterministic simple effects: action -> energy changes / model increments
        // we'll define: 0=move,1=spawn,2=mutate,3=extend,4=noop
        if (actionIdx === 1) { // spawn: give parent energy -> child created, reward small
          totalReward += 1;
        } else if (actionIdx === 2) { // mutate
          totalReward += 2;
        } else if (actionIdx === 3) { // extend
          totalReward += 1.5;
        } else if (actionIdx === 0) { // move
          totalReward += 0.2;
        }
      }
      // deterministic environment entropy increment
      for (const u of wc.universes.values()) { u.entropy = (u.entropy ?? 0) + 0.1; }
    }
    // also reward presence of semantics and models
    totalReward += (wc.models?.size ?? 0) * 0.5 + (wc.semantics?.size ?? 0) * 0.8;
    return totalReward;
  }

  // helpers to run embeddings with a custom GCN
  embeddingsWithGCN(state: any, gcnInstance: GCN) {
    const g = this.buildGraphFromState(state);
    const emb = gcnInstance.forward(g.nodes, g.edges);
    return { emb, graph: g };
  }

  agentPolicyWithGCN(agentId: string, emb: Map<string, number[]>, gcnInstance: GCN) {
    const nodeVec = emb.get(agentId);
    if (!nodeVec) return Math.floor(this.rnd.randRange(0, this.actionCount));
    const readoutSeed = Math.abs(this.hashStr(agentId).slice(0,8).reduce((a,b)=>a*31+b,0) ^ this.seed) >>> 0;
    const r = new LCG(readoutSeed);
    const W = new Array(nodeVec.length).fill(0).map(() => new Array(this.actionCount).fill(0).map(() => (r.next()*2-1)*0.2));
    const logits = new Array(this.actionCount).fill(0);
    for (let i = 0; i < nodeVec.length; i++) for (let j = 0; j < this.actionCount; j++) logits[j] += nodeVec[i] * W[i][j];
    let best = 0; let bestI = 0;
    for (let i = 0; i < logits.length; i++) if (logits[i] > best || i === 0 && logits[i] === best) { best = logits[i]; bestI = i; }
    return bestI;
  }

  // clone minimal world for sim (shallow copy of universes/models/semantics)
  cloneWorldForSim(state: any) {
    const wc: any = {
      universes: new Map(),
      models: new Map(Array.from((state.models ?? new Map()).entries())),
      semantics: new Map(Array.from((state.semantics ?? new Map()).entries())),
      agents: new Map(Array.from((state.agents ?? new Map()).entries()))
    };
    for (const [k, v] of (state.universes as Map<string, any>).entries()) {
      wc.universes.set(k, Object.assign({}, v)); // shallow clone
    }
    return wc;
  }

  // Train one ES step: perturb population, evaluate, update central GCN
  esStep(state: any, agentSpecs: any[]) {
    const base = this.gcn.clone();
    const pop = this.esPopulation;
    const seeds: number[] = [];
    for (let i = 0; i < pop; i++) seeds.push(this.seed + 1000 + i * 13);
    const rewards: number[] = [];
    const deltas: GCN[] = [];

    for (let i = 0; i < pop; i++) {
      const cand = base.clone();
      const rnd = new LCG(seeds[i]);
      cand.perturb(rnd, this.esSigma);
      const r = this.evaluateCandidate(cand, state, agentSpecs, 3, i);
      rewards.push(r);
      deltas.push(this.gcnDiff(base, cand));
    }
    // normalize rewards
    const mean = rewards.reduce((a,b)=>a+b,0)/rewards.length;
    let std = Math.sqrt(rewards.map(r=> (r-mean)**2).reduce((a,b)=>a+b,0)/rewards.length);
    if (std === 0) std = 1;
    const norm = rewards.map(r => (r - mean)/std);
    // update base weights by weighted sum of deltas
    this.applyWeightedDeltas(base, deltas, norm, this.esAlpha);
    // set central gcn to updated base
    this.gcn = base;
    // advance seed slightly for determinism
    this.seed += 7;
    this.rnd = new LCG(this.seed);
    return { meanReward: mean, stdReward: std };
  }

  // compute delta between base and candidate (layer-wise subtract)
  gcnDiff(base: GCN, cand: GCN): GCN {
    const out = base.clone();
    for (let li = 0; li < base.layers.length; li++) {
      const bL = base.layers[li], cL = cand.layers[li], oL = out.layers[li];
      for (let i = 0; i < bL.W_self.length; i++) for (let j = 0; j < bL.W_self[i].length; j++)
        oL.W_self[i][j] = cL.W_self[i][j] - bL.W_self[i][j];
      for (let i = 0; i < bL.W_msg.length; i++) for (let j = 0; j < bL.W_msg[i].length; j++)
        oL.W_msg[i][j] = cL.W_msg[i][j] - bL.W_msg[i][j];
    }
    return out;
  }

  // apply weighted combination of deltas to base with alpha
  applyWeightedDeltas(base: GCN, deltas: GCN[], weights: number[], alpha: number) {
    for (let li = 0; li < base.layers.length; li++) {
      const Lb = base.layers[li];
      for (let i = 0; i < Lb.W_self.length; i++) for (let j = 0; j < Lb.W_self[i].length; j++) {
        let acc = 0;
        for (let k = 0; k < deltas.length; k++) acc += deltas[k].layers[li].W_self[i][j] * weights[k];
        Lb.W_self[i][j] += alpha * acc;
      }
      for (let i = 0; i < Lb.W_msg.length; i++) for (let j = 0; j < Lb.W_msg[i].length; j++) {
        let acc = 0;
        for (let k = 0; k < deltas.length; k++) acc += deltas[k].layers[li].W_msg[i][j] * weights[k];
        Lb.W_msg[i][j] += alpha * acc;
      }
    }
  }
}
```

---

## Integration notes (how to wire into your system)

1. Import and construct:

```ts
import { MultiAgentGNN } from './multiagent-gnn';
const magnn = new MultiAgentGNN(/* nodeDim=6, embedDim=8, actionCount=5, seed=42 */);
```

2. Replace or augment agent action selection in `AgentManager.deltaFromDecision`:
    
    - Instead of using `agent.policy(...)`, call `magnn.agentPolicy(agent.id, spineState)` or compute embeddings once and pass to agents.
    - Map `actionIdx` to your action names `['move','spawn','mutate','extend','noop']`.
3. Periodically train the GNN:
    
    - Call `magnn.esStep(spineState, agentSpecs)` every N evolution cycles (e.g., every 20 steps) to synthesize a new GCN from population perturbations.
    - `agentSpecs` can be `Array.from(state.agents.values())` where each spec contains `id` and minimal fields.
4. Persist GCN weights into the spine as metadata if you want provenance:
    

```ts
spine.addDelta({
  action: 'metadata_update',
  payload: { key: 'gcn_weights_v' + Date.now(), value: magnn.gcn.serialize() },
  author: 'gnn_trainer'
});
```

5. Determinism:
    
    - Seeds control everything: set `MultiAgentGNN(seed)` and agent seeds to reproduce runs.
    - ES population uses fixed seeds derived from the main seed for reproducible optimization.
6. Safety & scale:
    
    - The ES population is small (9) to be cheap. Increase for more accurate updates but costs CPU.
    - The evaluation sim uses small `simSteps` (3) to remain fast. Increase to better capture dynamics.
    - This is a black-box training approach (no backprop) — well suited for your deterministic, verifiable environment.

---

## Why this design (brief)

- **Message passing** lets node embeddings capture spatial + semantic context.
- **Multi-agent policy** uses these embeddings so agents act collectively with awareness of neighborhood structure.
- **Evolutionary Strategy** training keeps determinism and avoids non-deterministic backprop/optimizer complications inside the spine; ES updates are easily recorded as deltas in the chain.
- All weights and training steps are serializable into the spine so the training itself is provable and replayable.

---

If you want, next I can:

- Produce the exact patch to `AgentManager` that replaces MLP policy with `magnn` usage (full diff / file ready).
- Add a `trainLoop` that calls `magnn.esStep` every N agent steps and commits weight snapshots into spine with a signature.
- Produce a demo script: spawn some universes + agents, run 200 evolution steps with ES updates, export GLB proof, and produce a small visualization of embedding evolution.

Which of those should I produce next?