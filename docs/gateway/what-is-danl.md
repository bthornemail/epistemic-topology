---
id: what-is-danl
title: "What is DANL? A Simple Introduction"
level: gateway
type: concept
tags: ["introduction", "overview", "beginner"]
keywords: ["what", "introduction", "basics", "start-here"]
prerequisites: []
enables: ["why-it-matters", "core-ideas-simple", "epistemic-visual"]
related: []
readingTime: 5
difficulty: 1
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-11-03"
---

# What is DANL? A Simple Introduction

> **In one sentence:** DANL is a way for computers to work together that mimics how groups of people reach consensus while keeping track of what they know and don't know.

## The Everyday Analogy

Imagine you're organizing a neighborhood block party with 50 neighbors. How do you make decisions together?

### The Traditional Way (Centralized)
- **One person** (the HOA president) decides everything
- Fast but: What if they're unavailable? What if they make a mistake? What if some neighbors don't trust them?

### The DANL Way (Decentralized)
- **Everyone** shares what they know with their neighbors
- People update their understanding based on what they learn
- Decisions emerge naturally when enough people agree
- No single point of failure
- Everyone can trace how the decision was made

## What Makes DANL Special?

### 1. It Knows What It Doesn't Know

Most computer systems either "know" something or don't. DANL keeps track of **four kinds of knowledge**:

- **Known Knowns** (KK): "I know the party is on Saturday"
- **Known Unknowns** (KU): "I know I don't know how many people are vegetarian"
- **Unknown Knowns** (UK): "I intuitively think we need more chairs, but I haven't counted"
- **Unknown Unknowns** (UU): "Things I haven't even thought about yet"

This is like how humans actually think! And it helps computers make better decisions.

### 2. It Uses Geometry to Decide "How Many Votes Do We Need?"

Instead of arbitrary rules like "51% wins" or "we need unanimous consent," DANL uses the mathematics of shapes:

- **For a small group** (4 people): Use a tetrahedron → need 75% agreement (tight consensus)
- **For a medium group** (8 people): Use a cube → need 50% agreement (balanced)
- **For a large group** (20+ people): Use an icosahedron → need 25% agreement (loose consensus)

The bigger the group, the looser the consensus requirement - just like real life!

### 3. It Never Forgets the Order Things Happened

If Alice tells Bob something, and Bob tells Carol, Carol knows that Alice spoke first. DANL keeps perfect track of causality - who said what when - even when events happen simultaneously.

This prevents paradoxes like "How can Carol respond to Bob before Bob heard from Alice?"

### 4. It Can Explain Itself

Every decision DANL makes can be traced back through the chain of knowledge. It's like having a complete audit trail of how a group decision emerged from individual inputs.

## Real-World Example

**Problem:** A company with 50 servers needs to decide which version of software to run.

**Traditional Approach:**
- Central controller tells everyone what to do
- If controller fails, system stuck
- If controller is compromised, whole system at risk

**DANL Approach:**
- Each server talks to its neighbors
- Servers share: "I'm running version 2.3" or "I don't know which version to run"
- Gradually, consensus emerges: "Enough of us are on 2.3, so I'll switch to 2.3"
- No single point of failure
- System self-organizes
- You can trace exactly how the consensus formed

## What's the "Lattice" Part?

A lattice is a mathematical structure where things can be ordered from "less" to "more." Think of it like:

- **Bottom:** Empty knowledge, uncertainty
- **Middle:** Partial knowledge, some agreement
- **Top:** Complete knowledge, full consensus

DANL uses lattices to represent:
- How much a computer knows
- How confident it is
- How much agreement exists in the network

## Why "Decentralized Automaton Network"?

- **Decentralized:** No single controller - everyone is equal
- **Automaton:** Each computer follows simple rules (like cellular automata)
- **Network:** They're all connected and talking to each other
- **Lattice:** Their knowledge forms a mathematical lattice structure

## The Three Languages

DANL is implemented in three programming paradigms that work together:

1. **Scheme** (functional): The core computation engine
2. **Prolog** (logic): Reasoning about what can be inferred
3. **Datalog** (declarative): Querying distributed state

Think of it like having three specialists:
- Scheme is the **doer** (executes the system)
- Prolog is the **thinker** (proves things are correct)
- Datalog is the **tracker** (monitors what's happening)

## What Can You Build With DANL?

- **Distributed databases** that reach consensus without a leader
- **IoT networks** where devices coordinate autonomously
- **Blockchain systems** with provable consensus
- **AI systems** that track uncertainty
- **Collaborative robots** that make group decisions
- **Peer-to-peer networks** with built-in coordination

## The Key Innovation

The breakthrough is treating **implicit knowledge** (Unknown Knowns - the things you know but haven't articulated) the same way that 3D computer vision treats depth perception.

Just as cameras need special math to figure out how far away things are, computer networks need special math to figure out what they implicitly know. DANL solves this!

## Next Steps

Ready to learn more?

- **Understand why this matters:** [Why Does This Matter?](why-it-matters.md)
- **See the core ideas:** [Core Ideas in Plain English](core-ideas-simple.md)
- **Visual introduction:** [Epistemic States Visualized](epistemic-visual.md)
- **Start building:** [Quick Start Guide](../practical/quick-start.md)

## Quick Facts

| Property | Value |
|----------|-------|
| **Type** | Distributed consensus framework |
| **Languages** | Scheme, Prolog, Datalog |
| **Consensus Model** | Geometric (derived from Platonic solids) |
| **Causality Tracking** | Vector clocks + Max-Plus algebra |
| **Knowledge Model** | Four-quadrant epistemic tetrahedron |
| **Tested Scale** | Up to 1000 nodes |
| **Open Source** | MIT License |

---

## Key Takeaways

✅ DANL lets computers work together without a central coordinator  
✅ It tracks four types of knowledge, including implicit knowledge  
✅ Consensus thresholds come from geometry, not arbitrary rules  
✅ Perfect causality tracking prevents paradoxes  
✅ Self-explanatory: you can always see how decisions were made  
✅ Scales to thousands of nodes

**Bottom Line:** DANL brings human-like reasoning about knowledge and consensus to distributed computer systems.

---

*Next: [Why Does This Matter?](why-it-matters.md) - Learn about the real-world problems DANL solves*