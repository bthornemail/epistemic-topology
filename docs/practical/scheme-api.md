---
id: scheme-api
title: "Scheme API Reference"
level: practical
type: implementation
tags: ["scheme", "api", "reference", "functions", "r5rs"]
keywords: ["scheme", "api", "reference", "functions", "r5rs", "guile"]
prerequisites: ["scheme-core", "first-automaton"]
enables: ["api-reference"]
related: ["prolog-api", "datalog-api"]
readingTime: 50
difficulty: 3
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Scheme API Reference

> **Complete function reference for DANL Scheme implementation**

Complete API reference for all functions in `danl-core.scm`. Use this as a quick reference when writing Scheme code.

## Y/Z Combinators

### Y

**Signature**: `(Y f)`

**Description**: Y-combinator for lazy evaluation (normal order).

**Type**: `((a -> a) -> a) -> a`

**Example**:
```scheme
(define factorial
  (Y (lambda (fact)
       (lambda (n)
         (if (<= n 1)
             1
             (* n (fact (- n 1))))))))

(factorial 5)  ; => 120
```

### Z

**Signature**: `(Z f)`

**Description**: Z-combinator for strict evaluation (applicative order).

**Type**: `((a -> a) -> a) -> a`

**Example**:
```scheme
(define fibonacci
  (Z (lambda (fib)
       (lambda (n)
         (cond
           ((<= n 0) 0)
           ((= n 1) 1)
           (else (+ (fib (- n 1)) (fib (- n 2)))))))))

(fibonacci 10)  ; => 55
```

## Epistemic State Functions

### make-epistemic

**Signature**: `(make-epistemic kk ku uk uu)`

**Description**: Create epistemic state.

**Arguments**:
- `kk` (number): Known Knowns
- `ku` (number): Known Unknowns
- `uk` (number): Unknown Knowns
- `uu` (number): Unknown Unknowns

**Returns**: `epistemic-state` record

**Example**:
```scheme
(define state (make-epistemic 100 50 30 20))
```

### epistemic-kk

**Signature**: `(epistemic-kk state)`

**Description**: Get Known Knowns from epistemic state.

**Returns**: number

### epistemic-ku

**Signature**: `(epistemic-ku state)`

**Description**: Get Known Unknowns from epistemic state.

**Returns**: number

### epistemic-uk

**Signature**: `(epistemic-uk state)`

**Description**: Get Unknown Knowns from epistemic state.

**Returns**: number

### epistemic-uu

**Signature**: `(epistemic-uu state)`

**Description**: Get Unknown Unknowns from epistemic state.

**Returns**: number

### epistemic-kk-set!

**Signature**: `(epistemic-kk-set! state kk)`

**Description**: Set Known Knowns in epistemic state.

**Returns**: void

### epistemic-equal?

**Signature**: `(epistemic-equal? s1 s2)`

**Description**: Check if two epistemic states are equal.

**Returns**: boolean

**Example**:
```scheme
(epistemic-equal? 
  (make-epistemic 100 50 30 20)
  (make-epistemic 100 50 30 20))  ; => #t
```

### epistemic-less-equal?

**Signature**: `(epistemic-less-equal? s1 s2)`

**Description**: Check if s1 ≤ s2 in epistemic ordering.

**Returns**: boolean

**Example**:
```scheme
(epistemic-less-equal?
  (make-epistemic 10 5 3 2)
  (make-epistemic 12 6 4 1))  ; => #t
```

## Observable Parameterization

### parameterize-epistemic

**Signature**: `(parameterize-epistemic epistemic vertices)`

**Description**: Convert epistemic state to observable parameters.

**Arguments**:
- `epistemic` (epistemic-state): Epistemic state
- `vertices` (number): Number of vertices (4, 8, 12, 20, 120)

**Returns**: `observable-epistemic` record

**Example**:
```scheme
(define state (make-epistemic 100 50 30 20))
(define observable (parameterize-epistemic state 12))
```

### recover-epistemic

**Signature**: `(recover-epistemic observable)`

**Description**: Recover epistemic state from observable parameters.

**Arguments**:
- `observable` (observable-epistemic): Observable parameters

**Returns**: `epistemic-state` record

**Example**:
```scheme
(define state (recover-epistemic observable))
```

### observable-kk

**Signature**: `(observable-kk observable)`

**Description**: Get observable KK (same as KK).

**Returns**: number

### observable-ku

**Signature**: `(observable-ku observable)`

**Description**: Get observable KU (same as KU).

**Returns**: number

### observable-tau-uk

**Signature**: `(observable-tau-uk observable)`

**Description**: Get observable product τ_UK = UK · φ(V).

**Returns**: number

### observable-tau-uu

**Signature**: `(observable-tau-uu observable)`

**Description**: Get observable product τ_UU = UU · d_inner.

**Returns**: number

### sensitivity-to-tau-uk

**Signature**: `(sensitivity-to-tau-uk kk tau-uk)`

**Description**: Calculate sensitivity of certainty to τ_UK.

**Returns**: number

### sensitivity-to-direct-uk

**Signature**: `(sensitivity-to-direct-uk kk tau-uk phi)`

**Description**: Calculate sensitivity of certainty to direct UK.

**Returns**: number

### sensitivity-ratio

**Signature**: `(sensitivity-ratio kk tau-uk phi)`

**Description**: Calculate sensitivity ratio (observable vs direct).

**Returns**: number

## Number Theory Functions

### euler-phi

**Signature**: `(euler-phi n)`

**Description**: Compute Euler's totient function φ(n).

**Arguments**:
- `n` (number): Input number

**Returns**: number

**Example**:
```scheme
(euler-phi 12)  ; => 4
(euler-phi 8)   ; => 4
(euler-phi 4)   ; => 2
```

### inner-dimension

**Signature**: `(inner-dimension v)`

**Description**: Calculate inner dimension V/φ(V).

**Arguments**:
- `v` (number): Number of vertices

**Returns**: number

**Example**:
```scheme
(inner-dimension 12)  ; => 3.0 (12/4)
```

## M-Expression Functions

### make-m-expr

**Signature**: `(make-m-expr functor args)`

**Description**: Create M-expression.

**Arguments**:
- `functor` (symbol): Function name
- `args` (list): Arguments

**Returns**: `m-expr` record

**Example**:
```scheme
(define m-expr (make-m-expr 'create-binding '("x" "global")))
```

### m-expr-functor

**Signature**: `(m-expr-functor m-expr)`

**Description**: Get functor from M-expression.

**Returns**: symbol

### m-expr-args

**Signature**: `(m-expr-args m-expr)`

**Description**: Get arguments from M-expression.

**Returns**: list

### parse-m-expr

**Signature**: `(parse-m-expr str)`

**Description**: Parse M-expression from string.

**Arguments**:
- `str` (string): M-expression string

**Returns**: `m-expr` record

**Example**:
```scheme
(parse-m-expr "createBinding[x; global]")
```

### compile-m-expr

**Signature**: `(compile-m-expr m-expr state)`

**Description**: Compile M-expression to S-expression.

**Arguments**:
- `m-expr` (m-expr): M-expression
- `state` (state): Current state

**Returns**: `s-expr` record

## S-Expression Functions

### make-s-expr

**Signature**: `(make-s-expr type data timestamp vclock)`

**Description**: Create S-expression (event).

**Arguments**:
- `type` (symbol): Event type
- `data` (list): Event data
- `timestamp` (number): Timestamp
- `vclock` (vector-clock): Vector clock

**Returns**: `s-expr` record

**Example**:
```scheme
(define s-expr 
  (make-s-expr 'binding-created '("x" "global") 1234567890 vclock))
```

### s-expr-type

**Signature**: `(s-expr-type s-expr)`

**Description**: Get type from S-expression.

**Returns**: symbol

### s-expr-data

**Signature**: `(s-expr-data s-expr)`

**Description**: Get data from S-expression.

**Returns**: list

## Vector Clock Functions

### make-vector-clock

**Signature**: `(make-vector-clock clocks)`

**Description**: Create vector clock.

**Arguments**:
- `clocks` (list): List of (node . time) pairs

**Returns**: `vector-clock` record

### make-initial-vclock

**Signature**: `(make-initial-vclock nodes)`

**Description**: Create initial vector clock for nodes.

**Arguments**:
- `nodes` (list): List of node identifiers

**Returns**: `vector-clock` record

**Example**:
```scheme
(define vclock (make-initial-vclock '(node-1 node-2 node-3)))
```

### increment-vclock

**Signature**: `(increment-vclock vclock node)`

**Description**: Increment vector clock for node.

**Arguments**:
- `vclock` (vector-clock): Vector clock
- `node` (symbol): Node identifier

**Returns**: `vector-clock` record

**Example**:
```scheme
(define updated (increment-vclock vclock 'node-1))
```

### vclock-clocks

**Signature**: `(vclock-clocks vclock)`

**Description**: Get clocks from vector clock.

**Returns**: list of (node . time) pairs

### vclock-less-equal?

**Signature**: `(vclock-less-equal? vc1 vc2)`

**Description**: Check if vc1 ≤ vc2 (happens-before).

**Returns**: boolean

**Example**:
```scheme
(vclock-less-equal? vc1 vc2)  ; => #t if vc1 happens before vc2
```

### vclock-equal?

**Signature**: `(vclock-equal? vc1 vc2)`

**Description**: Check if two vector clocks are equal.

**Returns**: boolean

## Max-Plus Algebra Functions

### max-plus-add

**Signature**: `(max-plus-add a b)`

**Description**: Max-Plus addition (max).

**Arguments**:
- `a` (number): First value
- `b` (number): Second value

**Returns**: number

**Example**:
```scheme
(max-plus-add 3 5)  ; => 5
```

### max-plus-multiply

**Signature**: `(max-plus-multiply a b)`

**Description**: Max-Plus multiplication (addition).

**Arguments**:
- `a` (number): First value
- `b` (number): Second value

**Returns**: number

**Example**:
```scheme
(max-plus-multiply 3 5)  ; => 8 (3 + 5)
```

### max-plus-matvec

**Signature**: `(max-plus-matvec matrix vector)`

**Description**: Max-Plus matrix-vector multiplication.

**Arguments**:
- `matrix` (list): Max-Plus matrix
- `vector` (list): Vector

**Returns**: list (result vector)

**Example**:
```scheme
(define A '((0 -inf.0) (-inf.0 0)))
(define x '(1 2))
(max-plus-matvec A x)  ; => (1 2)
```

### max-plus-matmul

**Signature**: `(max-plus-matmul A B)`

**Description**: Max-Plus matrix multiplication.

**Arguments**:
- `A` (list): First matrix
- `B` (list): Second matrix

**Returns**: list (result matrix)

### tropical-eigenvalue

**Signature**: `(tropical-eigenvalue matrix iterations)`

**Description**: Compute tropical eigenvalue using Karp's algorithm.

**Arguments**:
- `matrix` (list): Max-Plus matrix
- `iterations` (number): Number of iterations

**Returns**: number (eigenvalue)

**Example**:
```scheme
(define A '((0 1) (1 0)))
(tropical-eigenvalue A 10)  ; => 0.5
```

## Lattice Functions

### lattice-join

**Signature**: `(lattice-join states)`

**Description**: Compute least upper bound (join) of epistemic states.

**Arguments**:
- `states` (list): List of epistemic states

**Returns**: `epistemic-state` record

**Example**:
```scheme
(define state1 (make-epistemic 10 5 3 2))
(define state2 (make-epistemic 8 7 4 1))
(lattice-join (list state1 state2))  ; => (epistemic 10 7 4 1)
```

### lattice-meet

**Signature**: `(lattice-meet states)`

**Description**: Compute greatest lower bound (meet) of epistemic states.

**Arguments**:
- `states` (list): List of epistemic states

**Returns**: `epistemic-state` record

**Example**:
```scheme
(lattice-meet (list state1 state2))  ; => (epistemic 8 5 3 2)
```

## Geometric Consensus Functions

### geometric-threshold

**Signature**: `(geometric-threshold geometry)`

**Description**: Get consensus threshold for geometry.

**Arguments**:
- `geometry` (symbol): Geometry name (tetrahedron, cube, icosahedron, etc.)

**Returns**: number (threshold 0.0-1.0)

**Example**:
```scheme
(geometric-threshold 'tetrahedron)  ; => 0.75
(geometric-threshold 'cube)         ; => 0.50
(geometric-threshold 'icosahedron)  ; => 0.25
```

### determine-geometric-level

**Signature**: `(determine-geometric-level certainty size)`

**Description**: Select geometry based on certainty and network size.

**Arguments**:
- `certainty` (number): Certainty value (0.0-1.0)
- `size` (number): Network size

**Returns**: symbol (geometry name)

**Example**:
```scheme
(determine-geometric-level 0.8 4)   ; => tetrahedron
(determine-geometric-level 0.5 8)   ; => cube
(determine-geometric-level 0.3 12)  ; => icosahedron
```

### consensus-achieved?

**Signature**: `(consensus-achieved? agreeing total geometry)`

**Description**: Check if consensus achieved.

**Arguments**:
- `agreeing` (number): Number of agreeing nodes
- `total` (number): Total number of nodes
- `geometry` (symbol): Geometry name

**Returns**: boolean

**Example**:
```scheme
(consensus-achieved? 3 4 'tetrahedron)  ; => #t (3/4 >= 0.75)
(consensus-achieved? 2 4 'tetrahedron)  ; => #f (2/4 < 0.75)
```

## Automaton Functions

### make-automaton

**Signature**: `(make-automaton id epistemic vclock continuations events)`

**Description**: Create automaton.

**Arguments**:
- `id` (symbol): Automaton identifier
- `epistemic` (epistemic-state): Epistemic state
- `vclock` (vector-clock): Vector clock
- `continuations` (list): Continuations
- `events` (list): Events

**Returns**: `automaton` record

**Example**:
```scheme
(define automaton
  (make-automaton
   'node-1
   (make-epistemic 100 50 30 20)
   (make-initial-vclock '(node-1 node-2))
   '()
   '()))
```

### automaton-id

**Signature**: `(automaton-id automaton)`

**Description**: Get ID from automaton.

**Returns**: symbol

### automaton-epistemic

**Signature**: `(automaton-epistemic automaton)`

**Description**: Get epistemic state from automaton.

**Returns**: `epistemic-state` record

### automaton-step

**Signature**: `(automaton-step automaton hypergraph)`

**Description**: Execute one step of automaton evolution.

**Arguments**:
- `automaton` (automaton): Automaton
- `hypergraph` (hypergraph): Hypergraph

**Returns**: `automaton` record (updated)

**Example**:
```scheme
(define updated (automaton-step automaton hypergraph))
```

## Hypergraph Functions

### make-hypergraph

**Signature**: `(make-hypergraph vertices edges)`

**Description**: Create hypergraph.

**Arguments**:
- `vertices` (list): List of vertex identifiers
- `edges` (list): List of hyperedge records

**Returns**: `hypergraph` record

**Example**:
```scheme
(define hyperedge1 (make-hyperedge 'e1 '(node-1 node-2 node-3)))
(define hypergraph (make-hypergraph '(node-1 node-2 node-3) (list hyperedge1)))
```

### hypergraph-vertices

**Signature**: `(hypergraph-vertices hypergraph)`

**Description**: Get vertices from hypergraph.

**Returns**: list

### hypergraph-hyperedges

**Signature**: `(hypergraph-hyperedges hypergraph)`

**Description**: Get hyperedges from hypergraph.

**Returns**: list

### make-hyperedge

**Signature**: `(make-hyperedge id members)`

**Description**: Create hyperedge.

**Arguments**:
- `id` (symbol): Hyperedge identifier
- `members` (list): List of node identifiers

**Returns**: `hyperedge` record

**Example**:
```scheme
(define edge (make-hyperedge 'e1 '(node-1 node-2 node-3)))
```

### hyperedge-id

**Signature**: `(hyperedge-id hyperedge)`

**Description**: Get ID from hyperedge.

**Returns**: symbol

### hyperedge-members

**Signature**: `(hyperedge-members hyperedge)`

**Description**: Get members from hyperedge.

**Returns**: list

### hypergraph-neighbors

**Signature**: `(hypergraph-neighbors hypergraph node-id)`

**Description**: Get neighbors of node via hyperedges.

**Arguments**:
- `hypergraph` (hypergraph): Hypergraph
- `node-id` (symbol): Node identifier

**Returns**: list (neighbor nodes)

**Example**:
```scheme
(hypergraph-neighbors hypergraph 'node-1)  ; => (node-2 node-3)
```

### max-plus-synchronize

**Signature**: `(max-plus-synchronize current neighbors)`

**Description**: Synchronize with neighbors using Max-Plus.

**Arguments**:
- `current` (number): Current value
- `neighbors` (list): List of neighbor values

**Returns**: number (synchronized value)

## State Functions

### make-state

**Signature**: `(make-state timestamp vclock scope bindings)`

**Description**: Create system state.

**Arguments**:
- `timestamp` (number): Timestamp
- `vclock` (vector-clock): Vector clock
- `scope` (symbol): Current scope
- `bindings` (list): List of bindings

**Returns**: `state` record

### state-timestamp

**Signature**: `(state-timestamp state)`

**Description**: Get timestamp from state.

**Returns**: number

### state-vclock

**Signature**: `(state-vclock state)`

**Description**: Get vector clock from state.

**Returns**: `vector-clock` record

### validate-hygienic

**Signature**: `(validate-hygienic id scope state)`

**Description**: Validate binding is hygienic (no shadowing).

**Arguments**:
- `id` (symbol): Identifier
- `scope` (symbol): Scope
- `state` (state): Current state

**Returns**: boolean

## Event Store Functions

### make-event-store

**Signature**: `(make-event-store events)`

**Description**: Create event store.

**Arguments**:
- `events` (list): List of S-expressions

**Returns**: `event-store` record

### make-empty-store

**Signature**: `(make-empty-store)`

**Description**: Create empty event store.

**Returns**: `event-store` record

### event-store-append

**Signature**: `(event-store-append store s-expr)`

**Description**: Append event to store.

**Arguments**:
- `store` (event-store): Event store
- `s-expr` (s-expr): S-expression (event)

**Returns**: `event-store` record

### replay-events

**Signature**: `(replay-events store initial-state)`

**Description**: Replay events to reconstruct state.

**Arguments**:
- `store` (event-store): Event store
- `initial-state` (state): Initial state

**Returns**: `state` record

### apply-event

**Signature**: `(apply-event state s-expr)`

**Description**: Apply event to state.

**Arguments**:
- `state` (state): Current state
- `s-expr` (s-expr): S-expression (event)

**Returns**: `state` record

### add-binding

**Signature**: `(add-binding state id scope)`

**Description**: Add binding to state.

**Arguments**:
- `state` (state): Current state
- `id` (symbol): Identifier
- `scope` (symbol): Scope

**Returns**: `state` record

### enter-scope

**Signature**: `(enter-scope state sid parent)`

**Description**: Enter new scope.

**Arguments**:
- `state` (state): Current state
- `sid` (symbol): Scope identifier
- `parent` (symbol): Parent scope

**Returns**: `state` record

## Epistemic Expansion Functions

### epistemic-expand

**Signature**: `(epistemic-expand state depth)`

**Description**: Expand epistemic state recursively using Y-combinator.

**Arguments**:
- `state` (epistemic-state): Epistemic state
- `depth` (number): Expansion depth

**Returns**: `epistemic-state` record

**Example**:
```scheme
(define expanded (epistemic-expand state 5))
```

### epistemic-fixed-point

**Signature**: `(epistemic-fixed-point state)`

**Description**: Find fixed point of epistemic expansion.

**Arguments**:
- `state` (epistemic-state): Epistemic state

**Returns**: `epistemic-state` record

### epistemic-transition

**Signature**: `(epistemic-transition state)`

**Description**: Apply epistemic transition.

**Arguments**:
- `state` (epistemic-state): Epistemic state

**Returns**: `epistemic-state` record

## Utility Functions

### iota

**Signature**: `(iota n)`

**Description**: Generate list of integers from 0 to n-1.

**Arguments**:
- `n` (number): Upper bound

**Returns**: list

**Example**:
```scheme
(iota 5)  ; => (0 1 2 3 4)
```

### every

**Signature**: `(every pred lst)`

**Description**: Check if predicate holds for all elements.

**Arguments**:
- `pred` (procedure): Predicate function
- `lst` (list): List

**Returns**: boolean

**Example**:
```scheme
(every even? '(2 4 6))  ; => #t
```

## Test Functions

### run-tests

**Signature**: `(run-tests)`

**Description**: Run all DANL tests.

**Returns**: void

**Example**:
```scheme
(run-tests)
```

### test-euler-phi

**Signature**: `(test-euler-phi)`

**Description**: Test Euler phi function.

**Returns**: void

### test-observable-parameterization

**Signature**: `(test-observable-parameterization vertices)`

**Description**: Test observable parameterization.

**Arguments**:
- `vertices` (number): Number of vertices

**Returns**: void

## Constants

### geometric-thresholds

**Constant**: `geometric-thresholds`

**Description**: Association list of geometry thresholds.

**Value**:
```scheme
'((tetrahedron . 0.75)
  (cube . 0.50)
  (octahedron . 0.50)
  (icosahedron . 0.25)
  (dodecahedron . 0.25)
  (600-cell . 0.025))
```

### max-plus-zero

**Constant**: `max-plus-zero`

**Description**: Max-Plus additive identity (unknown).

**Value**: `-inf.0`

### max-plus-one

**Constant**: `max-plus-one`

**Description**: Max-Plus multiplicative identity (zero delay).

**Value**: `0`

## Complete Example

### Using the API

```scheme
;;; Complete example using DANL API

(load "danl-core.scm")

;;; 1. Create epistemic state
(define state (make-epistemic 100 50 30 20))

;;; 2. Parameterize state
(define observable (parameterize-epistemic state 12))

;;; 3. Create vector clock
(define vclock (make-initial-vclock '(node-1 node-2 node-3)))
(define updated-vclock (increment-vclock vclock 'node-1))

;;; 4. Create hypergraph
(define edge (make-hyperedge 'e1 '(node-1 node-2 node-3)))
(define hypergraph (make-hypergraph '(node-1 node-2 node-3) (list edge)))

;;; 5. Create automaton
(define automaton
  (make-automaton 'node-1 state updated-vclock '() '()))

;;; 6. Run step
(define updated-automaton (automaton-step automaton hypergraph))

;;; 7. Check consensus
(consensus-achieved? 3 4 'tetrahedron)  ; => #t
```

## Next Steps

- **See complete reference**: [API Reference](api-reference.md) - All APIs
- **Learn Prolog**: [Prolog API](prolog-api.md) - Prolog predicates
- **Learn Datalog**: [Datalog API](datalog-api.md) - Datalog queries

## Related Resources

- [Scheme Core](scheme-core.md) - Implementation details
- [API Reference](api-reference.md) - Complete API reference
- [First Automaton](first-automaton.md) - Tutorial
