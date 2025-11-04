---
id: api-reference
title: "Complete API Reference"
level: practical
type: implementation
tags: ["api", "reference", "scheme", "prolog", "datalog"]
keywords: ["api", "reference", "scheme", "prolog", "datalog", "complete"]
prerequisites: ["scheme-api", "prolog-api", "datalog-api"]
enables: ["protocol-specs"]
related: ["scheme-api", "prolog-api", "datalog-api"]
readingTime: 60
difficulty: 3
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Complete API Reference

> **Consolidated API reference for Scheme, Prolog, and Datalog**

Complete reference for all DANL APIs across Scheme, Prolog, and Datalog implementations. Use this as the definitive API reference.

## Quick Reference

### By Category

- **Epistemic State** - [Scheme](#scheme-epistemic-state) | [Prolog](#prolog-epistemic-state) | [Datalog](#datalog-epistemic-state)
- **Vector Clocks** - [Scheme](#scheme-vector-clocks) | [Prolog](#prolog-vector-clocks) | [Datalog](#datalog-vector-clocks)
- **Consensus** - [Scheme](#scheme-consensus) | [Prolog](#prolog-consensus) | [Datalog](#datalog-consensus)
- **Hypergraphs** - [Scheme](#scheme-hypergraphs) | [Prolog](#prolog-hypergraphs) | [Datalog](#datalog-hypergraphs)

## Scheme API

### Epistemic State

| Function | Signature | Description |
|----------|-----------|-------------|
| `make-epistemic` | `(make-epistemic kk ku uk uu)` | Create epistemic state |
| `epistemic-kk` | `(epistemic-kk state)` | Get Known Knowns |
| `epistemic-ku` | `(epistemic-ku state)` | Get Known Unknowns |
| `epistemic-uk` | `(epistemic-uk state)` | Get Unknown Knowns |
| `epistemic-uu` | `(epistemic-uu state)` | Get Unknown Unknowns |
| `lattice-join` | `(lattice-join states)` | Join epistemic states |
| `lattice-meet` | `(lattice-meet states)` | Meet epistemic states |

### Observable Parameterization

| Function | Signature | Description |
|----------|-----------|-------------|
| `parameterize-epistemic` | `(parameterize-epistemic epistemic vertices)` | Convert to observable |
| `recover-epistemic` | `(recover-epistemic observable)` | Recover from observable |
| `euler-phi` | `(euler-phi n)` | Euler's totient function |
| `inner-dimension` | `(inner-dimension v)` | Inner dimension V/φ(V) |

### Vector Clocks

| Function | Signature | Description |
|----------|-----------|-------------|
| `make-vector-clock` | `(make-vector-clock clocks)` | Create vector clock |
| `make-initial-vclock` | `(make-initial-vclock nodes)` | Create initial vector clock |
| `increment-vclock` | `(increment-vclock vclock node)` | Increment node clock |
| `vclock-less-equal?` | `(vclock-less-equal? vc1 vc2)` | Check happens-before |

### Max-Plus Algebra

| Function | Signature | Description |
|----------|-----------|-------------|
| `max-plus-add` | `(max-plus-add a b)` | Max-Plus addition (max) |
| `max-plus-multiply` | `(max-plus-multiply a b)` | Max-Plus multiplication (+) |
| `max-plus-matvec` | `(max-plus-matvec matrix vector)` | Matrix-vector multiplication |
| `tropical-eigenvalue` | `(tropical-eigenvalue matrix iterations)` | Compute eigenvalue |

### Consensus

| Function | Signature | Description |
|----------|-----------|-------------|
| `geometric-threshold` | `(geometric-threshold geometry)` | Get threshold |
| `determine-geometric-level` | `(determine-geometric-level certainty size)` | Select geometry |
| `consensus-achieved?` | `(consensus-achieved? agreeing total geometry)` | Check consensus |

### Hypergraphs

| Function | Signature | Description |
|----------|-----------|-------------|
| `make-hypergraph` | `(make-hypergraph vertices edges)` | Create hypergraph |
| `make-hyperedge` | `(make-hyperedge id members)` | Create hyperedge |
| `hypergraph-neighbors` | `(hypergraph-neighbors hypergraph node-id)` | Get neighbors |

### Automatons

| Function | Signature | Description |
|----------|-----------|-------------|
| `make-automaton` | `(make-automaton id epistemic vclock conts events)` | Create automaton |
| `automaton-step` | `(automaton-step automaton hypergraph)` | Execute step |

## Prolog API

### Epistemic State

| Predicate | Signature | Description |
|-----------|-----------|-------------|
| `epistemic_state/5` | `epistemic_state(Agent, KK, KU, UK, UU)` | Get epistemic state |
| `observable_params/6` | `observable_params(Agent, Vertices, KKObs, KUObs, TauUK, TauUU)` | Observable params |
| `certainty/3` | `certainty(Agent, Vertices, C)` | Calculate certainty |
| `confidence/3` | `confidence(Agent, Vertices, Conf)` | Calculate confidence |

### Vector Clocks

| Predicate | Signature | Description |
|-----------|-----------|-------------|
| `vclock_less_than/2` | `vclock_less_than(VClock1, VClock2)` | Check happens-before |
| `vclock_equal/2` | `vclock_equal(VClock1, VClock2)` | Check equality |
| `vclock_concurrent/2` | `vclock_concurrent(VClock1, VClock2)` | Check concurrency |
| `happens_before/2` | `happens_before(Event1, Event2)` | Causal ordering |

### Consensus

| Predicate | Signature | Description |
|-----------|-----------|-------------|
| `geometric_level/3` | `geometric_level(Certainty, Size, Geometry)` | Select geometry |
| `threshold/2` | `threshold(Geometry, Tau)` | Get threshold |
| `consensus_achieved/3` | `consensus_achieved(Agreeing, Total, Geometry)` | Check consensus |
| `network_consensus/4` | `network_consensus(Network, Proposal, Geometry, Result)` | Network consensus |

### Lattice Operations

| Predicate | Signature | Description |
|-----------|-----------|-------------|
| `lattice_join/3` | `lattice_join(State1, State2, JoinedState)` | Join states |
| `lattice_meet/3` | `lattice_meet(State1, State2, MeetState)` | Meet states |

### Hypergraphs

| Predicate | Signature | Description |
|-----------|-----------|-------------|
| `can_synchronize/2` | `can_synchronize(Node1, Node2)` | Check synchronization |
| `max_plus_reachable/3` | `max_plus_reachable(Node1, Node2, Path)` | Check reachability |

## Datalog API

### Event Declarations

| Declaration | Signature | Description |
|-------------|-----------|-------------|
| `event/4` | `.decl event(id: symbol, node: symbol, timestamp: number, vclock: symbol)` | Event |
| `binding_created/3` | `.decl binding_created(event: symbol, identifier: symbol, scope: symbol)` | Binding event |
| `rpc_called/3` | `.decl rpc_called(event: symbol, target_node: symbol, method: symbol)` | RPC event |

### Vector Clocks

| Declaration | Signature | Description |
|-------------|-----------|-------------|
| `vclock_component/3` | `.decl vclock_component(vclock: symbol, node: symbol, time: number)` | Vector clock component |
| `vclock_less_equal/2` | `.decl vclock_less_equal(vc1: symbol, vc2: symbol)` | Ordering |
| `happens_before/2` | `.decl happens_before(e1: symbol, e2: symbol)` | Causal ordering |
| `concurrent/2` | `.decl concurrent(e1: symbol, e2: symbol)` | Concurrency |

### Consensus

| Declaration | Signature | Description |
|-------------|-----------|-------------|
| `epistemic_state/5` | `.decl epistemic_state(agent: symbol, kk: number, ku: number, uk: number, uu: number)` | Epistemic state |
| `consensus_result/4` | `.decl consensus_result(proposal: symbol, agreeing: number, total: number, achieved: symbol)` | Consensus result |

### Hypergraphs

| Declaration | Signature | Description |
|-------------|-----------|-------------|
| `hyperedge/2` | `.decl hyperedge(id: symbol, members: symbol)` | Hyperedge |
| `can_sync/2` | `.decl can_sync(n1: symbol, n2: symbol)` | Synchronization |
| `max_plus_reachable/2` | `.decl max_plus_reachable(from: symbol, to: symbol)` | Reachability |

## Common Patterns

### Pattern 1: Create and Query State

**Scheme**:
```scheme
(define state (make-epistemic 100 50 30 20))
(define observable (parameterize-epistemic state 12))
```

**Prolog**:
```prolog
epistemic_state(alice, KK, KU, UK, UU),
observable_params(alice, 12, KKObs, KUObs, TauUK, TauUU).
```

**Datalog**:
```datalog
epistemic_state("alice", 100, 50, 30, 20).
observable_params("alice", 12, KKObs, KUObs, TauUK, TauUU)?
```

### Pattern 2: Check Consensus

**Scheme**:
```scheme
(consensus-achieved? 3 4 'tetrahedron)  ; => #t
```

**Prolog**:
```prolog
consensus_achieved(3, 4, tetrahedron).  % => true
```

**Datalog**:
```datalog
consensus_result("prop1", 3, 4, "yes")?
```

### Pattern 3: Causal Ordering

**Scheme**:
```scheme
(vclock-less-equal? vc1 vc2)  ; Check happens-before
```

**Prolog**:
```prolog
happens_before(e1, e2).
```

**Datalog**:
```datalog
happens_before("e1", "e2")?
```

## API Comparison

### Epistemic State Creation

| Language | Syntax |
|----------|--------|
| **Scheme** | `(make-epistemic 100 50 30 20)` |
| **Prolog** | `epistemic_state(agent, 100, 50, 30, 20)` |
| **Datalog** | `epistemic_state("agent", 100, 50, 30, 20).` |

### Consensus Check

| Language | Syntax |
|----------|--------|
| **Scheme** | `(consensus-achieved? 3 4 'tetrahedron)` |
| **Prolog** | `consensus_achieved(3, 4, tetrahedron)` |
| **Datalog** | `consensus_result("prop", 3, 4, "yes")?` |

### Vector Clock Comparison

| Language | Syntax |
|----------|--------|
| **Scheme** | `(vclock-less-equal? vc1 vc2)` |
| **Prolog** | `vclock_less_than(VClock1, VClock2)` |
| **Datalog** | `vclock_less_equal(VC1, VC2)?` |

## Error Handling

### Scheme Errors

**Common errors**:
- `Unbound variable` - Variable not defined
- `Wrong number of arguments` - Argument mismatch
- `Type error` - Wrong type

**Handling**:
```scheme
(guard (ex
        ((eq? (exception-kind ex) 'unbound-variable)
         (display "Variable not defined\n")))
  (some-function undefined-var))
```

### Prolog Errors

**Common errors**:
- `Existence error` - Predicate not found
- `Type error` - Wrong type
- `Instantiation error` - Uninstantiated variable

**Handling**:
```prolog
catch(epistemic_state(Agent, KK, KU, UK, UU),
      Error,
      handle_error(Error)).
```

### Datalog Errors

**Common errors**:
- Syntax errors - Invalid syntax
- Type errors - Wrong type
- Query errors - Invalid query

## Performance Tips

### Scheme

1. **Use tail recursion** - Optimize recursive functions
2. **Memoize** - Cache expensive computations
3. **Avoid repeated lookups** - Store results

### Prolog

1. **Use indexing** - Index frequently queried predicates
2. **Cut operator** - Use `!` to prune search space
3. **Avoid deep recursion** - Use iterative approaches

### Datalog

1. **Index relations** - Create indexes
2. **Filter early** - Apply filters first
3. **Limit recursion** - Use depth limits

## Next Steps

- **Learn protocols**: [Protocol Specs](protocol-specs.md) - Protocol specifications
- **See configuration**: [Configuration](configuration.md) - Configuration guide
- **Check examples**: [First Automaton](first-automaton.md) - Examples

## Related Resources

- [Scheme API](scheme-api.md) - Scheme API details
- [Prolog API](prolog-api.md) - Prolog API details
- [Datalog API](datalog-api.md) - Datalog API details
