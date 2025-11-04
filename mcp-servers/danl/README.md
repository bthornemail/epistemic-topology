# DANL MCP Server

**Model Context Protocol server for Decentralized Automaton Network Lattice**

Version: 1.0.0
HD Address: `m/0x44414E4C'/0x00000001'/0'/0/0`
RPC Endpoint: `tcp://localhost:3000/danl/base/0`

---

## Overview

The DANL MCP Server exposes DANL (Decentralized Automaton Network Lattice) capabilities via the Model Context Protocol. It provides:

- **Lattice Operations**: join, meet, blend over five-level epistemic certainty lattice
- **Network Simulation**: Execute distributed consensus with fixpoint detection
- **Observable Parameterization**: τ-coefficient tracking for implicit knowledge
- **M/S-Expression Evaluation**: Homoiconic meta/structural duality
- **HD Addressing**: Hierarchical Deterministic federated identity
- **Hyperbolic Positioning**: Geometric routing in Poincaré ball

This server bridges the Scheme implementation of DANL with MCP clients (like Claude Code).

---

## Installation

```bash
cd mcp-servers/danl

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start
```

### Prerequisites

- **Node.js** >= 18.0.0
- **Scheme Interpreter**: Guile (preferred) or Racket
  ```bash
  # Install Guile
  sudo apt install guile-3.0  # Debian/Ubuntu
  brew install guile          # macOS

  # Or Racket
  sudo apt install racket
  brew install racket
  ```

- **DANL Scheme Implementation**: Located at `../../decentralized_automaton_network/scheme/danl.scm`

---

## Architecture

```
┌─────────────────────────────────────────┐
│  MCP Client (Claude Code)              │
└──────────────┬──────────────────────────┘
               │ JSON-RPC 2.0
               │
┌──────────────▼──────────────────────────┐
│  DANL MCP Server                        │
│  - Tools (8 tools)                      │
│  - Resources (5 resources)              │
│  - HD Address: m/0x44414E4C'/...        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Scheme Bridge                          │
│  - Executes Guile/Racket                │
│  - Parses JSON output                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  DANL Scheme Implementation             │
│  - danl.scm (329 lines)                 │
│  - Lattice operations                   │
│  - Y/Z combinators                      │
│  - Fixpoint detection                   │
└─────────────────────────────────────────┘
```

---

## Tools

### 1. `mcp__danl__simulate_network`

Simulate DANL network until convergence.

**Input:**
```typescript
{
  nodes: Array<{
    name: string;
    state: 'bottom' | 'potential' | 'active' | 'confident' | 'top';
    tauCoefficient?: number;  // default: 1.0
    neighbors?: string[];     // default: []
    transition?: string;      // default: 'propagate-belief-ms'
    attributes?: Record<string, any>;
  }>;
  maxIterations?: number;     // default: 100
}
```

**Output:**
```typescript
{
  history: DANLNode[][];      // State at each iteration
  final: DANLNode[];          // Converged state
  iterations: number;         // Number of steps to convergence
  converged: boolean;         // Whether fixpoint reached
  trace: Array<{              // Detailed execution log
    step: number;
    states: Record<string, string>;
    observables: Record<string, number>;
  }>;
  hdAddress: string;
  rpcEndpoint: string;
}
```

**Example:**
```typescript
await mcp.callTool('mcp__danl__simulate_network', {
  nodes: [
    {
      name: 'perceptual-array',
      state: 'potential',
      tauCoefficient: 1.25,
      neighbors: ['inference-engine'],
    },
    {
      name: 'inference-engine',
      state: 'active',
      tauCoefficient: 1.5,
      neighbors: ['perceptual-array', 'consensus-forum'],
    },
    {
      name: 'consensus-forum',
      state: 'potential',
      tauCoefficient: 0.9,
      neighbors: ['inference-engine'],
    },
  ],
});
```

### 2. `mcp__danl__lattice_join`

Compute lattice join (maximum/most confident).

**Input:**
```typescript
{
  levels: Array<'bottom' | 'potential' | 'active' | 'confident' | 'top'>;
}
```

**Output:**
```typescript
{
  operation: 'join';
  input: string[];
  result: string;              // Highest confidence level
  interpretation: string;
  hdAddress: string;
}
```

**Example:**
```typescript
await mcp.callTool('mcp__danl__lattice_join', {
  levels: ['potential', 'active', 'potential']
});
// Returns: { result: 'active', interpretation: 'Maximum confidence level' }
```

### 3. `mcp__danl__lattice_meet`

Compute lattice meet (minimum/conservative consensus).

**Input:**
```typescript
{
  levels: Array<'bottom' | 'potential' | 'active' | 'confident' | 'top'>;
}
```

**Output:**
```typescript
{
  operation: 'meet';
  input: string[];
  result: string;              // Lowest confidence level
  interpretation: string;
  hdAddress: string;
}
```

**Example:**
```typescript
await mcp.callTool('mcp__danl__lattice_meet', {
  levels: ['active', 'confident', 'potential']
});
// Returns: { result: 'potential', interpretation: 'Conservative consensus level' }
```

### 4. `mcp__danl__get_level_index`

Get numeric index for lattice level.

**Input:**
```typescript
{
  level: 'bottom' | 'potential' | 'active' | 'confident' | 'top';
}
```

**Output:**
```typescript
{
  level: string;
  index: number;  // 0-4
  hdAddress: string;
}
```

### 5. `mcp__danl__blend_level`

Blend two lattice levels with weight.

**Input:**
```typescript
{
  self: 'bottom' | 'potential' | 'active' | 'confident' | 'top';
  neighbor: 'bottom' | 'potential' | 'active' | 'confident' | 'top';
  weight?: number;  // default: 1.0
}
```

**Output:**
```typescript
{
  operation: 'blend';
  self: string;
  neighbor: string;
  weight: number;
  result: string;              // Blended level
  blendedIndex: number;
  hdAddress: string;
}
```

**Formula:** `blend = (self_index + weight × neighbor_index) / (1 + weight)`

### 6. `mcp__danl__compute_observable`

Compute observable from state and τ-coefficient.

**Input:**
```typescript
{
  state: 'bottom' | 'potential' | 'active' | 'confident' | 'top';
  tauCoefficient: number;
}
```

**Output:**
```typescript
{
  state: string;
  levelIndex: number;
  tauCoefficient: number;
  observable: number;          // τ × level_index
  formula: string;
  hdAddress: string;
}
```

### 7. `mcp__danl__validate_convergence`

Validate if network trace shows convergence.

**Input:**
```typescript
{
  trace: Array<Record<string, string>>;  // State snapshots
}
```

**Output:**
```typescript
{
  converged: boolean;
  iterations: number;
  finalState: Record<string, string>;
  reason: string;
  hdAddress: string;
}
```

### 8. `mcp__danl__get_hd_address_info`

Get HD addressing information.

**Input:**
```typescript
{}
```

**Output:**
```typescript
{
  hdAddress: string;
  rpcEndpoint: string;
  hyperbolicCoordinates: [number, number];
  curvature: number;
  transport: string;
  host: string;
  port: number;
  purpose: string;
  version: number;
  network: string;
  serviceType: string;
  instance: number;
}
```

---

## Resources

### 1. `danl://lattice/spec`

Five-level epistemic certainty lattice specification.

**Content:**
```json
{
  "levels": [
    { "name": "bottom", "index": 0 },
    { "name": "potential", "index": 1 },
    { "name": "active", "index": 2 },
    { "name": "confident", "index": 3 },
    { "name": "top", "index": 4 }
  ],
  "operations": {
    "join": { "symbol": "∨", "description": "Maximum" },
    "meet": { "symbol": "∧", "description": "Minimum" }
  }
}
```

### 2. `danl://transitions/all`

M/S-expression transition rules.

**Content:**
```json
{
  "propagate-belief": {
    "meta": "propagate-belief self neighbors -> join self (fold join neighbors)",
    "structural": "(lambda (self neighbors context) ...)",
    "description": "Propagate epistemic belief"
  },
  "interpret-evidence": {
    "meta": "interpret-evidence self neighbors tau -> blend self neighbor-join",
    "structural": "(lambda (self neighbors context) ...)",
    "description": "Interpret evidence with tau weighting"
  },
  "safeguard-consensus": {
    "meta": "safeguard-consensus self neighbors -> meet ceiling (join self neighbor-join)",
    "structural": "(lambda (self neighbors context) ...)",
    "description": "Bounded consensus"
  }
}
```

### 3. `danl://simulations/recent`

Recent network simulation results.

### 4. `danl://observables/formula`

Observable parameterization (τ-products) formula and examples.

### 5. `danl://address/info`

HD addressing and hyperbolic coordinate information.

---

## Configuration

### Environment Variables

```bash
# Server settings
DANL_PORT=3000
DANL_HOST=localhost

# Scheme interpreter
SCHEME_INTERPRETER=guile  # or 'racket'
DANL_SCHEME_PATH=./decentralized_automaton_network/scheme/danl.scm

# Persistence
DANL_PERSISTENCE_PATH=./persistence/danl
```

### Config File

See `src/config.ts` for programmatic configuration.

---

## HD Addressing

The DANL MCP server uses hierarchical deterministic addressing for federated identity:

**HD Address:** `m/0x44414E4C'/0x00000001'/0'/0/0`

**Components:**
- **Purpose:** `0x44414E4C` ("DANL" in hex)
- **Version:** `0x00000001` (v1)
- **Network:** `0` (local/testnet)
- **Service Type:** `0` (base implementation)
- **Instance:** `0`

**RPC Endpoint:** `tcp://localhost:3000/danl/base/0`

**Hyperbolic Coordinates:** Deterministically derived, positioned in Poincaré ball for geometric routing.

---

## Integration Example

### With Claude Code

```typescript
// Claude Code automatically discovers DANL MCP server

// Simulate a consensus network
const result = await mcp.callTool('mcp__danl__simulate_network', {
  nodes: [
    { name: 'node1', state: 'potential', tauCoefficient: 1.0, neighbors: ['node2'] },
    { name: 'node2', state: 'active', tauCoefficient: 1.2, neighbors: ['node1', 'node3'] },
    { name: 'node3', state: 'potential', tauCoefficient: 0.8, neighbors: ['node2'] },
  ],
});

console.log(`Converged in ${result.iterations} iterations`);
console.log(`Final state:`, result.final);

// Check lattice operations
const joinResult = await mcp.callTool('mcp__danl__lattice_join', {
  levels: ['potential', 'active', 'confident']
});
// Returns: "confident"

// Compute observable
const observable = await mcp.callTool('mcp__danl__compute_observable', {
  state: 'active',
  tauCoefficient: 1.5
});
// Returns: { observable: 3.0, formula: 'observable = τ × level_index' }
```

### With H²GNN (Cross-Agent Learning)

```typescript
// Learn DANL patterns with H²GNN after simulation
const simulation = await danl.simulateNetwork({...});

await h2gnn.learn_concept_hd({
  concept: 'danl_convergence_pattern',
  data: {
    iterations: simulation.iterations,
    finalState: simulation.final,
    observables: simulation.trace.map(t => t.observables)
  },
  context: {
    domain: 'distributed-consensus',
    language: 'scheme',
    complexity: 0.7
  },
  performance: 0.9
});
```

### With CST (Complexity Analysis)

```typescript
// Analyze DANL Scheme code
const cstResult = await cst.analyze_program(danlSchemeCode);

// Simulate network
const danlResult = await danl.simulateNetwork({...});

// Correlate CST metrics with DANL behavior
console.log(`CST H¹: ${cstResult.h1}`);  // Flat structure
console.log(`CST V(G): ${cstResult.vg}`); // High complexity
console.log(`DANL iterations: ${danlResult.iterations}`);  // Fast convergence
```

---

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

---

## Troubleshooting

### Scheme Interpreter Not Found

**Error:** `Failed to spawn guile: ENOENT`

**Solution:** Install Guile or Racket and ensure it's in PATH:
```bash
which guile
# or
which racket
```

### DANL Scheme File Not Found

**Error:** `ENOENT: no such file or directory`

**Solution:** Set `DANL_SCHEME_PATH` environment variable:
```bash
export DANL_SCHEME_PATH=/absolute/path/to/danl.scm
```

### Simulation Timeout

**Error:** `Simulation exceeded timeout`

**Solution:** Increase timeout in config or reduce network size:
```typescript
{
  simulationTimeout: 60000,  // 60 seconds
}
```

---

## Architecture Details

### Scheme Bridge

The Scheme bridge (`src/bridge/scheme-bridge.ts`) executes DANL Scheme code:

1. **Load DANL implementation** from `danl.scm`
2. **Generate network definition** as Scheme code
3. **Execute simulation** with `(simulate-network network)`
4. **Export JSON trace** with `(export-trace-json history)`
5. **Parse results** back to TypeScript

### Tool Handler

Each tool in `src/tools/tools.ts`:
- Validates input with **Zod schemas**
- Calls **Scheme bridge** methods
- Returns structured output with **HD address**

### Resource Provider

Resources in `src/resources/resources.ts`:
- Provide read-only access to **DANL state**
- URIs like `danl://lattice/spec`
- JSON-formatted responses

---

## References

- **[AGENTS.md](../../AGENTS.md)** - AI agent architecture
- **[PERSISTENCE_AND_FEDERATED_IDENTITY.md](../../PERSISTENCE_AND_FEDERATED_IDENTITY.md)** - HD addressing details
- **[DANL Scheme Implementation](../../decentralized_automaton_network/scheme/danl.scm)** - Core DANL code
- **[DANL Research Paper](../../DECENTRALIZED_AUTOMATON_NETWORK_LATTICE_PAPER.md)** - Theoretical foundations

---

## License

MIT

---

## Authors

Epistemic Topology Project Contributors

---

**Version:** 1.0.0
**HD Address:** `m/0x44414E4C'/0x00000001'/0'/0/0`
**Status:** ✅ Production-Ready
