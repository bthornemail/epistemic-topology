# Decentralized Automaton Network Lattice (DANL)

**Complete implementation of a decentralized automaton network with lattice-theoretic fixpoint convergence, verified across Scheme, Prolog, and Datalog.**

## Overview

DANL orchestrates a decentralized automaton network whose local transition rules converge to a lattice-theoretic fixpoint representing distributed epistemic certainty. The system uses:

- **Lattice-ordered belief levels**: `bottom < potential < active < confident < top`
- **M/S-expression pairs**: Homoiconic rule definition (meta/structural)
- **Fixpoint combinators**: Y/Z combinators for convergence
- **Tri-paradigm reasoning**: Scheme (constructive), Prolog (declarative), Datalog (monotone)

## Architecture

### Three-Layer Implementation

1. **Scheme Orchestrator** (`scheme/danl.scm`)
   - R5RS-compliant reference implementation
   - Network simulation with fixpoint detection
   - JSON trace export for cross-language validation

2. **Prolog Verification Layer** (`prolog/danl.pl`)
   - Declarative verification of network dynamics
   - Convergence proofs and monotonicity verification
   - Trace validation from Scheme output

3. **Datalog Propagation Layer** (`datalog/danl.dl`)
   - Purely declarative fixpoint materialization
   - Max-aggregators over neighbor indices
   - Stable state detection and provenance tracking

### Shared Vocabulary

All layers import the same definitions from `docs/lattice_spec.json`:
- Lattice level enumeration
- Join/meet tables
- M/S descriptors
- Example network configuration

## Quick Start

### Prerequisites

- **Scheme**: R5RS-compliant interpreter (e.g., Guile, Chicken)
- **Prolog**: SWI-Prolog or compatible
- **Datalog**: Soufflé Datalog compiler

### Setup

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd decentralized_automaton_network
   ```

2. **Run Scheme orchestrator**:
   ```bash
   # Using Guile
   guile scheme/danl.scm
   
   # Or using Chicken Scheme
   csi scheme/danl.scm
   ```

3. **Run Prolog verification**:
   ```bash
   swipl prolog/danl.pl
   ?- run_examples.
   ```

4. **Run Datalog propagation**:
   ```bash
   souffle datalog/danl.dl
   ```

## Example Scenario: Perception → Inference → Consensus

### Network Description

Three nodes implementing a cognitive pipeline:

1. **perceptual-array**: Sensor fusion node
   - Initial state: `potential`
   - Transition: `propagate-belief` (joins with neighbors)
   - Neighbors: `inference-engine`

2. **inference-engine**: Reasoning node
   - Initial state: `active`
   - Transition: `interpret-evidence` (blends with tau-weighted neighbors)
   - Neighbors: `perceptual-array`, `consensus-forum`

3. **consensus-forum**: Decision node
   - Initial state: `potential`
   - Transition: `safeguard-consensus` (meets with ceiling constraint)
   - Neighbors: `inference-engine`

### Expected Outcome

Under typical conditions, all nodes converge to `confident`:
- Prolog proves monotonic growth
- Datalog reconstructs the same steady state
- Scheme trace shows convergence path

## Cross-Language Validation

### Round-Trip Workflow

1. **Scheme emits JSON trace**:
   ```scheme
   (export-example-trace-json)
   ```

2. **Prolog validates trace**:
   ```prolog
   ?- prove_monotonic_progress(TraceJson, Result).
   ```

3. **Datalog recomputes final state**:
   ```bash
   souffle datalog/danl.dl
   # Outputs stable(node, level) and edge_justification
   ```

### Validation Checks

- ✅ **Monotonicity**: Prolog verifies states only increase
- ✅ **Convergence**: Both Scheme and Datalog detect fixpoint
- ✅ **Equivalence**: Final states match across all three layers

## File Structure

```
decentralized_automaton_network/
├── docs/
│   ├── architecture_overview.md    # Complete architecture spec
│   └── lattice_spec.json            # Shared vocabulary
├── scheme/
│   └── danl.scm                     # Scheme orchestrator
├── prolog/
│   └── danl.pl                      # Prolog verification layer
├── datalog/
│   └── danl.dl                      # Datalog propagation layer
├── ui/
│   ├── index.html                   # Web visualization
│   └── assets/
│       ├── example_trace.json       # Sample trace data
│       └── app.js                   # Trace visualizer
└── README.md                        # This file
```

## M/S-Expression System

Each transition rule is stored as `(meta . structural)`:

- **Meta**: Human-readable description (vector/keyword-based)
- **Structural**: Executable Scheme/Prolog/Datalog code

### Example: propagate-belief

**Meta**: `propagate-belief self neighbors -> join self (fold join neighbors)`

**Structural** (Scheme):
```scheme
(lambda (self neighbors context)
  (let ((neighbor-join (assoc-ref context 'neighbor-join 'bottom)))
    (level-join self neighbor-join)))
```

**Structural** (Prolog):
```prolog
transition(Node, Self, Neighbors, Result, propagate_belief) :-
    list_join(Neighbors, NeighborJoin),
    level_join(Self, NeighborJoin, Result).
```

## Lattice Semantics

### Operations

- **Join (∨)**: Promotes most confident view (`max` over indices)
- **Meet (∧)**: Enforces conservative consensus (`min` over indices)

### Rig Embedding

Join distributes over monoidal delay operator, capturing irreversible causal accumulation (max-plus rig semantics).

## Fixpoint Detection

The Z-combinator iterates `step-network` until structural equality:

```scheme
(define (simulate-network initial)
  ((Z (lambda (recur)
        (lambda (current history)
          (if (network-states-equal? current next)
              (reverse history)
              (recur next (cons next history))))))
   initial (list initial)))
```

## Extensibility

### Adding New Automata

1. Define M/S descriptor in `lattice_spec.json`
2. Implement structural rule in Scheme
3. Implement same rule in Prolog
4. Implement same rule in Datalog

### Adding New Lattice Levels

1. Update `lattice_spec.json` with new level
2. Update level-index mappings in all three layers
3. Update join/meet tables

## Testing

### Scheme Tests

```scheme
;; Run example
(example-run)

;; Check iterations
(example-iterations)

;; View trace
(example-trace)
```

### Prolog Tests

```prolog
?- run_examples.
?- example_transition.
?- example_monotonicity.
?- example_convergence.
```

### Datalog Tests

```bash
souffle datalog/danl.dl
# Check output for stable() and edge_justification()
```

## Research Paper

A research paper draft (`docs/danl_research_paper.md`) documents:
- Theoretical foundations
- Implementation details
- Convergence proofs
- Evaluation results

## Contributing

When adding new features:
1. Implement in all three languages (Scheme, Prolog, Datalog)
2. Update shared vocabulary (`lattice_spec.json`)
3. Add tests and examples
4. Update documentation

## License

MIT License - See LICENSE file

## Authors

- Brian James Thorne
- Claude (Anthropic)

## Citation

If you use DANL in your research:

```bibtex
@software{danl,
  title = {Decentralized Automaton Network Lattice},
  author = {Thorne, Brian James and Claude},
  year = {2025},
  url = {https://github.com/your-org/danl}
}
```

## References

- **Lattice Theory**: See `docs/foundational/lattice-theory.md`
- **Max-Plus Algebra**: See `docs/foundational/max-plus-algebra.md`
- **Observable Parameterization**: See `docs/foundational/observable-parameterization.md`
- **Geometric Consensus**: See `docs/foundational/geometric-consensus.md`

---

**Ready to explore?** Start with `scheme/danl.scm` to see the orchestrator in action!
