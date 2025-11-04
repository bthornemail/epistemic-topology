# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Epistemic Topology: Decentralized Automaton Network Lattice (DANL)**

This is a complete research-and-implementation project that combines:
- Cutting-edge research on distributed consciousness computing
- Production-ready tri-language implementation (Scheme, Prolog, Datalog)
- Wiki-style documentation organized as an epistemic topology with multiple entry points
- Interactive knowledge graph visualization

The project follows a **bipartite structure**: deep mathematical foundations for academics alongside plain-English explanations for practitioners.

## Core Architecture

### Three-Language Implementation Stack

The DANL system is implemented in three complementary languages that work together:

1. **Scheme (R5RS)** - Computational orchestrator
   - Located in: `decentralized_automaton_network/scheme/danl.scm` and `danl-core.scm`
   - Role: Executes network simulations, runs fixpoint detection, generates traces
   - Uses Y/Z combinators for convergence detection
   - Implements homoiconic M/S-expression pairs (meta/structural duality)

2. **Prolog** - Verification layer
   - Located in: `decentralized_automaton_network/prolog/danl.pl` and `danl-rules.pl`
   - Role: Proves convergence properties, verifies monotonicity, validates Scheme traces
   - Implements same transition rules declaratively for cross-validation

3. **Datalog** - Propagation layer
   - Located in: `decentralized_automaton_network/datalog/danl.dl` and `danl-queries.dl`
   - Role: Materializes fixpoint states using monotone recursion
   - Uses max-aggregators for lattice operations

**Critical principle**: All three languages share the same vocabulary defined in `decentralized_automaton_network/docs/lattice_spec.json`. When modifying lattice semantics or transitions, update this file first and regenerate language-specific code.

### Lattice Semantics

The system uses a five-level epistemic certainty lattice:
```
bottom < potential < active < confident < top
```

Operations:
- `join` (∨): Takes maximum (most confident)
- `meet` (∧): Takes minimum (conservative consensus)
- Uses rig-based irreversibility (max-plus algebra) for causal accumulation

### Epistemic Topology Structure

Every document in `docs/` follows the **EpistemicNode** interface (defined in `types/epistemic-node.ts`). Documents include YAML front matter with:

```yaml
---
id: unique-kebab-case-id
title: "Human-Readable Title"
level: gateway | foundational | practical | applied
type: navigation | concept | implementation | application | guide
tags: [primary, categorization]
keywords: [secondary, indexing]
prerequisites: [node-ids]
enables: [node-ids]
related: [node-ids]
readingTime: 10
difficulty: 1-5
---
```

This creates a directed graph of knowledge with multiple entry points:
- **Gateway**: Accessible to everyone, uses analogies
- **Foundational**: Core concepts, minimal prerequisites
- **Practical**: Implementation guides, step-by-step
- **Applied**: Production patterns, case studies

## Running and Testing

### Scheme

```bash
# Run with Guile (preferred)
guile decentralized_automaton_network/scheme/danl.scm

# Or with Racket
racket decentralized_automaton_network/scheme/danl.scm
```

### Prolog

```bash
# Interactive mode
swipl decentralized_automaton_network/prolog/danl.pl

# Run examples
swipl -g "run_examples" -t halt decentralized_automaton_network/prolog/danl.pl
```

### Datalog

```bash
# Compile and run with Soufflé
souffle decentralized_automaton_network/datalog/danl.dl
```

### Python Test Suite

```bash
# Run comprehensive test suite
cd decentralized_automaton_network
python3 test_danl.py

# Validate convergence properties
python3 validate_danl.py

# Debug convergence behavior
python3 debug_convergence.py
```

### Documentation Validation

```bash
# Validate all documentation structure
npm run validate

# Validate specific directory
npm run validate:docs
```

This checks that all documents have valid front matter, prerequisites are satisfied, and internal links are correct.

## AI Agent Architecture

This project is fundamentally an **agent-based system** where multiple AI agents collaborate via:
- **H²GNN**: Learning and knowledge agents with hyperbolic embeddings
- **CST**: Computational Scheme Theory analysis agents
- **DANL**: Distributed consensus execution agents
- **MCP**: Model Context Protocol for standardized communication

### Key Agent Capabilities

**Persistence:**
- JSON-based memory storage with hyperbolic embeddings (128-dim)
- Consolidated understanding snapshots per domain
- Learning progress tracking with mastery metrics

**Federated Identity:**
- HD (Hierarchical Deterministic) addressing using BIP32-style derivation
- Example: `m/0x4852474E'/0x00000001'/0'/1/0` (Enhanced H²GNN)
- Deterministic service discovery without central registry
- Hyperbolic coordinates for geometric routing

**Collaboration Patterns:**
- Pipeline: Sequential processing (CST → H²GNN → Report)
- Parallel: Multiple agents aggregate results
- Federated: Independent learning with consolidation
- Team-based: Shared standards and knowledge transfer

For complete agent documentation, see **[AGENTS.md](AGENTS.md)** and **[PERSISTENCE_AND_FEDERATED_IDENTITY.md](PERSISTENCE_AND_FEDERATED_IDENTITY.md)**.

## Project Structure

```
epistemic-topology/
├── docs/                           # Epistemic topology documentation
│   ├── INDEX.md                    # Main navigation hub
│   ├── gateway/                    # Entry-level content
│   ├── foundational/               # Core concepts
│   ├── practical/                  # Implementation guides
│   ├── applied/                    # Production patterns
│   └── assets/                     # Visualizations, knowledge graph
├── decentralized_automaton_network/ # Core DANL implementation
│   ├── scheme/                     # Scheme orchestrator
│   ├── prolog/                     # Prolog verification
│   ├── datalog/                    # Datalog propagation
│   ├── docs/                       # Implementation-specific docs
│   │   └── lattice_spec.json       # Shared vocabulary (IMPORTANT)
│   ├── test_danl.py               # Comprehensive test suite
│   ├── validate_danl.py           # Convergence validation
│   └── README.md                   # Quick start guide
├── persistence/                    # AI agent memory storage
│   ├── danl-h2gnn/                # H²GNN learned concepts
│   │   ├── memories/              # Individual embeddings
│   │   ├── snapshots/             # Consolidated understanding
│   │   └── progress/              # Learning curves
│   └── ...                        # Other agent instances
├── types/
│   └── epistemic-node.ts          # TypeScript schema for docs
├── tools/
│   └── validate-epistemic-topology.js  # Doc validator
├── web-ui/                        # Interactive interface
├── AGENTS.md                      # AI agent architecture guide
├── PERSISTENCE_AND_FEDERATED_IDENTITY.md  # Detailed technical docs
├── DANL_CST_H2GNN_INTEGRATION_REPORT.md  # Integration test results
├── danl-core.scm                  # Alternative Scheme entry point
├── danl-rules.pl                  # Alternative Prolog entry point
├── danl-queries.dl                # Alternative Datalog entry point
└── *.md                           # Research papers and theory docs
```

## Development Workflow

### Adding New Documentation

1. Choose appropriate level (gateway/foundational/practical/applied)
2. Create file with YAML front matter following `types/epistemic-node.ts` schema
3. Add to appropriate `INDEX.md` in that level's directory
4. Run `npm run validate` to check structure
5. Update prerequisite chains if adding foundational concepts

**Critical**: Every document must have:
- Unique `id` in kebab-case
- Appropriate `level` and `type`
- `prerequisites` array (empty for gateway nodes)
- `readingTime` and `difficulty` estimates

### Modifying DANL Semantics

When changing lattice operations, transition rules, or M/S descriptors:

1. **Update the source of truth**: `decentralized_automaton_network/docs/lattice_spec.json`
2. **Regenerate Scheme code**: Update lattice definitions in `scheme/danl.scm`
3. **Regenerate Prolog facts**: Update join/meet tables in `prolog/danl.pl`
4. **Regenerate Datalog rules**: Update aggregators in `datalog/danl.dl`
5. **Run tests**: `python3 test_danl.py` to verify cross-language consistency

### Key Implementation Patterns

#### M/S-Expression Duality (Homoiconicity)

Every transition rule is stored as a pair:
- **Meta** (M-expression): Human-readable intent as vector/keyword structure
- **Structural** (S-expression): Executable Scheme/Prolog/Datalog code

This enables:
- CQRS architecture (commands compile to events)
- Complete audit trails
- Self-describing systems

Implementation: See `ms->callable` and `ms->description` in Scheme orchestrator.

#### Observable Parameterization (τ-products)

Each node has a `tau-coefficient` that pairs latent state with geometry-dependent coefficients, analogous to computer vision's `tZ·β` encoding. This tracks implicit knowledge (UK) in the system.

#### Fixpoint Detection

Scheme uses the **Z-combinator** (applicative-order Y-combinator) for fixpoint detection in `simulate-network`. The plain Y-combinator is also provided for analytical completeness and lazy evaluation.

## Research Paper Structure

The main research paper is `DECENTRALIZED_AUTOMATON_NETWORK_LATTICE_PAPER.md`. Additional theory papers in the root:
- Observable epistemic parameterization
- Tropical resolution of degeneracy
- Geometric subsidiarity
- Max-plus rig causality
- Grothendieck schemes for distributed state

These are reference materials; the main paper is comprehensive.

## Important Notes

### Documentation Philosophy

This project serves **multiple audiences simultaneously**:
- General public (gateway)
- Students/learners (foundational)
- Software engineers (practical)
- Researchers/academics (applied + papers)

When editing documentation:
- **Gateway level**: Zero prerequisites, heavy analogies, focus on "why"
- **Foundational level**: Basic programming assumed, explain concepts, focus on "what"
- **Practical level**: Intermediate skills assumed, show code, focus on "how"
- **Applied level**: Production experience assumed, show patterns, focus on "when"

### Cross-Language Synchronization

The three languages (Scheme, Prolog, Datalog) must remain synchronized. They implement the **same lattice semantics** with different computational models:
- Scheme: Eager evaluation, iterative simulation
- Prolog: Backward chaining, proof search
- Datalog: Forward chaining, stratified fixpoint

Test suite (`test_danl.py`) verifies they converge to identical results.

### Rig-Based Causality

The system uses **max-plus algebra** (tropical semiring) for irreversible causal flow. Join operations distribute over delay operators, mirroring physical causality where time only moves forward. This is a core innovation distinguishing DANL from traditional consensus systems.

### Geometric Consensus Thresholds

Consensus thresholds derive from **Platonic solid geometry**, not arbitrary rules:
- 4 nodes (tetrahedron) → 75% threshold
- 8 nodes (cube) → 50% threshold
- 12 nodes (icosahedron) → 25% threshold

See `docs/foundational/platonic-solids.md` for the mathematical justification.

## Common Tasks

### Run all three implementations and verify convergence
```bash
cd decentralized_automaton_network
guile scheme/danl.scm && \
swipl -g "run_examples" -t halt prolog/danl.pl && \
souffle datalog/danl.dl
```

### Validate documentation structure
```bash
npm run validate
```

### Run Python test suite
```bash
cd decentralized_automaton_network
python3 test_danl.py
```

### Open interactive knowledge graph
```bash
# Open in browser
xdg-open docs/assets/knowledge-graph.html
# or
open docs/assets/knowledge-graph.html
```

### Check available interpreters
```bash
which guile racket swipl souffle python3 node
```

## Git Workflow

This is a public research project. When committing:
- Use descriptive commit messages
- Keep research papers and implementation separate when possible
- Update `docs/INDEX.md` when adding new documentation nodes
- Run validation before pushing: `npm run validate`
- Multiple markdown files in root are research drafts; main docs are in `docs/`

The project uses conventional commits but is flexible on format.

## Key Documentation Files

### Core Documentation
- **[AGENTS.md](AGENTS.md)** - AI agent architecture, persistence, federated identity
- **[PERSISTENCE_AND_FEDERATED_IDENTITY.md](PERSISTENCE_AND_FEDERATED_IDENTITY.md)** - Technical deep-dive on storage and HD addressing
- **[DANL_CST_H2GNN_INTEGRATION_REPORT.md](DANL_CST_H2GNN_INTEGRATION_REPORT.md)** - Integration test results and validation
- **[CLAUDE.md](CLAUDE.md)** - This file (project overview for Claude Code)

### Research Papers
- **[DECENTRALIZED_AUTOMATON_NETWORK_LATTICE_PAPER.md](DECENTRALIZED_AUTOMATON_NETWORK_LATTICE_PAPER.md)** - Main research paper
- **Observable Epistemic Parameterization** papers - τ-coefficient theory
- **Tropical Resolution of Epistemic Degeneracy** - Max-plus algebra
- **Geometric Subsidiarity** - Consensus threshold derivation

### Implementation Guides
- **[decentralized_automaton_network/README.md](decentralized_automaton_network/README.md)** - Quick start for DANL
- **[docs/INDEX.md](docs/INDEX.md)** - Epistemic topology navigation hub
- **[docs/practical/quick-start.md](docs/practical/quick-start.md)** - Getting started guide
