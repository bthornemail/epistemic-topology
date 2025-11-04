---
id: datalog-api
title: "Datalog API Reference"
level: practical
type: implementation
tags: ["datalog", "api", "reference", "queries", "declarations"]
keywords: ["datalog", "api", "reference", "declaration", "relation", "query"]
prerequisites: ["datalog-queries"]
enables: ["testing-guide", "api-reference"]
related: ["prolog-api", "validation-tools"]
readingTime: 30
difficulty: 2
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Datalog API Reference

> **Complete API reference for DANL Datalog queries**

Complete reference for all Datalog declarations, relations, and queries in `danl-queries.dl`.

## Event Declarations

### event/4

**Declaration**: `.decl event(id: symbol, node: symbol, timestamp: number, vclock: symbol)`

**Description**: Basic event with identifier, node, timestamp, and vector clock.

**Example**:
```datalog
event("e1", "node1", 1000, "vc1").
```

### binding_created/3

**Declaration**: `.decl binding_created(event: symbol, identifier: symbol, scope: symbol)`

**Description**: Event that created a binding.

**Example**:
```datalog
binding_created("e1", "x", "global").
```

### scope_entered/3

**Declaration**: `.decl scope_entered(event: symbol, scope_id: symbol, parent: symbol)`

**Description**: Event that entered a scope.

**Example**:
```datalog
scope_entered("e3", "scope1", "global").
```

### rpc_called/3

**Declaration**: `.decl rpc_called(event: symbol, target_node: symbol, method: symbol)`

**Description**: Event that called an RPC.

**Example**:
```datalog
rpc_called("e2", "node3", "compute").
```

### query_executed/3

**Declaration**: `.decl query_executed(event: symbol, predicate: symbol, result: symbol)`

**Description**: Event that executed a query.

## Vector Clock Declarations

### vclock_component/3

**Declaration**: `.decl vclock_component(vclock: symbol, node: symbol, time: number)`

**Description**: Component of a vector clock.

**Example**:
```datalog
vclock_component("vc1", "node1", 1).
vclock_component("vc1", "node2", 0).
```

### vclock_less_equal/2

**Declaration**: `.decl vclock_less_equal(vc1: symbol, vc2: symbol)`

**Description**: Check if VC1 ≤ VC2.

### vclock_equal/2

**Declaration**: `.decl vclock_equal(vc1: symbol, vc2: symbol)`

**Description**: Check if two vector clocks are equal.

### happens_before/2

**Declaration**: `.decl happens_before(e1: symbol, e2: symbol)`

**Description**: Event e1 causally precedes e2.

### concurrent/2

**Declaration**: `.decl concurrent(e1: symbol, e2: symbol)`

**Description**: Events e1 and e2 are concurrent.

## Causal History Declarations

### causal_ancestor/2

**Declaration**: `.decl causal_ancestor(event: symbol, ancestor: symbol)`

**Description**: Ancestor is in causal history of event.

**Example**:
```datalog
causal_ancestor("e3", "e1").
causal_ancestor("e3", "e2").
```

## Hypergraph Declarations

### hyperedge/2

**Declaration**: `.decl hyperedge(id: symbol, members: symbol)`

**Description**: Hyperedge with identifier and member nodes.

**Example**:
```datalog
hyperedge("he1", "node1,node2,node3").
```

### in_hyperedge/2

**Declaration**: `.decl in_hyperedge(node: symbol, hyperedge: symbol)`

**Description**: Node is in hyperedge.

### can_sync/2

**Declaration**: `.decl can_sync(n1: symbol, n2: symbol)`

**Description**: Nodes n1 and n2 can synchronize.

### sync_group/2

**Declaration**: `.decl sync_group(hyperedge: symbol, nodes: symbol)`

**Description**: Synchronization group from hyperedge.

### max_plus_reachable/2

**Declaration**: `.decl max_plus_reachable(from: symbol, to: symbol)`

**Description**: Node `to` is reachable from node `from`.

### max_plus_path/3

**Declaration**: `.decl max_plus_path(from: symbol, to: symbol, hops: number)`

**Description**: Path from `from` to `to` with hop count.

## Epistemic State Declarations

### epistemic_state/5

**Declaration**: `.decl epistemic_state(agent: symbol, kk: number, ku: number, uk: number, uu: number)`

**Description**: Epistemic state of agent.

**Example**:
```datalog
epistemic_state("alice", 100, 50, 30, 20).
```

### observable_params/6

**Declaration**: `.decl observable_params(agent: symbol, vertices: number, kk: number, ku: number, tau_uk: number, tau_uu: number)`

**Description**: Observable parameters from epistemic state.

### geometric_level/3

**Declaration**: `.decl geometric_level(agent: symbol, level: symbol, vertices: number)`

**Description**: Geometric level for agent.

**Example**:
```datalog
geometric_level("alice", "tetrahedron", 4).
```

### threshold/2

**Declaration**: `.decl threshold(level: symbol, value: float)`

**Description**: Consensus threshold for geometry level.

**Example**:
```datalog
threshold("tetrahedron", 0.75).
threshold("cube", 0.50).
threshold("icosahedron", 0.25).
```

## Certainty and Confidence Declarations

### certainty/3

**Declaration**: `.decl certainty(agent: symbol, vertices: number, value: float)`

**Description**: Certainty value for agent.

### confidence/3

**Declaration**: `.decl confidence(agent: symbol, vertices: number, value: float)`

**Description**: Confidence value for agent.

## Consensus Declarations

### proposal/2

**Declaration**: `.decl proposal(id: symbol, description: symbol)`

**Description**: Consensus proposal.

**Example**:
```datalog
proposal("prop1", "Upgrade system to V2").
```

### agrees/2

**Declaration**: `.decl agrees(agent: symbol, proposal: symbol)`

**Description**: Agent agrees with proposal.

**Example**:
```datalog
agrees("alice", "prop1").
agrees("bob", "prop1").
```

### consensus_result/4

**Declaration**: `.decl consensus_result(proposal: symbol, agreeing: number, total: number, achieved: symbol)`

**Description**: Consensus result for proposal.

**Example**:
```datalog
consensus_result("prop1", 3, 4, "yes").
```

## Lattice Operations

### lattice_join_result/6

**Declaration**: `.decl lattice_join_result(a1: symbol, a2: symbol, kk: number, ku: number, uk: number, uu: number)`

**Description**: Lattice join result of two agents.

## Network Aggregation Declarations

### network_total_knowledge/4

**Declaration**: `.decl network_total_knowledge(total_kk: number, total_ku: number, total_uk: number, total_uu: number)`

**Description**: Total knowledge across network.

### network_average_certainty/1

**Declaration**: `.decl network_average_certainty(avg_certainty: float)`

**Description**: Average certainty across network.

## Anomaly Detection Declarations

### causal_anomaly/3

**Declaration**: `.decl causal_anomaly(e1: symbol, e2: symbol, reason: symbol)`

**Description**: Causal anomaly between events.

**Example**:
```datalog
causal_anomaly("e1", "e2", "time_reversal").
causal_anomaly("e1", "e2", "concurrent_conflict").
causal_anomaly("e1", "e2", "causal_cycle").
```

## Grothendieck Spectrum Declarations

### binding/2

**Declaration**: `.decl binding(identifier: symbol, scope: symbol)`

**Description**: Binding in scope.

### scope_parent/2

**Declaration**: `.decl scope_parent(child: symbol, parent: symbol)`

**Description**: Parent-child scope relationship.

### ideal/2

**Declaration**: `.decl ideal(id: symbol, elements: symbol)`

**Description**: Ideal in ring.

### ideal_element/2

**Declaration**: `.decl ideal_element(ideal: symbol, element: symbol)`

**Description**: Element in ideal.

### prime_ideal/1

**Declaration**: `.decl prime_ideal(ideal: symbol)`

**Description**: Prime ideal.

### maximal_ideal/1

**Declaration**: `.decl maximal_ideal(ideal: symbol)`

**Description**: Maximal ideal.

### spectrum_point/2

**Declaration**: `.decl spectrum_point(point: symbol, ring: symbol)`

**Description**: Point in spectrum.

### continuation/3

**Declaration**: `.decl continuation(id: symbol, state: symbol, stack: symbol)`

**Description**: Continuation.

### maximal_continuation/1

**Declaration**: `.decl maximal_continuation(cont: symbol)`

**Description**: Maximal continuation.

### corresponds/2

**Declaration**: `.decl corresponds(spec_point: symbol, continuation: symbol)`

**Description**: Correspondence between spectrum point and continuation.

## Output Relations

### Output Declaration

**Syntax**: `.output relation_name`

**Description**: Specify which relations to output.

**Example**:
```datalog
.output happens_before
.output concurrent
.output causal_anomaly
.output causal_ancestor
.output can_sync
.output max_plus_reachable
.output certainty
.output confidence
.output consensus_result
.output network_total_knowledge
.output network_average_certainty
.output lattice_join_result
```

## Helper Declarations

### node_in_list/2

**Declaration**: `.decl node_in_list(node: symbol, list: symbol)`

**Description**: Check if node is in list.

### euler_phi/2

**Declaration**: `.decl euler_phi(n: number, phi: number)`

**Description**: Euler's totient function.

**Example**:
```datalog
euler_phi(4, 2).
euler_phi(8, 4).
euler_phi(12, 4).
euler_phi(20, 8).
euler_phi(120, 32).
```

### inner_dim/3

**Declaration**: `.decl inner_dim(v: number, phi: number, d: float)`

**Description**: Inner dimension calculation.

### ring/1

**Declaration**: `.decl ring(id: symbol)`

**Description**: Ring identifier.

**Example**:
```datalog
ring("R_Scheme").
```

## Query Patterns

### Simple Query

```datalog
happens_before(E1, E2)?
```

### Aggregation Query

```datalog
Total = count : happens_before(E1, E2)?
```

### Conditional Query

```datalog
concurrent(E1, E2) :-
    event(E1, _, _, VC1),
    event(E2, _, _, VC2),
    E1 != E2,
    !vclock_less_equal(VC1, VC2),
    !vclock_less_equal(VC2, VC1).
```

## Type System

### Types

- `symbol`: String identifier
- `number`: Integer value
- `float`: Floating-point value

### Type Conversion

- `to_float(number)`: Convert number to float
- `to_int(float)`: Convert float to integer

## Operators

### Comparison Operators

- `=`: Equality
- `!=`: Inequality
- `>`, `<`, `>=`, `<=`: Comparison

### Arithmetic Operators

- `+`, `-`, `*`, `/`: Arithmetic operations
- `max`, `min`: Maximum/minimum

### Logical Operators

- `!`: Negation
- `,`: Conjunction (AND)
- `;`: Disjunction (OR)

## Next Steps

- **Learn queries**: [Datalog Queries](datalog-queries.md) - How to write queries
- **See Prolog**: [Prolog API](prolog-api.md) - Related API
- **Test queries**: [Testing Guide](testing-guide.md) - How to test

## Related Resources

- [Datalog Queries](datalog-queries.md) - Query examples
- [Prolog API](prolog-api.md) - Related API
- [Vector Clocks](vector-clocks.md) - Causal ordering theory
