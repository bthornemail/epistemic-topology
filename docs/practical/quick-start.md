---
id: quick-start
title: "Quick Start Guide"
level: practical
type: guide
tags: ["getting-started", "installation", "tutorial"]
keywords: ["quick-start", "setup", "first-steps", "installation"]
prerequisites: ["what-is-danl"]
enables: ["first-automaton", "scheme-core", "dev-environment"]
related: ["epistemic-states", "core-ideas-simple"]
readingTime: 30
difficulty: 3
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-11-03"
---

# Quick Start Guide

> **Get DANL running on your machine in under 30 minutes**

This guide will walk you through installing DANL, running your first automaton, and understanding the basics. No prior experience with Scheme, Prolog, or Datalog required - we'll explain everything as we go.

## Prerequisites

- **Operating System**: Linux, macOS, or Windows (with WSL)
- **Basic Programming**: Familiarity with any programming language
- **Terminal**: Comfortable using command line
- **Time**: 30 minutes

## Installation

### Step 1: Install Scheme Interpreter

DANL uses R5RS Scheme. Install one of these:

**Option A: Guile (Recommended)**
```bash
# Ubuntu/Debian
sudo apt-get install guile-3.0

# macOS
brew install guile

# Verify installation
guile --version
```

**Option B: Racket**
```bash
# Download from https://racket-lang.org
# Or via package manager
brew install racket  # macOS
```

**Option C: Chicken Scheme**
```bash
# Download from https://call-cc.org
# Or via package manager
brew install chicken  # macOS
```

### Step 2: Install Prolog (Optional but Recommended)

For logic programming features:

```bash
# Ubuntu/Debian
sudo apt-get install swi-prolog

# macOS
brew install swi-prolog

# Verify
swipl --version
```

### Step 3: Install Datalog (Optional)

For distributed queries:

```bash
# Option A: Souffle
sudo apt-get install souffle

# Option B: LogicBlox (see their website)
```

### Step 4: Clone Repository

```bash
git clone https://github.com/bthornemail/epistemic-topology.git
cd epistemic-topology
```

### Step 5: Verify Installation

```bash
# Test Scheme
guile -c "(display \"Scheme works!\") (newline)"

# Test Prolog (if installed)
swipl -g "write('Prolog works!'), nl, halt."

# Test Datalog (if installed)
souffle --version
```

## Your First Automaton

### Step 1: Create a Simple Automaton

Create a file `my-first-automaton.scm`:

```scheme
;; Load DANL core
(load "danl-core.scm")

;; Create an epistemic state
(define my-state
  (make-epistemic-state
    10   ; KK: Known Knowns
    5    ; KU: Known Unknowns
    3    ; UK: Unknown Knowns
    20)) ; UU: Unknown Unknowns

;; Display the state
(display "My Epistemic State:\n")
(display "KK: ") (display (epistemic-kk my-state)) (newline)
(display "KU: ") (display (epistemic-ku my-state)) (newline)
(display "UK: ") (display (epistemic-uk my-state)) (newline)
(display "UU: ") (display (epistemic-uu my-state)) (newline)
```

### Step 2: Run It

```bash
guile my-first-automaton.scm
```

**Expected Output**:
```
My Epistemic State:
KK: 10
KU: 5
UK: 3
UU: 20
```

### Step 3: Parameterize for Observability

Modify your file to add observable parameterization:

```scheme
;; Load DANL core
(load "danl-core.scm")

;; Create an epistemic state
(define my-state
  (make-epistemic-state 10 5 3 20))

;; Parameterize for observability (V = 12 vertices)
(define v 12)
(define phi (euler-phi v))
(define inner-dim (inner-dimension v))

(define observable
  (make-observable-epistemic
    (epistemic-kk my-state)           ; Direct observable
    (epistemic-ku my-state)           ; Direct observable
    (* (epistemic-uk my-state) phi)   ; Observable product!
    (* (epistemic-uu my-state) inner-dim)
    phi
    v))

;; Display observable parameters
(display "Observable Parameters:\n")
(display "KK: ") (display (observable-kk observable)) (newline)
(display "KU: ") (display (observable-ku observable)) (newline)
(display "τ_UK: ") (display (observable-tau-uk observable)) (newline)
(display "φ(V): ") (display (observable-phi observable)) (newline)
```

**Expected Output**:
```
Observable Parameters:
KK: 10
KU: 5
τ_UK: 12
φ(V): 4
```

## Basic Operations

### Operation 1: Compute Certainty

```scheme
;; Compute epistemic certainty
(define (compute-certainty kk uk phi)
  (/ kk (+ 1 (/ (* uk phi) kk))))

;; Example
(define certainty
  (compute-certainty
    (epistemic-kk my-state)
    (epistemic-uk my-state)
    phi))

(display "Certainty: ") (display certainty) (newline)
```

### Operation 2: Lattice Join

```scheme
;; Join two epistemic states
(define state1 (make-epistemic-state 10 5 3 20))
(define state2 (make-epistemic-state 8 7 4 15))

(define joined (lattice-join state1 state2))

(display "Joined State:\n")
(display "KK: ") (display (epistemic-kk joined)) (newline)
(display "KU: ") (display (epistemic-ku joined)) (newline)
(display "UK: ") (display (epistemic-uk joined)) (newline)
(display "UU: ") (display (epistemic-uu joined)) (newline)
```

**Expected Output**:
```
Joined State:
KK: 10
KU: 7
UK: 4
UU: 15
```

### Operation 3: Check Consensus

```scheme
;; Check if consensus achieved
(define (check-consensus agreeing total geometry)
  (let ((threshold (case geometry
                     ((tetrahedron) 0.75)
                     ((cube) 0.50)
                     ((icosahedron) 0.25)
                     (else 0.50))))
    (>= (/ agreeing total) threshold)))

;; Example: 4-person team, 3 agree, using tetrahedron
(display "Consensus: ")
(display (check-consensus 3 4 'tetrahedron))
(newline)
```

**Expected Output**:
```
Consensus: #t
```

## Testing Your Setup

### Test 1: Euler Phi Function

```scheme
;; Test Euler phi
(display "Testing Euler Phi:\n")
(display "φ(4) = ") (display (euler-phi 4)) (newline)
(display "φ(8) = ") (display (euler-phi 8)) (newline)
(display "φ(12) = ") (display (euler-phi 12)) (newline)
```

**Expected Output**:
```
Testing Euler Phi:
φ(4) = 2
φ(8) = 4
φ(12) = 4
```

### Test 2: Observable Parameterization

```scheme
;; Test parameterization
(define test-state (make-epistemic-state 10 5 3 20))
(define test-v 12)
(define test-phi (euler-phi test-v))
(define test-observable
  (make-observable-epistemic
    10 5 (* 3 test-phi) (* 20 (/ test-v test-phi)) test-phi test-v))

;; Verify recovery
(define recovered-uk (/ (observable-tau-uk test-observable) test-phi))
(display "Original UK: ") (display (epistemic-uk test-state)) (newline)
(display "Recovered UK: ") (display recovered-uk) (newline)
```

**Expected Output**:
```
Original UK: 3
Recovered UK: 3
```

### Test 3: Max-Plus Operations

```scheme
;; Test Max-Plus algebra
(define (max-plus-add a b) (max a b))
(define (max-plus-mult a b) (+ a b))

(display "Max-Plus Tests:\n")
(display "max(5, 3) = ") (display (max-plus-add 5 3)) (newline)
(display "5 ⊗ 3 = ") (display (max-plus-mult 5 3)) (newline)
```

**Expected Output**:
```
Max-Plus Tests:
max(5, 3) = 5
5 ⊗ 3 = 8
```

## Next Steps

### If You Want to Build More

1. **Build your first automaton:** [Implementing Your First Automaton](first-automaton.md)
2. **Learn Scheme implementation:** [Scheme Core Implementation](scheme-core.md)
3. **Set up development environment:** [Development Environment Setup](dev-environment.md)

### If You Want to Understand Theory

1. **Learn about lattices:** [Lattice Theory for Distributed Systems](../foundational/lattice-theory.md)
2. **Understand observable parameterization:** [Observable Parameterization](../foundational/observable-parameterization.md)
3. **See geometric consensus:** [Geometric Consensus](../foundational/geometric-consensus.md)

### If You Want to See Real Applications

1. **Read case studies:** [Case Study: Consensus](../applied/case-study-consensus.md)
2. **See production architecture:** [Production Architecture](../applied/production-architecture.md)
3. **Explore integration patterns:** [Integration Patterns](../applied/integration-patterns.md)

## Troubleshooting

### Problem: "Scheme not found"

**Solution**: Make sure Scheme is in your PATH:
```bash
which guile
# If not found, add to PATH or use full path
```

### Problem: "File not found: danl-core.scm"

**Solution**: Make sure you're in the right directory:
```bash
cd epistemic-topology
ls danl-core.scm  # Should show the file
```

### Problem: "Unbound variable: make-epistemic-state"

**Solution**: Make sure you load the core file:
```scheme
(load "danl-core.scm")
```

### Problem: Scheme syntax errors

**Solution**: Check Scheme syntax:
- Use parentheses correctly: `(function arg1 arg2)`
- Quote symbols: `'tetrahedron` not `tetrahedron`
- Use proper list syntax

## Quick Reference

### Essential Functions

```scheme
;; Epistemic states
(make-epistemic-state kk ku uk uu)
(epistemic-kk state)
(epistemic-ku state)
(epistemic-uk state)
(epistemic-uu state)

;; Observable parameterization
(euler-phi n)
(inner-dimension v)
(make-observable-epistemic kk ku tau-uk tau-uu phi v)

;; Lattice operations
(lattice-join state1 state2)
(lattice-meet state1 state2)

;; Consensus
(check-consensus agreeing total geometry)
(threshold geometry)
```

### Common Geometries

```scheme
'tetrahedron   ; 4 vertices, 75% threshold
'cube          ; 8 vertices, 50% threshold
'icosahedron   ; 12 vertices, 25% threshold
```

## Key Takeaways

✅ **Installation** = Scheme + (optional) Prolog + Datalog  
✅ **First automaton** = Create epistemic state, parameterize, compute  
✅ **Basic operations** = Certainty, join, consensus check  
✅ **Testing** = Verify Euler phi, parameterization, Max-Plus  
✅ **Next steps** = Build more, learn theory, see applications  

## Exercises

1. **Create your own state**: Make an epistemic state representing your current project knowledge

2. **Compute certainty**: For KK=15, UK=5, V=8, compute certainty

3. **Check consensus**: 8-person team, 5 agree, using cube - consensus?

4. **Join states**: Join three different epistemic states and see the result

---

*Next: [Implementing Your First Automaton](first-automaton.md) - Build a complete automaton*

*Or: [Development Environment Setup](dev-environment.md) - Set up your development tools*
