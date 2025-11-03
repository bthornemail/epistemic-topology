---
id: epistemic-states
title: "Epistemic States: The Four Quadrants of Knowledge"
level: foundational
type: concept
tags: ["epistemic-logic", "knowledge-representation", "rumsfeld-tetrahedron"]
keywords: ["KK", "KU", "UK", "UU", "known-knowns", "known-unknowns", "unknown-knowns", "unknown-unknowns"]
prerequisites: ["what-is-danl", "core-ideas-simple"]
enables: ["observable-param", "lattice-theory", "scheme-core"]
related: ["geometric-consensus"]
readingTime: 20
difficulty: 2
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-11-03"
concepts: ["epistemic-tetrahedron", "knowledge-quadrants", "epistemic-certainty", "epistemic-confidence"]
domains: ["distributed-systems", "ai", "epistemology"]
---

# Epistemic States: The Four Quadrants of Knowledge

> **Core Idea:** What a system knows depends not just on data, but on awareness of that data. DANL tracks four distinct types of knowledge, enabling systems to reason about their own uncertainty.

## The Rumsfeld Quadrants

In 2002, U.S. Secretary of Defense Donald Rumsfeld gave a famous press conference where he said:

> "There are known knowns; there are things we know we know. We also know there are known unknowns; that is to say we know there are some things we do not know. But there are also unknown unknowns—the ones we don't know we don't know."

He was ridiculed at the time, but he was describing a fundamental truth about knowledge. And he missed one: **unknown knowns** - things we know but haven't articulated.

## The Four Quadrants

DANL represents epistemic state as a four-dimensional space:

```
         SELF-AWARENESS
              ↑
              |
    KU  │  KK  (Known)
   ─────┼─────
    UU  │  UK  (Unknown)
              |
              ↓
        WORLD-KNOWLEDGE →
```

### 1. Known Knowns (KK) - **Explicit Knowledge**

**Definition:** Facts you know that you're aware you know.

**Examples:**
- "The system has 50 nodes"
- "Node 17 is running version 2.3"
- "The consensus threshold is 75%"

**In Code:**
```scheme
(define-record-type epistemic-state
  (make-epistemic kk ku uk uu)
  epistemic-state?
  (kk epistemic-kk)    ; Known knowns: explicit facts
  (ku epistemic-ku)    ; Known unknowns: identified gaps
  (uk epistemic-uk)    ; Unknown knowns: implicit patterns
  (uu epistemic-uu))   ; Unknown unknowns: true mysteries
```

**Characteristics:**
- ✅ Directly observable
- ✅ Can be stored in databases
- ✅ Can be communicated precisely
- ✅ Forms the basis of explicit reasoning

### 2. Known Unknowns (KU) - **Identified Ignorance**

**Definition:** Things you know you don't know - identified gaps in knowledge.

**Examples:**
- "I don't know if node 23 is online" (haven't checked)
- "I don't know how many users will connect tomorrow" (future uncertainty)
- "I don't know if this algorithm will scale to 1M nodes" (untested)

**In Traditional Systems:**
- Often represented as `null`, `undefined`, or `?`
- Treated as missing data
- No distinction from unknown unknowns

**In DANL:**
- Explicitly tracked
- Can be prioritized for information gathering
- Influences decision confidence

**Real-World Analogy:**
Imagine you're planning a road trip:
- KK: "It's 300 miles to the destination"
- KU: "I don't know if there's traffic" ← You know this is a gap!

### 3. Unknown Knowns (UK) - **Implicit Knowledge**

**Definition:** Patterns you've learned but haven't consciously articulated. **This is the key innovation!**

**Examples:**
- An experienced driver "just knows" when to brake (learned pattern, not explicit rule)
- A system has learned correlations but hasn't formalized them
- Intuitive understanding not yet made explicit

**The Problem:**
In traditional systems, UK is **invisible**. You can't optimize what you can't observe.

**The Solution: Observable Parameterization**
Just as 3D vision parameterizes depth (tZ → tZ·β), DANL parameterizes implicit knowledge:

```
UK → UK·φ(V) = τ_UK
```

Where:
- `UK` = raw implicit knowledge (unobservable)
- `φ(V)` = Euler's totient function (geometric parameter)
- `τ_UK` = observable product

**Why This Works:**
The sensitivity to τ_UK remains bounded:
```
∂C/∂τ_UK = -1/(1 + τ_UK/KK)² ≠ 0
```

Whereas direct UK sensitivity degenerates:
```
∂C/∂UK = -φ(V)/(1 + τ_UK/KK)² → 0 as φ(V) → 0
```

**Real-World Analogy:**
You can't directly measure how far away something is from a photo, but you can measure **disparity** (the difference between two views). Similarly, you can't directly observe UK, but you can observe **τ_UK** (the parameterized product).

### 4. Unknown Unknowns (UU) - **True Mystery**

**Definition:** Things you don't know and don't know that you don't know. The genuine surprises.

**Examples:**
- Before COVID-19: "A pandemic will shut down the world economy"
- Before the internet: "Information will be free and global"
- Before a system failure: "This edge case will cause cascading failure"

**Characteristics:**
- Cannot be enumerated (by definition!)
- Shrinks as you learn (UU → KU → KK)
- Represents epistemic risk

**In DANL:**
UU is estimated as the "complement" of known space:
```
UU ≈ Total_Possible_Space - (KK + KU + UK)
```

**Real-World Analogy:**
When Columbus set sail, he didn't know about the Americas (UU). After discovering land, he knew there was a continent but didn't know its full extent (KU). After mapping it, it became KK.

## The Epistemic Tetrahedron

Geometrically, these four quadrants form a **tetrahedron** (4-vertex simplex):

```
                    UU (top)
                    /|\
                   / | \
                  /  |  \
                 /   |   \
                /    |    \
               /_____|_____\
             KU      |      UK
              \      |      /
               \     |     /
                \    |    /
                 \   |   /
                  \  |  /
                   \ | /
                    \|/
                    KK (base)
```

**Properties:**
- **Vertices:** The four states (KK, KU, UK, UU)
- **Edges:** Transitions between states
- **Faces:** Relationships (e.g., KK ↔ UK are both "known")
- **Volume:** Total epistemic capacity

## Transitions Between States

Knowledge doesn't stay static. It flows between quadrants:

### 1. UU → KU (Discovery)
**What happens:** You become aware of something you didn't know existed.

**Example:** "Wait, I didn't realize there was a rate limiting issue!" (now you know you don't know the limit)

```scheme
(define (discover-unknown agent domain)
  ;; Move from UU to KU
  (let ((current-uu (epistemic-uu (agent-state agent)))
        (current-ku (epistemic-ku (agent-state agent))))
    (set-epistemic-uu! agent (- current-uu 1))
    (set-epistemic-ku! agent (+ current-ku 1))))
```

### 2. KU → KK (Learning/Verification)
**What happens:** You gather information to fill a known gap.

**Example:** "Let me check node 23... it's online!" (now you know)

```scheme
(define (verify-uncertainty agent fact)
  ;; Move from KU to KK  
  (let ((current-ku (epistemic-ku (agent-state agent)))
        (current-kk (epistemic-kk (agent-state agent))))
    (set-epistemic-ku! agent (- current-ku 1))
    (set-epistemic-kk! agent (+ current-kk 1))
    (add-fact agent fact)))
```

### 3. UK → KK (Articulation/Formalization)
**What happens:** You make implicit knowledge explicit.

**Example:** "I've been doing X because of pattern Y, let me formalize that as a rule"

```scheme
(define (articulate-implicit agent pattern)
  ;; Move from UK to KK
  (let ((current-uk (epistemic-uk (agent-state agent)))
        (current-kk (epistemic-kk (agent-state agent))))
    (set-epistemic-uk! agent (- current-uk 1))
    (set-epistemic-kk! agent (+ current-kk 1))
    (formalize-pattern agent pattern)))
```

### 4. KK → KU (Forgetting/Uncertainty)
**What happens:** You lose certainty about something.

**Example:** "I thought node 23 was online, but now I'm not sure"

```scheme
(define (introduce-uncertainty agent fact)
  ;; Move from KK to KU
  (let ((current-kk (epistemic-kk (agent-state agent)))
        (current-ku (epistemic-ku (agent-state agent))))
    (set-epistemic-kk! agent (- current-kk 1))
    (set-epistemic-ku! agent (+ current-ku 1))
    (mark-uncertain agent fact)))
```

### Transition Diagram

```
    UU ────discovery────→ KU
     │                     │
     │                     │
  surprise              learning
     │                     │
     ↓                     ↓
    UK ──articulation───→ KK
     ↑                     │
     │                     │
  learning           forgetting
     │                     │
     └────────────────────┘
```

## Computing Epistemic Certainty

How confident should a system be in its decisions? It depends on all four quadrants!

### Formula

```
Epistemic Certainty (C) = KK / (1 + τ_UK / KK)
```

Where:
- `KK` = explicit knowledge (directly observable)
- `τ_UK` = UK·φ(V) (observable product, not raw UK)

### Why This Formula?

1. **High KK, low τ_UK** → High certainty
   - You know a lot, have little implicit knowledge
   - Example: Well-documented system

2. **Low KK, high τ_UK** → Low certainty
   - You don't know much explicitly, relying on implicit patterns
   - Example: New system learning patterns

3. **Balanced** → Moderate certainty
   - Healthy mix of explicit and implicit knowledge

### Epistemic Confidence

We can also compute confidence (comfort with Known Unknowns):

```
Epistemic Confidence (Conf) = KU / (1 + τ_UU / KU)
```

Where:
- `KU` = identified unknowns
- `τ_UU` = UU·(V/φ(V)) (scaled unknown unknowns)

## Real-World Application: Medical Diagnosis

Let's see how epistemic states apply to medical diagnosis:

### Scenario: Doctor diagnosing a patient

**Known Knowns (KK):**
- Patient is 45 years old, male
- Blood pressure: 140/90
- Symptoms: chest pain, shortness of breath
- Test result: ECG shows irregularity

**Known Unknowns (KU):**
- Don't know: family history (patient doesn't remember)
- Don't know: cholesterol levels (test not yet done)
- Don't know: response to medication (not yet tried)

**Unknown Knowns (UK):**
- Doctor has 20 years of experience
- "Something feels off" (intuition from pattern matching)
- Recognizes presentation is unusual but can't articulate why

**Unknown Unknowns (UU):**
- Rare genetic condition not in medical literature
- Novel drug interaction nobody has documented
- Environmental factor not considered

### Decision Making

**Traditional System:**
```
If (blood_pressure > 130 AND symptoms.includes("chest_pain")) {
    diagnosis = "hypertension"
    confidence = 90%
}
```
**Problem:** No acknowledgment of UK (doctor's intuition) or UU (rare conditions)

**DANL System:**
```scheme
(define diagnosis-state 
  (make-epistemic 
    4   ; KK: 4 explicit facts
    3   ; KU: 3 identified gaps
    2   ; UK: intuition/experience (parameterized)
    ???)) ; UU: unknown unknowns

(define certainty 
  (compute-certainty diagnosis-state 12))  ; 12 = geometric parameter

; certainty might be 65%, not 90%!
; System knows to be more cautious
```

## Distributed Systems Example

### Scenario: 50-node distributed database

**Node 17's Perspective:**

**KK (Known Knowns):**
```scheme
(define node-17-kk
  '((self-version "2.3.1")
    (neighbor-status ((node-16 online) (node-18 online)))
    (local-state healthy)
    (consensus-threshold 0.75)))
```

**KU (Known Unknowns):**
```scheme
(define node-17-ku
  '((node-42-status unknown)  ; Haven't heard from it
    (network-latency variable) ; Fluctuating
    (future-load unpredictable))) ; Can't predict
```

**UK (Unknown Knowns - via τ_UK):**
```scheme
; Node 17 has learned patterns but hasn't formalized:
; - Node 42 often goes offline around 2am (implicit)
; - High latency correlates with increased load (implicit)
; - Certain message patterns predict failures (implicit)

(define tau-uk 
  (* (implicit-patterns node-17) 
     (euler-phi 50)))  ; Geometric parameter for 50-node network
```

**UU (Unknown Unknowns):**
```scheme
; Things node 17 doesn't know it doesn't know:
; - A new attack vector nobody has discovered
; - A bug in version 2.3.1 that hasn't manifested
; - A network partition about to occur
```

### Making Decisions

When node 17 needs to decide whether to commit a transaction:

```scheme
(define (should-commit? node transaction)
  (let* ((epistemic (node-epistemic-state node))
         (certainty (compute-certainty epistemic (network-size))))
    (cond
      [(> certainty 0.9) 'commit]    ; High confidence
      [(< certainty 0.5) 'reject]    ; Too uncertain
      [else 'request-more-info])))   ; Need more data
```

## Comparison to Other Frameworks

| Framework | KK | KU | UK | UU |
|-----------|----|----|----|----|
| **Traditional DB** | ✅ (data) | ❌ (null) | ❌ (invisible) | ❌ (ignored) |
| **Probabilistic** | ✅ (facts) | ✅ (distributions) | ❌ (implicit) | ❌ (ignored) |
| **Fuzzy Logic** | ✅ (crisp) | ✅ (fuzzy) | ❌ (implicit) | ❌ (ignored) |
| **DANL** | ✅ | ✅ | ✅ (parameterized!) | ✅ (estimated) |

## Why Four Quadrants Matter

### 1. Better Decision Making
**With DANL:** "I'm 65% certain because I have explicit facts (KK), but I'm relying on some implicit patterns (UK) and there are unknowns (KU, UU)"

**Without DANL:** "I'm 90% certain" *(overconfident because UK is invisible)*

### 2. Risk Management
Tracking UU and UK helps you understand epistemic risk:
- High UK → System relying on implicit patterns (could be fragile)
- High UU → True uncertainty (need to be cautious)

### 3. Continuous Learning
The transitions (UU → KU → KK, UK → KK) represent learning:
- Systems can track their own learning progress
- Can prioritize what to learn next
- Can articulate implicit knowledge over time

### 4. Transparency
"Why did the system make this decision?"
- KK: "Based on these facts..."
- UK: "...and these learned patterns..."
- KU: "...while aware of these gaps..."
- UU: "...and acknowledging true unknowns"

## Mathematical Properties

### Lattice Structure

The epistemic states form a lattice with partial order:

```
KK ⊑ (KK ⊔ UK)  (explicit ≤ total known)
UK ⊑ (KK ⊔ UK)  (implicit ≤ total known)
(KK ⊔ UK) ⊑ (KK ⊔ UK ⊔ KU ⊔ UU)  (known ≤ total)
```

### Conservation Law

Total epistemic capacity is conserved:

```
KK + KU + UK + UU = Total_Capacity (constant)
```

Learning moves capacity between quadrants but doesn't create it.

### Entropy

Epistemic entropy measures disorder:

```
H(E) = -(p_KK log p_KK + p_KU log p_KU + p_UK log p_UK + p_UU log p_UU)
```

Where p_X = X / Total_Capacity

- Low entropy: mostly KK (ordered, certain)
- High entropy: distributed across quadrants (disordered, uncertain)

## Implementation in DANL

### Core Data Structure

```scheme
(define-record-type epistemic
  (make-epistemic kk ku uk uu)
  epistemic?
  (kk epistemic-kk epistemic-kk-set!)
  (ku epistemic-ku epistemic-ku-set!)
  (uk epistemic-uk epistemic-uk-set!)
  (uu epistemic-uu epistemic-uu-set!))
```

### Observable Parameterization

```scheme
(define-record-type observable-epistemic
  (make-observable-epistemic kk ku tau-uk tau-uu phi v)
  observable-epistemic?
  (kk epistemic-kk)
  (ku epistemic-ku)
  (tau-uk epistemic-tau-uk)    ; UK·φ(V) - observable!
  (tau-uu epistemic-tau-uu)    ; UU·(V/φ(V)) - scaled
  (phi geometric-phi)          ; Euler's totient
  (v geometric-v))             ; Vertices (network size)

(define (parameterize-epistemic epistemic vertices)
  (let* ((phi (euler-phi vertices))
         (inner-dim (/ vertices phi))
         (kk (epistemic-kk epistemic))
         (ku (epistemic-ku epistemic))
         (uk (epistemic-uk epistemic))
         (uu (epistemic-uu epistemic)))
    (make-observable-epistemic
      kk
      ku
      (* uk phi)         ; τ_UK = UK·φ(V)
      (* uu inner-dim)   ; τ_UU = UU·(V/φ(V))
      phi
      vertices)))
```

### Certainty Computation

```scheme
(define (epistemic-certainty observable)
  (let ((kk (epistemic-kk observable))
        (tau-uk (epistemic-tau-uk observable)))
    (/ kk (+ 1 (/ tau-uk kk)))))

(define (epistemic-confidence observable)
  (let ((ku (epistemic-ku observable))
        (tau-uu (epistemic-tau-uu observable)))
    (/ ku (+ 1 (/ tau-uu ku)))))
```

## Prolog Rules

```prolog
% Epistemic state representation
epistemic_state(Agent, KK, KU, UK, UU) :-
    known_knowns(Agent, KK),
    known_unknowns(Agent, KU),
    unknown_knowns(Agent, UK),
    unknown_unknowns(Agent, UU).

% Transitions
transition(Agent, uu_to_ku, Domain) :-
    unknown_unknown(Agent, Domain),
    become_aware(Agent, Domain),
    retract(unknown_unknown(Agent, Domain)),
    assert(known_unknown(Agent, Domain)).

transition(Agent, ku_to_kk, Fact) :-
    known_unknown(Agent, Fact),
    verify(Agent, Fact),
    retract(known_unknown(Agent, Fact)),
    assert(known_knows(Agent, Fact)).

% Certainty check
high_certainty(Agent, Vertices) :-
    observable_params(Agent, Vertices, KK, _, TauUK, _),
    Certainty is KK / (1 + TauUK / KK),
    Certainty > 0.8.
```

## Next Steps

Now that you understand epistemic states, explore:

- **[Observable Parameterization](observable-parameterization.md)** - Deep dive into UK·φ(V)
- **[Lattice Theory](lattice-theory.md)** - How epistemic states form a lattice
- **[Scheme Core](../practical/scheme-core.md)** - Implementation details
- **[Case Study](../applied/case-study-consensus.md)** - Real-world application

## Key Takeaways

✅ **Four quadrants:** KK, KU, UK, UU represent different types of knowledge  
✅ **UK is the key innovation:** Observable parameterization makes implicit knowledge visible  
✅ **Transitions flow:** Knowledge moves between quadrants as systems learn  
✅ **Better decisions:** Tracking all four quadrants prevents overconfidence  
✅ **Lattice structure:** Epistemic states have mathematical properties  
✅ **Production-ready:** Implemented in Scheme, Prolog, and Datalog  

---

*Related: [Observable Parameterization](observable-parameterization.md) | [Lattice Theory](lattice-theory.md) | [Geometric Consensus](geometric-consensus.md)*