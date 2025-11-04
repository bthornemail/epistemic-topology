---
id: first-automaton
title: "Your First Automaton"
level: practical
type: guide
tags: ["tutorial", "automaton", "beginner", "first-steps"]
keywords: ["tutorial", "automaton", "first", "beginner", "example"]
prerequisites: ["dev-environment", "quick-start"]
enables: ["scheme-core", "api-reference"]
related: ["scheme-core", "quick-start"]
readingTime: 30
difficulty: 2
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Your First Automaton

> **Create your first DANL automaton step by step**

This tutorial walks you through creating your first DANL automaton, from basic setup to running consensus. By the end, you'll have a working automaton that can participate in geometric consensus.

## What You'll Build

**Goal**: Create a simple automaton that:
1. Maintains an epistemic state
2. Communicates with other automatons
3. Participates in consensus
4. Tracks causal relationships

## Step 1: Basic Automaton Structure

### Create Automaton File

**Create `my-automaton.scm`**:
```scheme
;;; My First DANL Automaton
;;; Load DANL core
(load "danl-core.scm")

;;; Define automaton
(define my-automaton
  (make-automaton
   'my-node-1                    ; Node ID
   (make-epistemic 10 5 3 2)     ; Initial epistemic state (KK, KU, UK, UU)
   'tetrahedron                  ; Initial geometry
   '()                           ; Initial neighbors (empty)
   '()))                         ; Initial events (empty)

;;; Display automaton
(display "Created automaton:\n")
(display my-automaton)
(newline)
```

**Run it**:
```bash
guile -s my-automaton.scm
```

## Step 2: Add Epistemic State

### Create Epistemic State

**Update `my-automaton.scm`**:
```scheme
;;; Create epistemic state
(define initial-state
  (make-epistemic
   100  ; KK: Known Knowns
   50   ; KU: Known Unknowns
   30   ; UK: Unknown Knowns
   20)) ; UU: Unknown Unknowns

;;; Display state
(display "Initial epistemic state:\n")
(display "KK: ") (display (epistemic-kk initial-state)) (newline)
(display "KU: ") (display (epistemic-ku initial-state)) (newline)
(display "UK: ") (display (epistemic-uk initial-state)) (newline)
(display "UU: ") (display (epistemic-uu initial-state)) (newline)
```

## Step 3: Calculate Observable Parameters

### Parameterize State

**Add parameterization**:
```scheme
;;; Parameterize for icosahedron (V=12)
(define vertices 12)
(define observable
  (parameterize-epistemic initial-state vertices))

;;; Display observable parameters
(display "\nObservable parameters (V=12):\n")
(display "KK: ") (display (observable-kk observable)) (newline)
(display "KU: ") (display (observable-ku observable)) (newline)
(display "τ_UK: ") (display (observable-tau-uk observable)) (newline)
(display "τ_UU: ") (display (observable-tau-uu observable)) (newline)
```

## Step 4: Create Vector Clock

### Initialize Vector Clock

**Add vector clock**:
```scheme
;;; Create vector clock for 3 nodes
(define nodes '(node-1 node-2 node-3))
(define vclock (make-initial-vclock nodes))

;;; Increment local clock
(define vclock-updated (increment-vclock vclock 'node-1))

;;; Display vector clock
(display "\nVector clock:\n")
(display vclock-updated)
(newline)
```

## Step 5: Create Hypergraph

### Define Hypergraph

**Add hypergraph**:
```scheme
;;; Create hypergraph with 3 nodes
(define hyperedge-1
  (make-hyperedge 'e1 '(node-1 node-2 node-3)))

(define my-hypergraph
  (make-hypergraph
   '(node-1 node-2 node-3)  ; Vertices
   (list hyperedge-1)))      ; Hyperedges

;;; Display hypergraph
(display "\nHypergraph:\n")
(display "Vertices: ") (display (hypergraph-vertices my-hypergraph)) (newline)
(display "Edges: ") (display (length (hypergraph-hyperedges my-hypergraph))) (newline)
```

## Step 6: Run Automaton Step

### Execute Step

**Add automaton step**:
```scheme
;;; Run one step
(define updated-automaton
  (automaton-step my-automaton my-hypergraph))

;;; Display updated automaton
(display "\nUpdated automaton:\n")
(display updated-automaton)
(newline)
```

## Step 7: Check Consensus

### Test Consensus

**Add consensus check**:
```scheme
;;; Test consensus
(define participants '(node-1 node-2 node-3 node-4))
(define agreeing 3)
(define geometry 'tetrahedron)

(define consensus?
  (consensus-achieved? agreeing (length participants) geometry))

(display "\nConsensus check:\n")
(display "Geometry: ") (display geometry) (newline)
(display "Agreeing: ") (display agreeing) (newline)
(display "Total: ") (display (length participants)) (newline)
(display "Consensus achieved: ") (display consensus?) (newline)
```

## Step 8: Complete Example

### Full Automaton

**Complete `my-automaton.scm`**:
```scheme
;;; ========================================
;;; My First DANL Automaton - Complete Example
;;; ========================================

(load "danl-core.scm")

;;; Step 1: Create epistemic state
(define initial-state
  (make-epistemic 100 50 30 20))

(display "=== Step 1: Epistemic State ===\n")
(display initial-state)
(newline)

;;; Step 2: Parameterize state
(define vertices 12)
(define observable
  (parameterize-epistemic initial-state vertices))

(display "\n=== Step 2: Observable Parameters ===\n")
(display "V = ") (display vertices) (newline)
(display observable)
(newline)

;;; Step 3: Create vector clock
(define nodes '(node-1 node-2 node-3))
(define vclock (make-initial-vclock nodes))
(define vclock-updated (increment-vclock vclock 'node-1))

(display "\n=== Step 3: Vector Clock ===\n")
(display vclock-updated)
(newline)

;;; Step 4: Create hypergraph
(define hyperedge-1
  (make-hyperedge 'e1 '(node-1 node-2 node-3)))
(define my-hypergraph
  (make-hypergraph nodes (list hyperedge-1)))

(display "\n=== Step 4: Hypergraph ===\n")
(display "Vertices: ") (display (hypergraph-vertices my-hypergraph)) (newline)
(display "Hyperedges: ") (display (length (hypergraph-hyperedges my-hypergraph))) (newline)

;;; Step 5: Create automaton
(define my-automaton
  (make-automaton
   'node-1
   initial-state
   'tetrahedron
   '()
   '()))

(display "\n=== Step 5: Automaton ===\n")
(display my-automaton)
(newline)

;;; Step 6: Run step
(define updated-automaton
  (automaton-step my-automaton my-hypergraph))

(display "\n=== Step 6: Updated Automaton ===\n")
(display updated-automaton)
(newline)

;;; Step 7: Test consensus
(define participants '(node-1 node-2 node-3 node-4))
(define agreeing 3)
(define geometry 'tetrahedron)

(display "\n=== Step 7: Consensus Check ===\n")
(display "Geometry: ") (display geometry) (newline)
(display "Agreeing: ") (display agreeing) (newline)
(display "Total: ") (display (length participants)) (newline)
(display "Consensus: ") 
(display (consensus-achieved? agreeing (length participants) geometry))
(newline)

(display "\n=== Tutorial Complete! ===\n")
```

**Run it**:
```bash
guile -s my-automaton.scm
```

## Step 9: Add Interactions

### Communicate with Other Nodes

**Add communication**:
```scheme
;;; Simulate communication
(define node-1-state (make-epistemic 100 50 30 20))
(define node-2-state (make-epistemic 80 60 40 25))

;;; Lattice join (merge knowledge)
(define merged-state
  (lattice-join (list node-1-state node-2-state)))

(display "\n=== Lattice Join ===\n")
(display "Node 1: ") (display node-1-state) (newline)
(display "Node 2: ") (display node-2-state) (newline)
(display "Merged: ") (display merged-state) (newline)
```

## Step 10: Run Tests

### Test Your Automaton

**Create test**:
```scheme
;;; Test automaton
(define (test-my-automaton)
  (display "Testing my automaton...\n")
  
  ;; Test 1: State creation
  (let ((state (make-epistemic 10 5 3 2)))
    (if (epistemic? state)
        (display "✓ State creation works\n")
        (display "✗ State creation failed\n")))
  
  ;; Test 2: Vector clock
  (let ((vc (make-initial-vclock '(a b c))))
    (if (vector-clock? vc)
        (display "✓ Vector clock works\n")
        (display "✗ Vector clock failed\n")))
  
  ;; Test 3: Consensus
  (if (consensus-achieved? 3 4 'tetrahedron)
      (display "✓ Consensus works\n")
      (display "✗ Consensus failed\n")))

;;; Run tests
(test-my-automaton)
```

## Next Steps

**What to do next**:
1. **Modify the automaton** - Change epistemic states
2. **Add more nodes** - Create multiple automatons
3. **Experiment with consensus** - Try different geometries
4. **Read the API** - [Scheme API](scheme-api.md) - Full API reference

## Common Patterns

### Pattern 1: Simple Node

```scheme
(define simple-node
  (make-automaton
   'node-id
   (make-epistemic 0 0 0 0)
   'tetrahedron
   '()
   '()))
```

### Pattern 2: Node with Neighbors

```scheme
(define node-with-neighbors
  (make-automaton
   'node-1
   (make-epistemic 100 50 30 20)
   'cube
   '(node-2 node-3)  ; Neighbors
   '()))
```

### Pattern 3: Node with Events

```scheme
(define node-with-events
  (make-automaton
   'node-1
   (make-epistemic 100 50 30 20)
   'tetrahedron
   '()
   '((event-1 timestamp-1)  ; Events
     (event-2 timestamp-2))))
```

## Troubleshooting

### Common Issues

**Issue**: "Unbound variable: make-epistemic"
```scheme
;; Solution: Load danl-core.scm first
(load "danl-core.scm")
```

**Issue**: "Wrong number of arguments"
```scheme
;; Solution: Check function signatures
;; make-epistemic takes 4 arguments: KK, KU, UK, UU
```

**Issue**: Consensus not working
```scheme
;; Solution: Check geometry and thresholds
;; Tetrahedron needs 3/4 = 75%
;; Make sure agreeing >= threshold * total
```

## Next Steps

- **Learn the API**: [Scheme API](scheme-api.md) - Complete API reference
- **See examples**: [Scheme Core](scheme-core.md) - More examples
- **Check reference**: [API Reference](api-reference.md) - All APIs

## Related Resources

- [Dev Environment](dev-environment.md) - Setup guide
- [Scheme Core](scheme-core.md) - Core implementation
- [Quick Start](quick-start.md) - Getting started
