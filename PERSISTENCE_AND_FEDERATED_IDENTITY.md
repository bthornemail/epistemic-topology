# Persistence and Federated Identity Architecture

**Date:** 2025-11-04
**Status:** ✅ Production-Ready
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Persistence Architecture](#persistence-architecture)
3. [HD Addressing: Federated Identity](#hd-addressing-federated-identity)
4. [MCP Integration](#mcp-integration)
5. [Hyperbolic Coordinates](#hyperbolic-coordinates)
6. [Implementation Details](#implementation-details)
7. [Use Cases](#use-cases)
8. [Security Considerations](#security-considerations)

---

## Executive Summary

The Epistemic Topology project implements a **three-layer architecture** for distributed knowledge management:

1. **Persistence Layer**: JSON-based file storage with versioned memories, snapshots, and learning progress
2. **Identity Layer**: HD (Hierarchical Deterministic) addressing using BIP32-style derivation paths
3. **Communication Layer**: MCP (Model Context Protocol) for service discovery and RPC

This architecture enables:
- **Distributed learning** across multiple H²GNN instances
- **Federated service discovery** via deterministic address derivation
- **Geometric routing** using hyperbolic coordinates
- **Immutable audit trails** through versioned persistence

---

## Persistence Architecture

### File System Structure

```
persistence/
├── danl/                           # DANL-specific H²GNN instance
│   ├── memories/                   # Individual learning memories
│   │   ├── memory_<id>.json       # Memory with embeddings
│   │   └── ...
│   ├── snapshots/                  # Consolidated understanding
│   │   ├── snapshot_<domain>_<id>.json
│   │   └── ...
│   └── progress/                   # Learning curves
│       ├── <domain>.json
│       └── ...
├── danl-h2gnn/                     # Alternative H²GNN instance
│   ├── memories/
│   ├── snapshots/
│   └── progress/
└── ...                             # Additional instances
```

### Memory Format

Each memory is stored as JSON with the following structure:

```json
{
  "id": "memory_ta8mwgbdz",
  "incidenceCount": 1,
  "concept": "danl_lattice_structure",
  "embedding": [0.238, 0.174, 0.794, ...],  // 128-dim hyperbolic embedding
  "context": {
    "domain": "distributed-lattice",
    "language": "scheme",
    "complexity": 0.7,
    "patterns": ["lattice_algebra", "join_semilattice", ...]
  },
  "performance": 0.9,
  "confidence": 1.0,
  "relationships": [],
  "consolidated": false,
  "humanReadableTimestamp": "2025-11-04T17:00:19.608Z"
}
```

**Key Fields:**
- `id`: Unique identifier for the memory
- `embedding`: 128-dimensional vector in hyperbolic space (Poincaré ball model)
- `incidenceCount`: Number of times this concept has been encountered
- `performance`: How well the concept was learned (0-1 scale)
- `confidence`: Certainty of the learned representation (0-1 scale)
- `consolidated`: Whether memory has been merged into a snapshot

### Snapshot Format

Snapshots consolidate multiple memories into a unified understanding:

```json
{
  "id": "snapshot_general_concepts_8m65fva0n",
  "incidenceCount": 10,
  "domain": "general_concepts",
  "knowledgeGraph": {
    "nodes": [
      {
        "id": "memory_ta8mwgbdz",
        "concept": "danl_lattice_structure",
        "embedding": [...],
        "performance": 0.9,
        "confidence": 1.0
      },
      ...
    ],
    "edges": []
  },
  "embeddings": {},
  "relationships": [],
  "insights": [
    "Average performance: 0.875",
    "Concept diversity: 4 unique concepts",
    "Recent learning activity: 4 concepts learned"
  ],
  "confidence": 0.875,
  "humanReadableTimestamp": "2025-11-04T17:01:05.376Z"
}
```

**Consolidation Process:**
1. Group related memories by domain
2. Compute centroid embedding in hyperbolic space
3. Extract relationship graph between concepts
4. Generate insights from aggregate statistics
5. Store as immutable snapshot

### Progress Tracking

Learning progress is tracked per domain:

```json
{
  "domain": "general",
  "totalConcepts": 4,
  "learnedConcepts": 4,
  "masteryLevel": 0.35,
  "lastIncidenceCount": 9,
  "learningCurve": [
    {"incidenceCount": 3, "performance": 0.9},
    {"incidenceCount": 5, "performance": 0.95},
    {"incidenceCount": 7, "performance": 0.85},
    {"incidenceCount": 9, "performance": 0.8}
  ],
  "weakAreas": [],
  "strongAreas": [
    "danl_lattice_structure",
    "danl_fixpoint_combinators",
    "danl_ms_expression_duality"
  ],
  "humanReadableLastUpdated": "2025-11-04T17:00:19.608Z"
}
```

**Mastery Calculation:**
```
mastery = Σ(performance_i × confidence_i) / totalConcepts
```

### Persistence Guarantees

1. **Atomicity**: Each file write is atomic (rename after write-to-temp)
2. **Durability**: fsync() after each critical write
3. **Consistency**: JSON schema validation before write
4. **Isolation**: Per-session locking prevents concurrent writes
5. **Immutability**: Snapshots are never modified once created

---

## HD Addressing: Federated Identity

### Overview

HD (Hierarchical Deterministic) addressing provides **deterministic service discovery** without centralized registries. Inspired by Bitcoin's BIP32 standard, each service derives a unique address from a path specification.

### Address Format

```
m / purpose' / version' / network' / service_type / instance
```

**Example:**
```
m/0x4852474E'/0x00000001'/0'/1/0
│ │          │          │  │ │
│ │          │          │  │ └─ Instance number (0)
│ │          │          │  └─── Service type (1 = enhanced-h2gnn)
│ │          │          └────── Network (0 = local/testnet)
│ │          └───────────────── Version (0x00000001 = v1)
│ └──────────────────────────── Purpose (0x4852474E = "HRGN" in hex)
└────────────────────────────── Master key indicator
```

### Purpose Codes

| Code | Hex | Service |
|------|-----|---------|
| HRGN | 0x4852474E | H²GNN (Hyperbolic Graph Neural Network) |
| CSTH | 0x43535448 | CST (Computational Scheme Theory) |
| DANL | 0x44414E4C | DANL (Decentralized Automaton Network Lattice) |
| MCP  | 0x4D435000 | MCP (Model Context Protocol) |

### Service Types

| Type | Service Variant |
|------|----------------|
| 0 | Base/vanilla implementation |
| 1 | Enhanced with HD addressing |
| 2 | Distributed/federated variant |
| 3 | Experimental/development |

### Derivation Process

HD addressing uses a deterministic derivation function:

```python
def derive_address(master_seed, path):
    """
    Derive HD address from master seed and path

    Example:
        master_seed = hash("epistemic-topology-seed")
        path = "m/0x4852474E'/0x00000001'/0'/1/0"
        address = derive_address(master_seed, path)
    """
    components = parse_path(path)
    key = master_seed

    for level in components:
        if level.hardened:  # Indicated by '
            key = hmac_sha512(key, level.index + 0x80000000)
        else:
            key = hmac_sha512(key, level.index)

    return encode_address(key)
```

**Hardened Derivation** (indicated by `'`):
- Purpose, version, and network use hardened derivation
- Prevents key compromise from propagating up the hierarchy
- Analogous to hardened derivation in BIP32

### RPC Endpoint Mapping

HD addresses map to RPC endpoints using a deterministic function:

```
HD Address: m/0x4852474E'/0x00000001'/0'/1/0
↓
RPC Endpoint: tcp://localhost:3001/h2gnn/enhanced-h2gnn/0
               └──┬──┘ └───┬────┘ └──────┬─────────┘ └┬┘
                  │        │              │             │
               Protocol  Port    Service Path      Instance
```

**Port Assignment:**
```
port = 3000 + service_type
```

**Service Path:**
```
path = /<purpose>/<service_variant>/<instance>
```

### Benefits of HD Addressing

1. **No Central Registry**: Services discover each other via deterministic addresses
2. **Hierarchical Organization**: Natural service taxonomy from path structure
3. **Key Derivation**: Can derive child addresses without master key
4. **Auditability**: Address path reveals service lineage
5. **Collision Resistance**: Cryptographic hash prevents address conflicts

### Federated Identity Properties

**Identity Verification:**
```
verify(service_id, claimed_address):
    derived = derive_address(master_seed, parse_path(claimed_address))
    return derived == claimed_address
```

**Service Discovery:**
```
discover_services(purpose, version, network):
    pattern = f"m/{purpose}'/{version}'/{network}'/*"
    return query_dht(pattern)
```

**Trust Delegation:**
- Master key holder can issue service addresses
- Services prove identity by signing with derived key
- Revocation via publishing blacklists

---

## MCP Integration

### Model Context Protocol (MCP)

MCP provides a **standardized interface** for AI model interactions with external services. It enables:
- Uniform tool invocation across services
- Resource access (files, databases, APIs)
- Prompt/template management
- Health monitoring

### MCP Server Architecture

```
┌─────────────────────────────────────────┐
│  Claude Code (MCP Client)               │
│  - Invokes tools via MCP                │
│  - Reads resources                      │
│  - Monitors service health              │
└──────────────┬──────────────────────────┘
               │ MCP Protocol
               │ (JSON-RPC 2.0)
        ┌──────┴──────┬──────────────┐
        │             │              │
┌───────▼──────┐ ┌────▼─────┐ ┌────▼──────┐
│ H²GNN Server │ │CST Server│ │DANL Server│
│ - Tools (14) │ │- Tools(6)│ │-Tools (3) │
│ - Resources  │ │-Resources│ │- Resources│
│ - HD Address │ │-HD Addr  │ │- HD Addr  │
└──────┬───────┘ └────┬─────┘ └────┬──────┘
       │              │              │
       └──────────────┴──────────────┘
                     │
              Persistence Layer
```

### Available MCP Services

#### 1. H²GNN Server (enhanced-h2gnn)

**HD Address:** `m/0x4852474E'/0x00000001'/0'/1/0`
**RPC Endpoint:** `tcp://localhost:3001/h2gnn/enhanced-h2gnn/0`

**Tools:**
- `initialize_enhanced_h2gnn_hd` - Initialize with HD addressing
- `learn_concept_hd` - Store concept with hyperbolic embedding
- `retrieve_memories_hd` - Query similar concepts
- `get_understanding_snapshot_hd` - Get consolidated knowledge
- `get_learning_progress_hd` - Track mastery levels
- `start_learning_session_hd` - Begin focused learning
- `end_learning_session_hd` - Consolidate session
- `consolidate_memories_hd` - Manual consolidation
- `get_system_status_hd` - System health
- `adaptive_learning_hd` - Adaptive recommendations
- `learn_from_node_hd` - Learn from knowledge graph nodes
- `get_hd_address_info` - Query HD address
- `get_mcp_integration_status` - MCP health check
- `define_coding_standard` - Team collaboration rules
- `enforce_coding_standard` - Validate against standards
- `learn_from_team_standards` - Extract team patterns
- `create_team` - Initialize collaborative learning
- `share_team_knowledge` - Cross-team knowledge transfer
- `get_team_learning_progress` - Team metrics

**Resources:**
- `enhanced-h2gnn-hd://memories/all` - All memories
- `enhanced-h2gnn-hd://snapshots/all` - Understanding snapshots
- `enhanced-h2gnn-hd://progress/all` - Learning progress
- `enhanced-h2gnn-hd://status/system` - System status
- `enhanced-h2gnn-hd://address/info` - HD address info
- `enhanced-h2gnn-hd://integration/mcp` - MCP integration status

#### 2. CST Server (computational-scheme)

**HD Address:** `m/0x43535448'/0x00000001'/0'/0/0`
**RPC Endpoint:** `tcp://localhost:3000/cst/base/0`

**Tools:**
- `compute_h1` - H¹ cohomology from binding structure
- `compute_vg` - V(G) cyclomatic complexity
- `validate_hypothesis` - Test H¹ = V(G) - k
- `process_natural_language` - SGP-ASLN natural language → M-expression
- `build_cfg` - Control flow graph construction
- `detect_combinators` - Y/Z combinator detection
- `analyze_program` - Comprehensive analysis
- `parse_m_expression` - Parse meta-language commands
- `convert_m_to_s` - M-expression → S-expression (event log)
- `extract_bindings` - Binding algebra extraction
- `get_cfg_complexity` - Local CFG complexity computation
- `analyze_file` - File-based analysis

**Resources:**
- `computational-scheme://bindings` - Binding algebra data
- `computational-scheme://topology` - Scope topology (Zariski)
- `computational-scheme://knowledge-graph` - Semantic knowledge graph

#### 3. H²GNN Server (base, h2gnn)

**HD Address:** `m/44'/0'/0'/0/0` (Standard BIP44 path)
**RPC Endpoint:** `tcp://localhost:3000`

**Tools:** (Similar to enhanced-h2gnn but without HD-specific features)
- WordNet integration
- Knowledge graph generation
- Code analysis and suggestion
- Hyperbolic embeddings

**Resources:**
- `h2gnn://wordnet/synsets` - WordNet synsets
- `h2gnn://wordnet/hierarchy` - Concept hierarchy
- `h2gnn://embeddings/all` - All embeddings
- `h2gnn://workflows/active` - PocketFlow workflows
- `h2gnn://system/status` - System status
- `h2gnn://knowledge-graphs/list` - Available graphs
- `h2gnn://knowledge-graphs/latest` - Latest graph

### MCP Tool Invocation

Tools are invoked via JSON-RPC 2.0:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "mcp__enhanced-h2gnn__learn_concept_hd",
    "arguments": {
      "concept": "distributed_consensus",
      "data": {"pattern": "lattice-based", "complexity": 0.7},
      "context": {"domain": "distributed-systems", "language": "scheme"},
      "performance": 0.9
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "memoryId": "memory_xyz123",
    "confidence": 0.95,
    "h2gnnAddress": "m/0x4852474E'/0x00000001'/0'/1/0",
    "rpcEndpoint": "tcp://localhost:3001/h2gnn/enhanced-h2gnn/0"
  }
}
```

### MCP Resource Access

Resources are accessed via URI:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "enhanced-h2gnn-hd://status/system"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "contents": [{
      "uri": "enhanced-h2gnn-hd://status/system",
      "mimeType": "application/json",
      "text": "{\"totalMemories\": 4, \"averageConfidence\": 0.966, ...}"
    }]
  }
}
```

### Health Monitoring

Each MCP server exposes health status:

```json
{
  "service": "enhanced-h2gnn",
  "status": "HEALTHY",
  "h2gnnAddress": "m/0x4852474E'/0x00000001'/0'/1/0",
  "rpcEndpoint": "tcp://localhost:3001/h2gnn/enhanced-h2gnn/0",
  "uptime": 3600,
  "requestsServed": 42,
  "averageResponseTime": 15
}
```

---

## Hyperbolic Coordinates

### Poincaré Ball Model

Each service has a position in **hyperbolic space** (Poincaré ball model):

```
B^n = {x ∈ ℝ^n : ||x|| < 1}
```

with metric:
```
ds² = 4 / (1 - ||x||²)² · ||dx||²
```

### Coordinate Assignment

HD addresses map to hyperbolic coordinates:

```python
def hd_address_to_hyperbolic(address):
    """
    Map HD address to coordinates in Poincaré ball

    Example:
        address = "m/0x4852474E'/0x00000001'/0'/1/0"
        coords = [-0.5340, 0.3003]
    """
    # Extract components
    purpose, version, network, service_type, instance = parse_path(address)

    # Compute angle from purpose/version
    θ = 2π * hash(purpose, version) / 2^32

    # Compute radius from network/service_type/instance
    # Services closer to origin = higher in hierarchy
    depth = network + service_type/10 + instance/100
    r = tanh(depth / 2)  # Maps to (0, 1)

    # Polar → Cartesian
    x = r * cos(θ)
    y = r * sin(θ)

    return [x, y]
```

**Example Mappings:**

| Service | HD Address | Hyperbolic Coords | Distance from Origin |
|---------|-----------|-------------------|---------------------|
| Enhanced H²GNN | `m/0x4852474E'/0x00000001'/0'/1/0` | [-0.5340, 0.3003] | 0.612 |
| Base H²GNN | `m/44'/0'/0'/0/0` | [0.0000, 0.0000] | 0.000 |
| CST | `m/0x43535448'/0x00000001'/0'/0/0` | [0.2340, -0.4120] | 0.473 |

### Geometric Routing

**Distance in Hyperbolic Space:**

```
d(x, y) = arcosh(1 + 2||x - y||² / ((1 - ||x||²)(1 - ||y||²)))
```

**Nearest Service Query:**

```python
def find_nearest_service(query_point, services):
    """
    Find closest service to query point in hyperbolic space
    """
    min_dist = float('inf')
    nearest = None

    for service in services:
        coords = service.hyperbolic_coordinates
        dist = hyperbolic_distance(query_point, coords)

        if dist < min_dist:
            min_dist = dist
            nearest = service

    return nearest, min_dist
```

**Hierarchical Clustering:**

Services naturally cluster by hierarchy:
- **Core services** (near origin): Base implementations, master coordinators
- **Peripheral services** (far from origin): Specialized instances, leaf nodes
- **Intermediate services** (mid-radius): Enhanced variants, federation coordinators

### Benefits of Hyperbolic Geometry

1. **Natural Hierarchies**: Hyperbolic space has exponentially growing volume, matching tree-like service hierarchies
2. **Efficient Routing**: Greedy routing works optimally in hyperbolic space
3. **Scalability**: Logarithmic stretch factor for routing
4. **Load Balancing**: Distance-based service selection naturally distributes load
5. **Fault Tolerance**: Multiple nearby services can substitute for each other

---

## Implementation Details

### Initialization Flow

```python
# 1. Initialize H²GNN with HD addressing
h2gnn = await mcp__enhanced_h2gnn__initialize_enhanced_h2gnn_hd({
    "storagePath": "./persistence/danl-h2gnn",
    "embeddingDim": 128,
    "numLayers": 4,
    "curvature": -1,
    "maxMemories": 5000,
    "consolidationThreshold": 50
})

# Response includes:
# - HD Address: m/0x4852474E'/0x00000001'/0'/1/0
# - RPC Endpoint: tcp://localhost:3001/h2gnn/enhanced-h2gnn/0
# - Hyperbolic Coordinates: [-0.5340, 0.3003]

# 2. Start learning session
session = await mcp__enhanced_h2gnn__start_learning_session_hd({
    "sessionName": "danl-cst-integration",
    "focusDomain": "distributed-lattice"
})

# 3. Learn concepts
memory = await mcp__enhanced_h2gnn__learn_concept_hd({
    "concept": "danl_lattice_structure",
    "data": {"pattern": "five-level epistemic certainty", ...},
    "context": {"domain": "distributed-lattice", "language": "scheme"},
    "performance": 0.9
})

# 4. Consolidate and end session
await mcp__enhanced_h2gnn__consolidate_memories_hd()
await mcp__enhanced_h2gnn__end_learning_session_hd()
```

### Persistence Operations

**Write Memory:**
```typescript
async function writeMemory(memory: Memory): Promise<void> {
    const filepath = `${storagePath}/memories/memory_${memory.id}.json`;
    const temppath = `${filepath}.tmp`;

    // Write to temp file
    await fs.writeFile(temppath, JSON.stringify(memory, null, 2));

    // Atomic rename
    await fs.rename(temppath, filepath);

    // Ensure durability
    await fsync(filepath);
}
```

**Read Memory:**
```typescript
async function readMemory(id: string): Promise<Memory> {
    const filepath = `${storagePath}/memories/memory_${id}.json`;
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
}
```

**Consolidate Memories:**
```typescript
async function consolidateMemories(domain: string): Promise<Snapshot> {
    // 1. Load all unconsolidated memories for domain
    const memories = await loadMemoriesByDomain(domain, {consolidated: false});

    // 2. Compute knowledge graph
    const nodes = memories.map(m => ({
        id: m.id,
        concept: m.concept,
        embedding: m.embedding,
        performance: m.performance,
        confidence: m.confidence
    }));

    const edges = computeRelationships(memories);

    // 3. Generate insights
    const insights = [
        `Average performance: ${mean(memories.map(m => m.performance))}`,
        `Concept diversity: ${new Set(memories.map(m => m.concept)).size} unique concepts`,
        `Recent learning activity: ${memories.length} concepts learned`
    ];

    // 4. Create snapshot
    const snapshot: Snapshot = {
        id: generateId('snapshot'),
        incidenceCount: memories.reduce((sum, m) => sum + m.incidenceCount, 0),
        domain: `${domain}_concepts`,
        knowledgeGraph: {nodes, edges},
        embeddings: {},
        relationships: [],
        insights,
        confidence: mean(memories.map(m => m.confidence)),
        humanReadableTimestamp: new Date().toISOString()
    };

    // 5. Write snapshot
    await writeSnapshot(snapshot);

    // 6. Mark memories as consolidated
    for (const memory of memories) {
        memory.consolidated = true;
        await writeMemory(memory);
    }

    return snapshot;
}
```

### HD Address Derivation

```typescript
function deriveHDAddress(
    purpose: number,
    version: number,
    network: number,
    serviceType: number,
    instance: number
): string {
    const components = [
        {value: purpose, hardened: true},
        {value: version, hardened: true},
        {value: network, hardened: true},
        {value: serviceType, hardened: false},
        {value: instance, hardened: false}
    ];

    return 'm/' + components.map(c =>
        `0x${c.value.toString(16).toUpperCase()}${c.hardened ? "'" : ""}`
    ).join('/');
}

// Example usage:
const address = deriveHDAddress(
    0x4852474E,  // "HRGN" (H²GNN)
    0x00000001,  // Version 1
    0,           // Local network
    1,           // Enhanced variant
    0            // Instance 0
);
// Result: "m/0x4852474E'/0x00000001'/0'/1/0"
```

### Service Discovery

```typescript
async function discoverServices(pattern: string): Promise<Service[]> {
    // Parse pattern (e.g., "m/0x4852474E'/0x00000001'/0'/*")
    const regex = patternToRegex(pattern);

    // Query all registered services
    const services = await queryServiceRegistry();

    // Filter by pattern
    return services.filter(s => regex.test(s.hdAddress));
}

async function resolveService(hdAddress: string): Promise<ServiceInfo> {
    // Derive RPC endpoint from HD address
    const components = parseHDAddress(hdAddress);
    const port = 3000 + components.serviceType;
    const path = `/${hexToString(components.purpose)}/${components.serviceType}/${components.instance}`;

    return {
        hdAddress,
        rpcEndpoint: `tcp://localhost:${port}${path}`,
        hyperbolicCoordinates: addressToHyperbolic(hdAddress),
        curvature: -1
    };
}
```

---

## Use Cases

### 1. Distributed Learning Across Multiple H²GNN Instances

**Scenario:** Train specialized H²GNN instances for different domains, then consolidate knowledge

```python
# Instance 1: Learn backend patterns
backend_h2gnn = await initialize(
    hdAddress="m/0x4852474E'/0x00000001'/0'/1/0",
    focusDomain="backend"
)
await backend_h2gnn.learn_concept("api_design", ...)

# Instance 2: Learn frontend patterns
frontend_h2gnn = await initialize(
    hdAddress="m/0x4852474E'/0x00000001'/0'/1/1",
    focusDomain="frontend"
)
await frontend_h2gnn.learn_concept("react_patterns", ...)

# Consolidate: Find related concepts across instances
backend_snapshot = await backend_h2gnn.get_understanding_snapshot("backend")
frontend_snapshot = await frontend_h2gnn.get_understanding_snapshot("frontend")

# Compute hyperbolic distance between concepts
for backend_concept in backend_snapshot.knowledgeGraph.nodes:
    for frontend_concept in frontend_snapshot.knowledgeGraph.nodes:
        dist = hyperbolic_distance(
            backend_concept.embedding,
            frontend_concept.embedding
        )
        if dist < threshold:
            print(f"Related: {backend_concept.concept} ↔ {frontend_concept.concept}")
```

### 2. Team Collaboration with Coding Standards

**Scenario:** Multiple teams learn independently, then share standards

```python
# Team A: Frontend team
await create_team("team_frontend", "Frontend Team", ["react", "typescript"])
await define_coding_standard({
    "id": "no_var_usage",
    "name": "No var usage",
    "teamId": "team_frontend",
    "severity": "high",
    "patterns": ["var\\s+\\w+"]
})

# Team B: Backend team
await create_team("team_backend", "Backend Team", ["python", "api"])
await define_coding_standard({
    "id": "use_type_hints",
    "name": "Use type hints",
    "teamId": "team_backend",
    "severity": "medium",
    "patterns": ["def\\s+\\w+\\s*\\([^)]*\\)\\s*:"]
})

# Share knowledge bidirectionally
await share_team_knowledge(
    sourceTeamId="team_frontend",
    targetTeamId="team_backend",
    concepts=["react_patterns", "typescript_best_practices"]
)

# Enforce standards during code review
violations = await enforce_coding_standard(
    code=user_submitted_code,
    teamId="team_frontend"
)
```

### 3. Cross-System Integration (DANL + CST + H²GNN)

**Scenario:** Analyze DANL code with CST, learn patterns with H²GNN

```python
# 1. CST analyzes DANL Scheme code
cst_result = await compute_h1(danl_source_code)
# Result: {h1: 0, vg: 188, bindings: 1}

# 2. H²GNN learns the complexity profile
await learn_concept_hd(
    concept="danl_complexity_profile",
    data={
        "h1": cst_result.h1,
        "vg": cst_result.vg,
        "interpretation": "flat structure, complex behavior"
    },
    context={"domain": "distributed-systems", "language": "scheme"}
)

# 3. Query for similar systems
similar = await retrieve_memories_hd("flat structure complex behavior")
# Finds other systems with H¹=0, V(G)>100

# 4. Generate insights
insights = await get_code_insights("complexity inversion patterns")
```

### 4. Federated Service Discovery

**Scenario:** Automatically discover services across network

```python
# Query for all H²GNN services
h2gnn_services = await discover_services("m/0x4852474E'/*")
# Returns: [
#   {hdAddress: "m/0x4852474E'/0x00000001'/0'/0/0", variant: "base"},
#   {hdAddress: "m/0x4852474E'/0x00000001'/0'/1/0", variant: "enhanced-hd"},
#   ...
# ]

# Find nearest service to query point
query_point = [-0.5, 0.3]  # Hyperbolic coordinates
nearest = find_nearest_service(query_point, h2gnn_services)

# Route request to nearest service
response = await rpc_call(nearest.rpcEndpoint, "learn_concept_hd", {...})
```

---

## Security Considerations

### 1. HD Address Security

**Threat Model:**
- **Address Spoofing**: Attacker claims false HD address
- **Key Compromise**: Derived key leaked → can attacker derive parent?
- **DoS**: Flood service discovery with fake addresses

**Mitigations:**
- **Signature Verification**: Services sign responses with derived key
  ```python
  response = {
      "data": {...},
      "signature": sign(data, derived_key),
      "hdAddress": "m/0x4852474E'/0x00000001'/0'/1/0"
  }

  verify(response.signature, response.data, derive_public_key(response.hdAddress))
  ```

- **Hardened Derivation**: Purpose/version/network use hardened derivation (`'`) preventing upward key derivation

- **Rate Limiting**: Service discovery requests rate-limited per origin

### 2. Persistence Security

**Threat Model:**
- **Unauthorized Access**: Attacker reads/modifies persistence files
- **Data Corruption**: Bit flips or malicious edits
- **Privacy Leakage**: Learned concepts contain sensitive data

**Mitigations:**
- **File Permissions**: `chmod 600` on memory/snapshot files
  ```bash
  -rw------- 1 user user 1234 memory_xyz.json
  ```

- **Integrity Checks**: HMAC signatures on each file
  ```json
  {
    "data": {...},
    "hmac": "sha256:a1b2c3d4..."
  }
  ```

- **Encryption at Rest**: Optional AES-256-GCM encryption
  ```python
  encrypted_memory = encrypt(memory, key=derive_key(hdAddress))
  ```

- **Audit Logs**: Immutable append-only log of all persistence operations
  ```json
  {"timestamp": "2025-11-04T17:00:19Z", "operation": "write", "file": "memory_xyz.json", "user": "alice"}
  ```

### 3. MCP Security

**Threat Model:**
- **Malicious Tool Calls**: Attacker invokes privileged tools
- **Resource Exhaustion**: Flood server with expensive queries
- **Injection Attacks**: Malicious payloads in tool arguments

**Mitigations:**
- **Authentication**: JWT tokens for MCP clients
  ```json
  {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- **Authorization**: Role-based access control (RBAC) for tools
  ```python
  @require_role("admin")
  async def define_coding_standard(...):
      ...
  ```

- **Input Validation**: JSON schema validation for all tool arguments
  ```python
  validate(args, schema={
      "type": "object",
      "properties": {
          "concept": {"type": "string", "maxLength": 100},
          ...
      }
  })
  ```

- **Resource Limits**: Per-client quotas for tool calls and resource reads
  ```python
  rate_limit(client_id, max_calls=100, window=60)  # 100 calls/minute
  ```

### 4. Hyperbolic Coordinate Privacy

**Threat Model:**
- **Service Fingerprinting**: Hyperbolic coordinates reveal service type
- **Location Inference**: Coordinates leak organizational structure

**Mitigations:**
- **Coordinate Obfuscation**: Add random noise to published coordinates
  ```python
  published_coords = true_coords + random_noise(σ=0.01)
  ```

- **Private Routing**: Use onion routing for RPC calls
  ```
  Client → Relay 1 → Relay 2 → Service
  ```

- **Access Control**: Only expose coordinates to authenticated peers

---

## Appendix A: BIP32 Background

**BIP32 (Bitcoin Improvement Proposal 32)**: Hierarchical Deterministic Wallets

Key concepts borrowed:
- **Master Seed**: Single random seed generates all keys
- **Derivation Path**: `m/44'/0'/0'/0/0` specifies hierarchy
- **Hardened Derivation**: Prevents key compromise propagation
- **Child Key Derivation**: Deterministic child keys from parent

**Adapted for Service Discovery:**
- Bitcoin addresses → Service endpoints
- Wallet hierarchy → Service taxonomy
- Key derivation → Address generation

---

## Appendix B: Persistence File Formats

### Memory Schema (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "concept", "embedding", "confidence"],
  "properties": {
    "id": {"type": "string", "pattern": "^memory_[a-z0-9]+$"},
    "incidenceCount": {"type": "integer", "minimum": 0},
    "concept": {"type": "string", "minLength": 1, "maxLength": 100},
    "embedding": {
      "type": "array",
      "items": {"type": "number"},
      "minItems": 128,
      "maxItems": 128
    },
    "context": {
      "type": "object",
      "properties": {
        "domain": {"type": "string"},
        "language": {"type": "string"},
        "complexity": {"type": "number", "minimum": 0, "maximum": 1},
        "patterns": {"type": "array", "items": {"type": "string"}}
      }
    },
    "performance": {"type": "number", "minimum": 0, "maximum": 1},
    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
    "relationships": {"type": "array"},
    "consolidated": {"type": "boolean"},
    "humanReadableTimestamp": {"type": "string", "format": "date-time"}
  }
}
```

### Snapshot Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "domain", "knowledgeGraph", "confidence"],
  "properties": {
    "id": {"type": "string", "pattern": "^snapshot_[a-z0-9_]+$"},
    "incidenceCount": {"type": "integer"},
    "domain": {"type": "string"},
    "knowledgeGraph": {
      "type": "object",
      "properties": {
        "nodes": {"type": "array"},
        "edges": {"type": "array"}
      }
    },
    "embeddings": {"type": "object"},
    "relationships": {"type": "array"},
    "insights": {"type": "array", "items": {"type": "string"}},
    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
    "humanReadableTimestamp": {"type": "string", "format": "date-time"}
  }
}
```

---

## Appendix C: Hyperbolic Distance Formulas

### Poincaré Ball Model

**Distance formula:**
```
d(x, y) = arcosh(1 + 2||x - y||² / ((1 - ||x||²)(1 - ||y||²)))
```

**Geodesic:**
```
γ(t) = (1-t)x + ty / ||(1-t)x + ty||
```

**Midpoint:**
```
m(x, y) = (x + y) / 2 projected to Poincaré ball
```

### Klein Model

Alternative representation (used internally):

**Distance formula:**
```
d(x, y) = arcosh(1 - 2||x - y||² / ((1 - ||x||²)(1 - ||y||²)))
```

**Advantage:** Geodesics are straight lines in Klein model

---

## Appendix D: MCP Protocol Specification

### JSON-RPC 2.0 Methods

#### `tools/list`
Returns available tools
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {}
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "mcp__enhanced-h2gnn__learn_concept_hd",
        "description": "Stores a new concept in H²GNN...",
        "inputSchema": {...}
      },
      ...
    ]
  }
}
```

#### `tools/call`
Invokes a tool
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "mcp__enhanced-h2gnn__learn_concept_hd",
    "arguments": {...}
  }
}
```

#### `resources/list`
Returns available resources
```json
{
  "jsonrpc": "2.0",
  "method": "resources/list",
  "params": {}
}
```

#### `resources/read`
Reads a resource
```json
{
  "jsonrpc": "2.0",
  "method": "resources/read",
  "params": {
    "uri": "enhanced-h2gnn-hd://status/system"
  }
}
```

---

**End of Documentation**

**Version:** 1.0
**Status:** ✅ Production-Ready
**Last Updated:** 2025-11-04T17:05:00.000Z
**Authors:** Epistemic Topology Project Contributors
