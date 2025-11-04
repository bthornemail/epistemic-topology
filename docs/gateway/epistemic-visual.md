---
id: epistemic-visual
title: "Visual Introduction to Epistemic States"
level: gateway
type: concept
tags: ["visual", "epistemic-states", "diagrams", "four-quadrants"]
keywords: ["kk", "ku", "uk", "uu", "rumsfeld", "tetrahedron", "visualization"]
prerequisites: ["what-is-danl"]
enables: ["epistemic-states"]
related: ["core-ideas-simple", "why-it-matters"]
readingTime: 7
difficulty: 1
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-11-03"
---

# Visual Introduction to Epistemic States

> **See the four knowledge quadrants come to life through diagrams and visualizations**

After reading about [the four types of knowledge](what-is-danl.md), let's visualize them! This visual guide will help you understand how knowledge flows between quadrants and how DANL tracks them.

## The Four Quadrants

```
┌─────────────────────────────────────────────────────────────┐
│                    EPISTEMIC STATES                         │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │                  │         │                  │         │
│  │   KNOWN KNOWNS   │         │  KNOWN UNKNOWNS  │         │
│  │      (KK)        │         │      (KU)        │         │
│  │                  │         │                  │         │
│  │  "I know that    │         │  "I know I don't │         │
│  │   I know this"   │         │   know this"    │         │
│  │                  │         │                  │         │
│  │  Explicit,       │         │  Explicit,       │         │
│  │  Verified        │         │  Unverified      │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                              │
│         EXPLICIT (Articulated)                              │
│         ══════════════════════                             │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │                  │         │                  │         │
│  │ UNKNOWN KNOWNS   │         │ UNKNOWN UNKNOWNS  │         │
│  │      (UK)        │         │      (UU)        │         │
│  │                  │         │                  │         │
│  │  "I don't know   │         │  "I don't know   │         │
│  │   that I know    │         │   that I don't   │         │
│  │   this"          │         │   know this"     │         │
│  │                  │         │                  │         │
│  │  Implicit,       │         │  Implicit,        │         │
│  │  Verified        │         │  Unverified      │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                              │
│         IMPLICIT (Unarticulated)                            │
│         ═══════════════════════                            │
└─────────────────────────────────────────────────────────────┘
```

## The Rumsfeld Tetrahedron

The four quadrants form a tetrahedron (4-sided shape) in mathematical space:

```
                    KK (Known Knowns)
                         /\
                        /  \
                       /    \
                      /      \
                     /        \
                    /          \
                   /            \
                  /              \
                 /                \
                /                  \
               /                    \
              /                      \
             /                        \
            /                          \
           /                            \
          /                              \
         /                                \
        /                                  \
       /                                    \
      /                                      \
     /                                        \
    /                                          \
   /____________________________________________\
  KU (Known Unknowns)                    UK (Unknown Knowns)
                                   
                                   
                        UU (Unknown Unknowns)
                        (The Horizon)
```

### Why a Tetrahedron?

- **4 vertices** = 4 types of knowledge
- **6 edges** = Connections between knowledge types
- **4 faces** = Different perspectives on knowledge
- **3D structure** = Captures the complexity of knowledge relationships

## Knowledge Flow Diagram

Knowledge doesn't stay static - it flows between quadrants:

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│    KK    │──▶│    KU    │──▶│    UK    │──▶│    UU    │
│          │   │          │   │          │   │          │
│ Explicit │   │ Question │   │ Implicit │   │ Horizon  │
│ Verified │   │ Marked   │   │ Assumed  │   │ Unknown  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │              │              │
     │              │              │              │
     ▼              ▼              ▼              ▼
  ┌──────────────────────────────────────────────────┐
  │         EXPLICIT KNOWLEDGE DOMAIN                │
  │         (KK + KU)                                │
  │         Directly observable, measurable          │
  └──────────────────────────────────────────────────┘
  
  ┌──────────────────────────────────────────────────┐
  │         IMPLICIT KNOWLEDGE DOMAIN                │
  │         (UK + UU)                                │
  │         Requires special techniques to observe   │
  └──────────────────────────────────────────────────┘
```

## Color-Coded Knowledge Map

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🔵 BLUE (KK) - Known Knowns                      │
│     • Facts you can state explicitly               │
│     • Verified information                         │
│     • Example: "The server is at IP 192.168.1.1"  │
│                                                     │
│  🟢 GREEN (KU) - Known Unknowns                   │
│     • Questions you're aware of                    │
│     • Gaps you know exist                          │
│     • Example: "I don't know the server's uptime" │
│                                                     │
│  🟡 YELLOW (UK) - Unknown Knowns                   │
│     • Assumptions you haven't articulated          │
│     • Implicit knowledge                           │
│     • Example: "I assume the server is secure"    │
│                                                     │
│  🔴 RED (UU) - Unknown Unknowns                    │
│     • Things you haven't even considered          │
│     • The horizon of ignorance                     │
│     • Example: "There might be security issues I   │
│                haven't thought about"              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Real-World Example: Software Development Team

Let's see how this maps to a real scenario:

```
TEAM KNOWLEDGE MAP

┌──────────────────────────────────────────────────────────┐
│  KK (🔵) - Explicit Knowledge                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • Code is in Git repository                        │ │
│  │ • API runs on port 8080                            │ │
│  │ • Database has 1000 users                          │ │
│  │ • Tests pass 95% of the time                       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  KU (🟢) - Known Questions                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • How many users can we handle?                    │ │
│  │ • What's the exact API response time?              │ │
│  │ • Which features are most used?                    │ │
│  │ • What's our error rate?                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  UK (🟡) - Implicit Assumptions                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • "We assume the database won't fail"              │ │
│  │ • "We assume users won't abuse the API"            │ │
│  │ • "We assume our security practices are good"     │ │
│  │ • "We assume the code works as documented"         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  UU (🔴) - Unknown Unknowns                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • Potential security vulnerabilities               │ │
│  │ • Edge cases we haven't discovered                │ │
│  │ • Performance bottlenecks we don't know about     │ │
│  │ • Dependencies that might break                   │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## The Observable Parameterization Visualization

Remember how UK becomes observable? Here's how it works:

```
BEFORE (Unobservable):
┌─────────────────────────────────────────────┐
│  UK (Unknown Knowns)                       │
│  ┌───────────────────────────────────────┐ │
│  │  ????????                             │ │
│  │  (Can't measure directly)             │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

AFTER (Observable):
┌─────────────────────────────────────────────┐
│  UK × φ(V) (Observable Product)             │
│  ┌───────────────────────────────────────┐ │
│  │  [Measurable!]                        │ │
│  │  UK × Geometric Factor                │ │
│  │  = Observable Bundle                  │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Think of it like:
📷 Camera Depth × Focal Length = Observable
🧠 Implicit Knowledge × Complexity = Observable
```

## Geometric Consensus Visualization

How geometry determines consensus thresholds:

```
SMALL GROUP (4 people) - Tetrahedron
┌─────────────────────────────────────┐
│   🔵    🔵                           │
│      ╱    ╲                          │
│   🔵      🔵                         │
│  (Need 3 to agree = 75%)            │
└─────────────────────────────────────┘

MEDIUM GROUP (8 people) - Cube
┌─────────────────────────────────────┐
│  🔵  🔵  🔵  🔵                     │
│  🔵  🔵  🔵  🔵                     │
│  (Need 4 to agree = 50%)            │
└─────────────────────────────────────┘

LARGE GROUP (12 people) - Icosahedron
┌─────────────────────────────────────┐
│  🔵 🔵 🔵 🔵 🔵 🔵                  │
│  🔵 🔵 🔵 🔵 🔵 🔵                  │
│  (Need 3 to agree = 25%)            │
└─────────────────────────────────────┘

Key Insight: More vertices = Looser consensus requirement
```

## Knowledge State Transitions

How knowledge moves between quadrants:

```
Discovery Path:
UU → UK → KU → KK
│    │    │    │
│    │    │    └─► "I explicitly know this"
│    │    └──────► "I know I don't know this"
│    └───────────► "I think I know this"
└────────────────► "I didn't know this existed"

Articulation Path:
UK → KK
│    │
│    └─► "I've now stated my implicit assumption"
└──────► "I had this assumption but didn't realize it"

Question Path:
KK → KU
│    │
│    └─► "I realize I don't know this anymore"
└──────► "I thought I knew this"

Horizon Expansion:
UU → UK
│    │
│    └─► "I've discovered something I didn't know existed"
└──────► "The unknown unknown"
```

## The Epistemic Landscape

Think of knowledge as a landscape:

```
                    ┌─────────────┐
                    │   PEAK      │
                    │   (KK)      │
                    │ Explicit    │
                    │ Knowledge   │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐
    │  SLOPE  │      │  VALLEY   │    │  HORIZON   │
    │   (KU)  │      │   (UK)    │    │   (UU)     │
    │ Known   │      │ Implicit  │    │ Unknown    │
    │ Unknown │      │ Assumed   │    │ Unknown    │
    └─────────┘      └───────────┘    └────────────┘
    
    Observable    Observable        Unobservable
    (Measurable)  (With technique)  (Horizon)
```

## Interactive Elements

### Knowledge Quadrant Quiz

Try to identify which quadrant each statement belongs to:

1. "I know the server IP address" → **KK** ✅
2. "I don't know the server's uptime" → **KU** ✅
3. "I assume the server is secure" → **UK** ✅
4. "I haven't thought about security vulnerabilities" → **UU** ✅

### Visual Memory Aid

```
    K   U
  K ┌───┬───┐
    │KK │KU │
    ├───┼───┤
  U │UK │UU │
    └───┴───┘
    
Remember:
- First letter = Explicit (K) or Implicit (U)
- Second letter = Known (K) or Unknown (U)
```

## Key Visual Patterns

### Pattern 1: The Observable Domain
```
KK + KU = Observable Domain
✅ Easy to measure
✅ Directly accessible
✅ Can be verified
```

### Pattern 2: The Implicit Domain
```
UK + UU = Implicit Domain
⚠️ Requires special techniques
⚠️ UK can be made observable (with parameterization)
⚠️ UU remains as horizon
```

### Pattern 3: The Articulation Path
```
UK → KU → KK
Implicit → Question → Explicit
(Making assumptions explicit through questioning)
```

## Next Steps

Now that you've visualized the epistemic states:

- **Understand the math:** [Epistemic States: The Four Quadrants](../foundational/epistemic-states.md)
- **Learn about observability:** [Observable Parameterization](../foundational/observable-parameterization.md)
- **See it in action:** [Quick Start Guide](../practical/quick-start.md)

---

## Visual Summary

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│  EPISTEMIC STATES = 4 Quadrants = 1 Tetrahedron         │
│                                                           │
│  🔵 KK  →  Explicit, Verified  →  Observable            │
│  🟢 KU  →  Explicit, Unverified → Observable            │
│  🟡 UK  →  Implicit, Verified  →  Observable (with      │
│                                                          │
│  technique)                                             │
│  🔴 UU  →  Implicit, Unverified → Horizon               │
│                                                           │
│  Geometry determines consensus thresholds                │
│  Max-Plus algebra ensures causality                      │
│  Observable parameterization makes UK measurable         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

*Next: [Core Ideas in Plain English](core-ideas-simple.md) - Understand the five breakthrough ideas*

*Or jump to: [Foundational Level](../foundational/INDEX.md) - Learn the mathematics*
