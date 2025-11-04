---
id: geometric-consensus
title: "Geometric Consensus"
level: foundational
type: concept
tags: ["geometric-consensus", "platonic-solids", "consensus", "subsidiarity"]
keywords: ["tetrahedron", "cube", "icosahedron", "threshold", "consensus", "geometry"]
prerequisites: ["epistemic-states", "lattice-theory"]
enables: ["platonic-solids", "ha-patterns"]
related: ["max-plus-algebra", "lattice-theory"]
readingTime: 35
difficulty: 3
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-11-03"
---

# Geometric Consensus

> **How Platonic solids determine consensus thresholds mathematically**

Instead of arbitrary thresholds like "51% wins" or "we need unanimous consent," DANL derives consensus thresholds from the combinatorics of Platonic solids. This provides mathematical justification for how many votes you need based on group size and structure.

## The Problem with Arbitrary Thresholds

### Traditional Approaches

Most consensus systems use arbitrary rules:
- **51% majority** - Why 51%? No mathematical reason!
- **67% BFT** - Why 67%? Because someone said so!
- **100% unanimous** - Too strict for large groups!
- **2/3 supermajority** - Why 2/3? Arbitrary!

### Why This Is Problematic

- No mathematical foundation
- Doesn't adapt to group size
- Doesn't account for fault tolerance
- Doesn't scale naturally

## The Geometric Solution

### Insight: Shapes Encode Structure

**Platonic solids** are perfect geometric shapes with:
- **Symmetry**: All vertices equivalent
- **Combinatorics**: Fixed relationships between vertices, edges, faces
- **Natural thresholds**: Face size / vertex count

### The Threshold Formula

**Definition 1** (Subsidiarity Threshold). For a Platonic solid with Schläfli symbol {p,q}:

```
τ = p / V
```

where:
- **p** = vertices per face
- **V** = total vertices

**Interpretation**: The fraction of vertices needed to complete one face.

## The Five Platonic Solids

### Complete Table

| Solid | V | E | F | p | τ = p/V | Level | Fault Tolerance |
|-------|---|---|---|---|---------|-------|-----------------|
| **Tetrahedron** | 4 | 6 | 4 | 3 | 0.75 | Local | 1 failure |
| **Cube** | 8 | 12 | 6 | 4 | 0.50 | Federated | 3 failures |
| **Octahedron** | 6 | 12 | 8 | 3 | 0.50 | Federated | 2 failures |
| **Icosahedron** | 12 | 30 | 20 | 3 | 0.25 | Global | 8 failures |
| **Dodecahedron** | 20 | 30 | 12 | 5 | 0.25 | Global | 15 failures |

### Visualization

```
TETRAHEDRON (4 vertices, 75% threshold)
      🔵
     /|\
    / | \
   /  |  \
  🔵--🔵--🔵
  Need 3 out of 4 to agree

CUBE (8 vertices, 50% threshold)
  🔵--🔵--🔵--🔵
  |   |   |   |
  🔵--🔵--🔵--🔵
  Need 4 out of 8 to agree

ICOSAHEDRON (12 vertices, 25% threshold)
  🔵 🔵 🔵 🔵 🔵 🔵
  🔵 🔵 🔵 🔵 🔵 🔵
  Need 3 out of 12 to agree
```

## Why This Makes Sense

### Natural Hierarchy

**Theorem 1** (Natural Hierarchy). The Platonic solids create a natural consensus hierarchy:

1. **Small polyhedra** (few V) have **high** p/V → Need most participants to agree
2. **Large polyhedra** (many V) have **low** p/V → Need fewer participants
3. This matches subsidiarity: local decisions need strong consensus, global decisions need weaker consensus
4. Larger vertex count = more distributed risk = higher fault tolerance

**Proof**: 
- Small V → high p/V ratio → tight consensus
- Large V → low p/V ratio → loose consensus
- Matches real-world subsidiarity principle
- Larger groups have more redundancy □

### Subsidiarity Principle

**Subsidiarity** = Decisions should be made at the lowest level possible:
- **Local** (small group) → Tight consensus (high threshold)
- **Global** (large group) → Loose consensus (low threshold)

Geometric consensus naturally implements this!

## Consensus as Simplicial Complex

### Agreement Simplex

**Definition 2** (Agreement Simplex). For agents {a₁, ..., aₙ} and proposal P:

```
σ = {a_i : a_i agrees with P}
```

**Definition 3** (Complete Face). A k-simplex is a complete face of polyhedron Q if:
- All k+1 vertices agree
- These k+1 vertices form a face of Q

### Geometric Consensus Theorem

**Theorem 2** (Geometric Consensus). Consensus is achieved if and only if at least one complete face exists.

**Proof**:
- A complete face means all vertices on that face agree
- By construction, face size = p
- Having p agreeing vertices out of V total gives exactly threshold τ = p/V
- This is the minimum structure required for consensus
- No complete face → no agreement set of sufficient size → no consensus □

## Implementation

### Geometry Selection

```scheme
;; Select geometry based on certainty and participants
(define (select-geometry certainty participants)
  (cond
    ((and (> certainty 0.7) (<= participants 4))
     'tetrahedron)
    ((and (> certainty 0.4) (<= participants 8))
     'cube)
    ((<= participants 12)
     'icosahedron)
    (else
     'dodecahedron)))

;; Threshold lookup
(define (threshold geometry)
  (case geometry
    ((tetrahedron) 0.75)
    ((cube) 0.50)
    ((octahedron) 0.50)
    ((icosahedron) 0.25)
    ((dodecahedron) 0.25)
    (else 0.50)))  ; Default
```

### Consensus Check

```scheme
;; Check if consensus achieved
(define (check-consensus participants proposal geometry)
  (let* ((total (length participants))
         (agreeing (filter (lambda (p) (agrees? p proposal)) participants))
         (agree-count (length agreeing))
         (threshold-value (threshold geometry))
         (agreement-ratio (/ agree-count total)))
    (>= agreement-ratio threshold-value)))
```

### Finding Complete Faces

```scheme
;; Find complete faces in polyhedron
(define (find-complete-faces participants agreeing geometry)
  (let ((faces (polyhedron-faces geometry)))
    (filter (lambda (face)
              ;; Check if all vertices in face agree
              (every (lambda (vertex)
                       (member vertex agreeing))
                     face))
            faces)))
```

## Consensus Routing and Downgrade

### Adaptive Thresholds

If certainty drops, topology downgrades:
```
Tetrahedron → Cube → Icosahedron
```

If certainty rises, upgrade:
```
Icosahedron → Cube → Tetrahedron
```

### Implementation

```scheme
;; Adaptive consensus routing
(define (adaptive-consensus participants proposal certainty)
  (let ((geometry (select-geometry certainty (length participants))))
    (if (check-consensus participants proposal geometry)
        (cons 'consensus geometry)
        ;; Try downgrading geometry
        (let ((downgraded (downgrade-geometry geometry)))
          (if (check-consensus participants proposal downgraded)
              (cons 'consensus downgraded)
              (cons 'no-consensus geometry))))))
```

## Fault Tolerance Analysis

### Fault Tolerance by Geometry

| Solid | Vertices | Fault Tolerance | Explanation |
|-------|----------|-----------------|-------------|
| Tetrahedron | 4 | 1 failure | Need 3/4, so can lose 1 |
| Cube | 8 | 3 failures | Need 4/8, so can lose 4 |
| Icosahedron | 12 | 8 failures | Need 3/12, so can lose 9 |

**General Formula**: Fault tolerance = V - ⌈τ·V⌉

### Why Larger Groups Are More Fault Tolerant

- **More vertices** = More redundancy
- **Lower threshold** = Need fewer agreements
- **Distributed risk** = Failures spread across more nodes

## Connection to Lattice Theory

### Lattice Consensus

Geometric consensus connects to lattice theory:

**Lattice Join**:
```
Consensus = ⊔ᵢ Aᵢ  (join of all states)
```

**Geometric Threshold**:
```
threshold(Consensus) ≥ τ(G)
```

**Combined**:
```
Consensus achieved ⟺ (⊔ᵢ Aᵢ exists) ∧ (threshold(⊔ᵢ Aᵢ) ≥ τ(G))
```

## Real-World Examples

### Example 1: Small Team Decision

**Scenario**: 4-person team deciding on architecture

**Geometry**: Tetrahedron (4 vertices, 75% threshold)

**Consensus**: Need 3 out of 4 to agree

**Result**: Tight consensus ensures strong agreement

### Example 2: Company-Wide Policy

**Scenario**: 20-person company deciding on policy

**Geometry**: Dodecahedron (20 vertices, 25% threshold)

**Consensus**: Need 5 out of 20 to agree

**Result**: Looser consensus allows distributed decision-making

### Example 3: Blockchain Network

**Scenario**: 100-node blockchain network

**Geometry**: Could use higher-dimensional polytope or composite structure

**Consensus**: Adapts threshold based on network topology

**Result**: Scales naturally with network size

## Mathematical Properties

### Threshold Properties

1. **Monotonicity**: Larger V → Lower τ (generally)
2. **Symmetry**: All vertices equivalent (fairness)
3. **Boundedness**: 0 < τ ≤ 1 (always valid)
4. **Combinatorics**: Derived from fundamental geometry

### Consensus Properties

1. **Idempotency**: Same group, same proposal → same result
2. **Commutativity**: Order of votes doesn't matter
3. **Associativity**: Can combine subgroups
4. **Monotonicity**: More agreements → easier consensus

## Key Takeaways

✅ **Geometric thresholds** derived from Platonic solid combinatorics  
✅ **Subsidiarity** naturally implemented (local = tight, global = loose)  
✅ **Fault tolerance** increases with group size  
✅ **Complete faces** = Consensus requirement  
✅ **Adaptive routing** based on certainty and group size  
✅ **Mathematical foundation** replaces arbitrary rules  

## Next Steps

- **Deep dive into Platonic solids:** [Platonic Solids: Symmetry and Thresholds](platonic-solids.md)
- **Understand lattice connections:** [Lattice Theory for Distributed Systems](lattice-theory.md)
- **See production patterns:** [High Availability Patterns](../applied/ha-patterns.md)
- **Explore implementation:** [Scheme Core Implementation](../practical/scheme-core.md)

---

## Exercises

1. **Threshold calculation**: For a cube with 8 vertices and face size 4, compute τ

2. **Consensus check**: 12-person team, 4 agree, using icosahedron - consensus?

3. **Fault tolerance**: For tetrahedron with 4 vertices, how many failures tolerated?

4. **Geometry selection**: Certainty=0.6, participants=6 - which geometry?

---

*Next: [Platonic Solids: Symmetry and Thresholds](platonic-solids.md) - Deep dive into the geometry*

*Or: [The Implicit Knowledge Problem](implicit-knowledge-problem.md) - Understand why UK is hard*
