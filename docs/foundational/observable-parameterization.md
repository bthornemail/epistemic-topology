---
id: observable-parameterization
title: "Observable Parameterization"
level: foundational
type: concept
tags: ["observable-parameterization", "computer-vision", "epistemic", "mathematics"]
keywords: ["vision-epistemic-isomorphism", "uk-phi", "sensitivity", "degeneracy", "observability"]
prerequisites: ["epistemic-states", "lattice-theory"]
enables: ["implicit-knowledge-problem", "max-plus-algebra"]
related: ["core-ideas-simple"]
readingTime: 30
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-11-03"
---

# Observable Parameterization

> **The breakthrough technique borrowed from 3D computer vision to track implicit knowledge**

This is one of DANL's most profound innovations: solving the implicit knowledge problem by adapting a solution that computer vision researchers discovered 25 years ago. This document explains how depth perception and epistemic reasoning use the exact same mathematics.

## The Observability Problem

### In Computer Vision

When estimating 3D motion from camera images, you can measure:
- **Left/Right position** (tX) - easy to observe ✅
- **Up/Down position** (tY) - easy to observe ✅
- **Depth** (tZ) - becomes unobservable as focal length increases ❌

**The Problem**: As focal length f → ∞ (or inverse focal length β → 0), depth sensitivity vanishes:

```
∂u/∂tZ = -X_C·β/(1 + Z_C·β)² → 0  as  β → 0
```

### In Epistemic Computing

When tracking knowledge in distributed systems, you can measure:
- **Known Knowns** (KK) - easy to observe ✅
- **Known Unknowns** (KU) - easy to observe ✅
- **Unknown Knowns** (UK) - becomes unobservable as complexity grows ❌

**The Problem**: As system complexity V grows (φ(V)/V → 0), UK sensitivity vanishes:

```
∂C/∂UK = -φ(V)/(1 + UK·φ(V)/KK)² → 0  as  φ(V) → 0
```

## The Solution: Product Parameterization

### Computer Vision Solution (1990s)

Instead of estimating depth directly, estimate the **product**:

```
τ = tZ · β  (depth × inverse focal length)
```

This product remains observable even when β → 0:

```
∂u/∂τ = -X_C/(1 + Z_C·β)² ≠ 0  (stays bounded!)
```

### DANL Solution (2020s)

Instead of estimating UK directly, estimate the **product**:

```
τ_UK = UK · φ(V)  (implicit knowledge × Euler totient)
```

This product remains observable even when φ(V) → 0:

```
∂C/∂τ_UK = -1/(1 + τ_UK/KK)² ≠ 0  (stays bounded!)
```

## The Isomorphism

### Formal Mapping

| Computer Vision | Epistemic Computing | Meaning |
|----------------|---------------------|---------|
| tX, tY | KK, KU | Directly observable |
| tZ (depth) | UK (implicit knowledge) | Poorly observable |
| β = 1/f (inverse focal) | φ(V)/V (normalized totient) | Degeneracy parameter |
| tZ·β (observable product) | UK·φ(V) (observable product) | Maintained observability |
| u = X_C/(1+Z_C·β) | C = KK/(1+UK·φ/KK) | Projective measurement |
| ∂u/∂(tZ·β) = -X_C/(1+Z_C·β)² | ∂C/∂(UK·φ) = -1/(1+τ_UK/KK)² | Sensitivity equation |

### Why This Matters

The computer vision community solved this problem decades ago:
- ✅ Tested in millions of applications
- ✅ Proven mathematically robust
- ✅ Optimized algorithms exist
- ✅ Error handling worked out

We inherit their proven solution!

## Mathematical Foundation

### Epistemic Projection Function

**Definition 1** (Epistemic Projection). The observable certainty is:

```
C = KK / (1 + UK·φ(V)/KK)
```

where:
- **C** = Certainty (observable)
- **KK** = Known Knowns (observable)
- **UK** = Implicit Knowledge (poorly observable)
- **φ(V)** = Euler's Totient Function (geometric parameter)

### Sensitivity Analysis

**Theorem 1** (UK Sensitivity Degeneration). Direct sensitivity to UK vanishes:

```
∂C/∂UK = -φ(V)/(1 + UK·φ(V)/KK)² → 0  as  φ(V) → 0
```

**Proof**: Taking the derivative:

```
C = KK / (1 + UK·φ/KK)

∂C/∂UK = ∂/∂UK [KK / (1 + UK·φ/KK)]
        = KK · [-(φ/KK) / (1 + UK·φ/KK)²]
        = -φ / (1 + UK·φ/KK)²
```

As φ(V) → 0 (which occurs for large V with many prime factors), the sensitivity vanishes. □

**Theorem 2** (Maintained Product Sensitivity). Sensitivity to τ_UK remains bounded:

```
∂C/∂τ_UK = -1/(1 + τ_UK/KK)² ≠ 0
```

**Proof**: Let τ_UK = UK·φ(V). Then:

```
C = KK / (1 + τ_UK/KK)

∂C/∂τ_UK = ∂/∂τ_UK [KK / (1 + τ_UK/KK)]
          = KK · [-(1/KK) / (1 + τ_UK/KK)²]
          = -1 / (1 + τ_UK/KK)²
```

This remains bounded for all finite KK and τ_UK, regardless of φ(V). □

### Sensitivity Ratio

**Corollary 1** (Sensitivity Ratio). The ratio of sensitivities equals φ(V):

```
[∂C/∂UK] / [∂C/∂τ_UK] = φ(V)
```

**Proof**:
```
∂C/∂UK = -φ / (1 + τ_UK/KK)²
∂C/∂τ_UK = -1 / (1 + τ_UK/KK)²

Ratio = [-φ / (1 + τ_UK/KK)²] / [-1 / (1 + τ_UK/KK)²]
      = φ
```

For large V where φ(V) → 0, the direct sensitivity becomes infinitesimally small compared to the product sensitivity. □

## Euler's Totient Function

### Definition

**Definition 2** (Euler's Totient Function). φ(n) counts positive integers ≤ n that are coprime to n:

```
φ(n) = |{k : 1 ≤ k ≤ n, gcd(k,n) = 1}|
```

### Examples

```
φ(4) = 2  (1, 3 are coprime to 4)
φ(8) = 4  (1, 3, 5, 7 are coprime to 8)
φ(12) = 4  (1, 5, 7, 11 are coprime to 12)
φ(20) = 8  (1, 3, 7, 9, 11, 13, 17, 19)
```

### Properties

- **φ(prime) = prime - 1**: All numbers less than a prime are coprime
- **φ(composite) < composite**: Some numbers share factors
- **As n grows**: φ(n)/n → 0 for highly composite numbers

### Why φ(V) Matters

In epistemic systems:
- **V** = Number of vertices/agents
- **φ(V)** = Number of "independent" epistemic positions
- **V/φ(V)** = Average redundancy/multiplicity

When V is highly composite (many small prime factors):
- φ(V)/V → 0
- Direct UK observation fails
- Product UK·φ(V) maintains observability

## Observable Parameters Interface

### TypeScript Interface

```typescript
interface ObservableEpistemicParameters {
  // Directly observable (like tX, tY in vision)
  kkObs: number;      // Known knowns
  kuObs: number;      // Known unknowns
  
  // Product for observability (like tZ·β in vision)
  tauUK: number;      // UK · φ(V)
  
  // Scaled for sensitivity
  tauUU: number;      // UU · d_inner (where d_inner = V/φ(V))
  
  // Metadata for recovery
  phi: number;        // Euler's totient φ(V)
  innerDim: number;   // V / φ(V)
}
```

### Parameterization Process

1. **Start with raw epistemic state**: KK, KU, UK, UU
2. **Compute geometric factors**: φ(V), d_inner = V/φ(V)
3. **Create observable products**: τ_UK = UK·φ(V), τ_UU = UU·d_inner
4. **Estimate in observable space**: Use τ_UK instead of UK
5. **Recover raw state**: UK = τ_UK / φ(V)

## Recovery Algorithm

### Recovering UK from Observable Parameters

Given observed certainty C and known KK, solve for UK:

```
C = KK / (1 + UK·φ(V)/KK)

Solving for UK:
1 + UK·φ(V)/KK = KK/C
UK·φ(V)/KK = KK/C - 1
UK·φ(V) = KK·(KK/C - 1)
UK = KK·(KK/C - 1) / φ(V)
```

### Implementation

```scheme
;; Recover UK from observable parameters
(define (recover-uk certainty kk phi)
  (if (= certainty 0)
      +inf.0  ; Total implicit failure
      (* kk (- (/ kk certainty) 1) (/ 1 phi))))

;; Example
;; C = 0.8, KK = 10, φ(12) = 4
;; UK = 10 · (10/0.8 - 1) / 4
;;    = 10 · (12.5 - 1) / 4
;;    = 10 · 11.5 / 4
;;    = 28.75
```

## Error Variance Analysis

### Variance Propagation

**Theorem 3** (Error Variance). The variance of recovered UK scales with φ(V):

```
σ²(UK) = σ²(τ_UK) / φ²(V)
```

**Proof**: Since UK = τ_UK / φ(V):

```
Var(UK) = Var(τ_UK / φ(V))
        = Var(τ_UK) / φ²(V)
```

**Consequence**: If φ(V) is small, variance explodes for raw UK but remains bounded for τ_UK.

### Example

```
Measurement variance: σ²(τ_UK) = 1.0
For V = 12: φ(12) = 4

σ²(UK) = 1.0 / 4² = 0.0625  (stable)

For V = 120: φ(120) = 32

σ²(UK) = 1.0 / 32² = 0.00098  (still stable)

But for raw UK estimation (without parameterization):
As φ(V) → 0, σ²(UK) → ∞  (unstable!)
```

## Real-World Analogy

### Depth Perception Analogy

Think of measuring depth in a photograph:

**Direct Measurement** (fails):
- "How far away is that building?"
- Impossible to measure from single photo!

**Product Parameterization** (works):
- "Measure depth × camera-setting"
- This combination stays observable!
- Later recover: depth = (depth × setting) / setting

### Epistemic Knowledge Analogy

Think of measuring implicit knowledge in a team:

**Direct Measurement** (fails):
- "How much does the team implicitly understand?"
- Impossible to measure directly!

**Product Parameterization** (works):
- "Measure implicit knowledge × complexity-factor"
- This combination stays observable!
- Later recover: UK = (UK × φ) / φ

## Implementation Examples

### Parameterization Function

```scheme
;; Parameterize epistemic state for observability
(define (parameterize-epistemic state vertices)
  (let* ((phi (euler-phi vertices))
         (inner-dim (/ vertices phi))
         (ep (state-epistemic state)))
    (make-observable-parameters
      (epistemic-kk ep)           ; Direct observable
      (epistemic-ku ep)           ; Direct observable
      (* (epistemic-uk ep) phi)   ; Observable product!
      (* (epistemic-uu ep) inner-dim)  ; Scaled product
      phi
      inner-dim)))
```

### Recovery Function

```scheme
;; Recover raw epistemic state from observable parameters
(define (recover-epistemic params)
  (let ((phi (params-phi params))
        (inner-dim (params-inner-dim params)))
    (make-epistemic-state
      (params-kk params)                    ; Direct
      (params-ku params)                    ; Direct
      (/ (params-tau-uk params) phi)        ; Divide out φ
      (/ (params-tau-uu params) inner-dim))))  ; Divide out d_inner
```

## Why This Works

### The Key Insight

The degeneracy parameter (β or φ(V)) appears in both:
1. **The measurement equation** (in the denominator)
2. **The sensitivity equation** (multiplying the derivative)

By combining the unobservable quantity with the degeneracy parameter:
- The degeneracy cancels out in sensitivity
- Observability is maintained
- Recovery is always possible

### Mathematical Guarantee

**Theorem 4** (Observability Preservation). The product parameterization preserves observability across all geometric levels:

```
For all φ(V) > 0:
  ∂C/∂τ_UK ≠ 0  (bounded sensitivity)
  σ²(τ_UK) < ∞  (bounded variance)
  UK = τ_UK / φ(V)  (recoverable)
```

**Proof**: Follows from Theorems 1 and 2, and variance analysis. □

## Connection to Other Concepts

### Lattice Theory

The observable parameterization enables:
- **Lattice join operations** on epistemic states
- **Stable sensitivity** across all lattice levels
- **Consistent ordering** of epistemic states

### Geometric Consensus

The geometric factor φ(V) connects to:
- **Platonic solid structures** (V = number of vertices)
- **Consensus thresholds** (derived from geometry)
- **Fault tolerance** (related to φ(V))

### Max-Plus Algebra

The parameterization uses:
- **Tropical scaling** (multiplication in Max-Plus)
- **Irreversible accumulation** (UK only increases)
- **Synchronization** (φ(V) relates to network structure)

## Key Takeaways

✅ **Observable Parameterization** = Making unobservable quantities measurable  
✅ **Vision-Epistemic Isomorphism** = Same math, different domains  
✅ **Product Parameterization** = Combine unobservable with degeneracy factor  
✅ **Recovery Always Possible** = Divide out geometric factor  
✅ **Variance Stays Bounded** = Unlike direct estimation  
✅ **Inherits Proven Solutions** = From computer vision research  

## Next Steps

- **Understand the implicit knowledge problem:** [The Implicit Knowledge Problem](implicit-knowledge-problem.md)
- **Learn about geometric consensus:** [Geometric Consensus](geometric-consensus.md)
- **See Max-Plus algebra:** [Max-Plus Algebra and Causality](max-plus-algebra.md)
- **Explore implementation:** [Scheme Core Implementation](../practical/scheme-core.md)

---

## Exercises

1. **Compute φ(V)**: Calculate φ(8), φ(15), φ(20)

2. **Parameterize**: Given UK=5 and V=12 (φ(12)=4), compute τ_UK

3. **Recover**: Given τ_UK=20 and φ(V)=4, recover UK

4. **Sensitivity**: For KK=10, τ_UK=8, φ(V)=4, compute ∂C/∂UK and ∂C/∂τ_UK

---

*Next: [The Implicit Knowledge Problem](implicit-knowledge-problem.md) - Understand why UK is hard to observe*

*Or: [Max-Plus Algebra and Causality](max-plus-algebra.md) - Learn about irreversible computation*
