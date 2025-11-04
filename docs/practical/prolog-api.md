---
id: prolog-api
title: "Prolog API Reference"
level: practical
type: implementation
tags: ["prolog", "api", "reference", "predicates", "epistemic"]
keywords: ["prolog", "predicate", "api", "reference", "epistemic-state", "consensus"]
prerequisites: ["prolog-rules"]
enables: ["testing-guide", "api-reference"]
related: ["datalog-api", "scheme-api"]
readingTime: 40
difficulty: 2
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Prolog API Reference

> **Complete predicate reference for DANL Prolog implementation**

This document provides a complete API reference for all Prolog predicates in `danl-rules.pl`. Use this as a quick reference when writing Prolog queries and rules.

## Module Interface

### Module Declaration

```prolog
:- module(danl_rules, [
    epistemic_state/5,
    observable_params/6,
    certainty/3,
    confidence/3,
    geometric_level/3,
    consensus_achieved/3,
    network_consensus/4,
    lattice_join/3,
    lattice_meet/3,
    happens_before/2,
    causal_history/2
]).
```

## Epistemic State Predicates

### epistemic_state/5

**Signature**: `epistemic_state(+Agent, -KK, -KU, -UK, -UU)`

**Description**: Get epistemic state for an agent.

**Arguments**:
- `Agent` (atom): Agent identifier
- `KK` (number): Known Knowns count
- `KU` (number): Known Unknowns count
- `UK` (number): Unknown Knowns count
- `UU` (number): Unknown Unknowns count

**Example**:
```prolog
?- epistemic_state(alice, KK, KU, UK, UU).
KK = 100,
KU = 50,
UK = 30,
UU = 20.
```

## Observable Parameterization Predicates

### observable_params/6

**Signature**: `observable_params(+Agent, +Vertices, -KKObs, -KUObs, -TauUK, -TauUU)`

**Description**: Compute observable parameters from epistemic state.

**Arguments**:
- `Agent` (atom): Agent identifier
- `Vertices` (number): Number of vertices (4, 8, 12, 20, 120)
- `KKObs` (number): Observable KK (same as KK)
- `KUObs` (number): Observable KU (same as KU)
- `TauUK` (number): Observable product τ_UK = UK · φ(V)
- `TauUU` (number): Observable product τ_UU = UU · d_inner

**Example**:
```prolog
?- observable_params(alice, 12, KKObs, KUObs, TauUK, TauUU).
KKObs = 100,
KUObs = 50,
TauUK = 120,  % 30 * φ(12) = 30 * 4
TauUU = 90.   % 20 * (12/4) = 20 * 3
```

### recover_epistemic/9

**Signature**: `recover_epistemic(+Vertices, +KKObs, +KUObs, +TauUK, +TauUU, -KK, -KU, -UK, -UU)`

**Description**: Recover latent epistemic state from observable parameters.

**Arguments**:
- `Vertices` (number): Number of vertices
- `KKObs` (number): Observable KK
- `KUObs` (number): Observable KU
- `TauUK` (number): Observable product τ_UK
- `TauUU` (number): Observable product τ_UU
- `KK` (number): Recovered KK
- `KU` (number): Recovered KU
- `UK` (number): Recovered UK
- `UU` (number): Recovered UU

**Example**:
```prolog
?- recover_epistemic(12, 100, 50, 120, 90, KK, KU, UK, UU).
KK = 100,
KU = 50,
UK = 30,  % 120 / φ(12) = 120 / 4
UU = 20.  % 90 / (12/4) = 90 / 3
```

### euler_phi/2

**Signature**: `euler_phi(+N, -Phi)`

**Description**: Compute Euler's totient function φ(n).

**Arguments**:
- `N` (number): Input number
- `Phi` (number): Totient value

**Example**:
```prolog
?- euler_phi(12, Phi).
Phi = 4.  % Coprimes: 1, 5, 7, 11
```

## Certainty and Confidence Predicates

### certainty/3

**Signature**: `certainty(+Agent, +Vertices, -C)`

**Description**: Calculate certainty C = KK / (1 + τ_UK/KK).

**Arguments**:
- `Agent` (atom): Agent identifier
- `Vertices` (number): Number of vertices
- `C` (float): Certainty value (0.0 to 1.0)

**Example**:
```prolog
?- certainty(alice, 12, C).
C = 0.8333333333333334.  % 100 / (1 + 120/100)
```

### confidence/3

**Signature**: `confidence(+Agent, +Vertices, -Conf)`

**Description**: Calculate confidence Conf = KU / (1 + τ_UU/KU).

**Arguments**:
- `Agent` (atom): Agent identifier
- `Vertices` (number): Number of vertices
- `Conf` (float): Confidence value (0.0 to 1.0)

**Example**:
```prolog
?- confidence(alice, 12, Conf).
Conf = 0.5882352941176471.  % 50 / (1 + 90/50)
```

### sensitivity_tau_uk/3

**Signature**: `sensitivity_tau_uk(+KK, +TauUK, -Sens)`

**Description**: Calculate sensitivity of certainty to τ_UK.

**Arguments**:
- `KK` (number): Known Knowns
- `TauUK` (number): Observable product τ_UK
- `Sens` (float): Sensitivity value

**Example**:
```prolog
?- sensitivity_tau_uk(100, 120, Sens).
Sens = -0.3471074380165289.  % -1 / (1 + 120/100)^2
```

## Geometric Consensus Predicates

### geometric_level/3

**Signature**: `geometric_level(+Certainty, +Size, -Geometry)`

**Description**: Select geometry based on certainty and network size.

**Arguments**:
- `Certainty` (float): Certainty value (0.0 to 1.0)
- `Size` (number): Network size (number of nodes)
- `Geometry` (atom): Selected geometry (tetrahedron, cube, icosahedron, dodecahedron, '600-cell')

**Example**:
```prolog
?- geometric_level(0.8, 4, Geometry).
Geometry = tetrahedron.

?- geometric_level(0.5, 8, Geometry).
Geometry = cube.

?- geometric_level(0.3, 12, Geometry).
Geometry = icosahedron.
```

### threshold/2

**Signature**: `threshold(+Geometry, -Tau)`

**Description**: Get consensus threshold for geometry.

**Arguments**:
- `Geometry` (atom): Geometry name
- `Tau` (float): Threshold value (0.0 to 1.0)

**Example**:
```prolog
?- threshold(tetrahedron, Tau).
Tau = 0.75.

?- threshold(cube, Tau).
Tau = 0.50.

?- threshold(icosahedron, Tau).
Tau = 0.25.
```

### consensus_achieved/3

**Signature**: `consensus_achieved(+Agreeing, +Total, +Geometry)`

**Description**: Check if consensus achieved for geometry.

**Arguments**:
- `Agreeing` (number): Number of agreeing nodes
- `Total` (number): Total number of nodes
- `Geometry` (atom): Geometry name

**Example**:
```prolog
?- consensus_achieved(3, 4, tetrahedron).
true.

?- consensus_achieved(2, 4, tetrahedron).
false.
```

### network_consensus/4

**Signature**: `network_consensus(+Network, +Proposal, +Geometry, -Result)`

**Description**: Check network-wide consensus.

**Arguments**:
- `Network` (list): List of agent identifiers
- `Proposal` (atom): Proposal identifier
- `Geometry` (atom): Geometry name
- `Result` (term): Consensus result (consensus(AgreeCount, Total, Geometry) or no_consensus(...))

**Example**:
```prolog
?- network_consensus([alice, bob, carol], proposal1, tetrahedron, Result).
Result = consensus(2, 3, tetrahedron).

?- network_consensus([alice, bob, carol], proposal1, tetrahedron, Result).
Result = no_consensus(1, 3, tetrahedron).
```

## Lattice Operations

### lattice_join/3

**Signature**: `lattice_join(+State1, +State2, -JoinedState)`

**Description**: Compute least upper bound (join) of two epistemic states.

**Arguments**:
- `State1` (term): Epistemic state `epistemic(KK1, KU1, UK1, UU1)`
- `State2` (term): Epistemic state `epistemic(KK2, KU2, UK2, UU2)`
- `JoinedState` (term): Joined state `epistemic(KKJoin, KUJoin, UKJoin, UUJoin)`

**Example**:
```prolog
?- lattice_join(epistemic(10, 5, 3, 2), 
                epistemic(8, 7, 4, 1),
                Joined).
Joined = epistemic(10, 7, 4, 1).
```

### lattice_meet/3

**Signature**: `lattice_meet(+State1, +State2, -MeetState)`

**Description**: Compute greatest lower bound (meet) of two epistemic states.

**Arguments**:
- `State1` (term): Epistemic state
- `State2` (term): Epistemic state
- `MeetState` (term): Meet state

**Example**:
```prolog
?- lattice_meet(epistemic(10, 5, 3, 2), 
                epistemic(8, 7, 4, 1),
                Meet).
Meet = epistemic(8, 5, 3, 2).
```

### epistemic_less_equal/2

**Signature**: `epistemic_less_equal(+State1, +State2)`

**Description**: Check if State1 ≤ State2 in epistemic ordering.

**Arguments**:
- `State1` (term): Epistemic state
- `State2` (term): Epistemic state

**Example**:
```prolog
?- epistemic_less_equal(epistemic(10, 5, 3, 2),
                        epistemic(12, 6, 4, 1)).
true.
```

## Vector Clock Predicates

### vclock_less_than/2

**Signature**: `vclock_less_than(+VClock1, +VClock2)`

**Description**: Check if VClock1 happens before VClock2.

**Arguments**:
- `VClock1` (list): Vector clock `[Node-Time, ...]`
- `VClock2` (list): Vector clock `[Node-Time, ...]`

**Example**:
```prolog
?- vclock_less_than([node1-1, node2-0, node3-0],
                     [node1-1, node2-1, node3-0]).
true.
```

### vclock_equal/2

**Signature**: `vclock_equal(+VClock1, +VClock2)`

**Description**: Check if two vector clocks are equal.

**Arguments**:
- `VClock1` (list): Vector clock
- `VClock2` (list): Vector clock

**Example**:
```prolog
?- vclock_equal([node1-1, node2-1, node3-1],
                 [node1-1, node2-1, node3-1]).
true.
```

### vclock_concurrent/2

**Signature**: `vclock_concurrent(+VClock1, +VClock2)`

**Description**: Check if two vector clocks are concurrent.

**Arguments**:
- `VClock1` (list): Vector clock
- `VClock2` (list): Vector clock

**Example**:
```prolog
?- vclock_concurrent([node1-1, node2-0, node3-0],
                      [node1-0, node2-1, node3-0]).
true.
```

### happens_before/2

**Signature**: `happens_before(+Event1, +Event2)`

**Description**: Check if Event1 causally precedes Event2.

**Arguments**:
- `Event1` (atom): Event identifier
- `Event2` (atom): Event identifier

**Example**:
```prolog
?- happens_before(e1, e3).
true.
```

### causal_history/2

**Signature**: `causal_history(+Event, -History)`

**Description**: Get causal history of event.

**Arguments**:
- `Event` (atom): Event identifier
- `History` (list): List of event identifiers

**Example**:
```prolog
?- causal_history(e3, History).
History = [e1, e2].
```

### causally_independent/2

**Signature**: `causally_independent(+Event1, +Event2)`

**Description**: Check if two events are causally independent (concurrent).

**Arguments**:
- `Event1` (atom): Event identifier
- `Event2` (atom): Event identifier

## Hypergraph Synchronization Predicates

### can_synchronize/2

**Signature**: `can_synchronize(+Node1, +Node2)`

**Description**: Check if two nodes can synchronize (share a hyperedge).

**Arguments**:
- `Node1` (atom): Node identifier
- `Node2` (atom): Node identifier

**Example**:
```prolog
?- can_synchronize(node1, node2).
true.  % They share hyperedge e1
```

### synchronization_group/2

**Signature**: `synchronization_group(+Nodes, -Hyperedge)`

**Description**: Get hyperedge for synchronization group.

**Arguments**:
- `Nodes` (list): List of node identifiers
- `Hyperedge` (atom): Hyperedge identifier

**Example**:
```prolog
?- synchronization_group([node1, node2, node3], Hyperedge).
Hyperedge = e1.
```

### max_plus_reachable/3

**Signature**: `max_plus_reachable(+Node1, +Node2, -Path)`

**Description**: Check if Node2 is reachable from Node1 via Max-Plus path.

**Arguments**:
- `Node1` (atom): Source node
- `Node2` (atom): Target node
- `Path` (list): Path of nodes

**Example**:
```prolog
?- max_plus_reachable(node1, node3, Path).
Path = [node1, node2, node3].
```

## Grothendieck Spectrum Predicates

### prime_ideal/2

**Signature**: `prime_ideal(+Ideal, +Ring)`

**Description**: Check if Ideal is a prime ideal in Ring.

**Arguments**:
- `Ideal` (term): Ideal structure
- `Ring` (atom): Ring identifier

### maximal_continuation/2

**Signature**: `maximal_continuation(+Continuation, +State)`

**Description**: Check if Continuation is maximal for State.

**Arguments**:
- `Continuation` (term): Continuation structure
- `State` (term): State structure

### spectrum_point/2

**Signature**: `spectrum_point(+Point, +Ring)`

**Description**: Check if Point is a spectrum point in Ring.

**Arguments**:
- `Point` (term): Prime ideal
- `Ring` (atom): Ring identifier

### continuation_point/2

**Signature**: `continuation_point(+Point, +State)`

**Description**: Check if Point is a continuation point for State.

**Arguments**:
- `Point` (term): Maximal continuation
- `State` (term): State structure

### isomorphic_points/2

**Signature**: `isomorphic_points(+SpecPoint, +ContPoint)`

**Description**: Check if spectrum point corresponds to continuation point.

**Arguments**:
- `SpecPoint` (term): Spectrum point
- `ContPoint` (term): Continuation point

## Utility Predicates

### max_val/3

**Signature**: `max_val(+X, +Y, -Max)`

**Description**: Get maximum of two values.

**Arguments**:
- `X` (number): First value
- `Y` (number): Second value
- `Max` (number): Maximum value

### min_val/3

**Signature**: `min_val(+X, +Y, -Min)`

**Description**: Get minimum of two values.

**Arguments**:
- `X` (number): First value
- `Y` (number): Second value
- `Min` (number): Minimum value

## Example Queries

### Complete Workflow

```prolog
% Get epistemic state
?- epistemic_state(alice, KK, KU, UK, UU).
KK = 100, KU = 50, UK = 30, UU = 20.

% Calculate certainty
?- certainty(alice, 12, C).
C = 0.8333333333333334.

% Select geometry
?- geometric_level(0.833, 12, Geometry).
Geometry = icosahedron.

% Check consensus
?- consensus_achieved(3, 12, icosahedron).
true.

% Lattice join
?- lattice_join(epistemic(100, 50, 30, 20),
                epistemic(80, 60, 40, 25),
                Joined).
Joined = epistemic(100, 60, 40, 20).
```

## Error Handling

### Common Errors

**Undefined predicate**: Ensure module is loaded:
```prolog
:- use_module(danl_rules).
```

**Type errors**: Check argument types:
- Agents must be atoms
- Numbers must be integers or floats
- States must be `epistemic/4` terms

**Arithmetic errors**: Check for division by zero:
- `certainty/3` requires `KK > 0`
- `confidence/3` requires `KU > 0`

## Next Steps

- **Learn about rules**: [Prolog Rules](prolog-rules.md) - How rules work
- **See Datalog**: [Datalog API](datalog-api.md) - Related API
- **Test your code**: [Testing Guide](testing-guide.md) - How to test

## Related Resources

- [Prolog Rules](prolog-rules.md) - Rule explanations
- [Datalog API](datalog-api.md) - Related API
- [Testing Guide](testing-guide.md) - Testing approach
