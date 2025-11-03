# Contributing to Epistemic Topology

Thank you for your interest in contributing! This project aims to make advanced distributed systems concepts accessible to everyone through a carefully structured epistemic topology.

## 🌟 Ways to Contribute

### 1. Improve Documentation
- **Clearer explanations** at any level (gateway/foundational/practical/applied)
- **Better analogies** for complex concepts
- **Visual aids** (diagrams, charts, animations)
- **Examples** and use cases
- **Typo fixes** and grammar improvements

### 2. Add New Content
- **New learning paths** for different audiences
- **Translations** to other languages
- **Video tutorials** or screencasts
- **Interactive examples**
- **Case studies** from real-world applications

### 3. Improve Code
- **Implementation enhancements** (Scheme/Prolog/Datalog)
- **Performance optimizations**
- **Bug fixes**
- **Test coverage**
- **Tool improvements** (validation, visualization)

### 4. Improve Structure
- **Better organization** of existing content
- **New epistemic relationships** between documents
- **Validation improvements**
- **Accessibility enhancements**

## 📋 Contribution Guidelines

### Epistemic Node Structure

Every document MUST include YAML front matter following the `EpistemicNode` interface:

```yaml
---
id: unique-kebab-case-identifier
title: "Human-Readable Title"
level: gateway | foundational | practical | applied
type: navigation | concept | implementation | application | guide
tags: [primary, categorization, tags]
keywords: [secondary, search, keywords]
prerequisites: [required-node-ids]
enables: [unlocked-node-ids]
related: [related-node-ids]
readingTime: 10  # minutes
difficulty: 1-5  # 1=easiest, 5=hardest
status: draft | review | published
authors: ["Your Name"]
dateCreated: "YYYY-MM-DD"
---
```

### Level Guidelines

#### Gateway Level (Difficulty 1-2)
- **Audience:** Everyone, no prerequisites
- **Language:** Plain English, no jargon
- **Analogies:** Use real-world examples
- **Length:** 5-15 minutes reading time
- **Style:** Conversational, friendly, encouraging

**Example opening:**
> "Imagine you're organizing a neighborhood block party..."

#### Foundational Level (Difficulty 2-4)
- **Audience:** Learners with basic programming knowledge
- **Language:** Technical but explained
- **Depth:** Core concepts with math when necessary
- **Length:** 15-40 minutes reading time
- **Style:** Educational, thorough, building up complexity

**Example opening:**
> "In this document, we explore how epistemic states form a lattice structure..."

#### Practical Level (Difficulty 3-5)
- **Audience:** Developers implementing systems
- **Language:** Technical, code-heavy
- **Focus:** How-to, step-by-step, working examples
- **Length:** 20-60 minutes reading time
- **Style:** Direct, practical, actionable

**Example opening:**
> "Let's implement your first DANL automaton. First, set up your environment..."

#### Applied Level (Difficulty 3-5)
- **Audience:** Architects, decision-makers
- **Language:** Technical but strategic
- **Focus:** Real-world patterns, production concerns
- **Length:** 15-45 minutes reading time
- **Style:** Professional, pattern-oriented, best practices

**Example opening:**
> "This case study examines a 50-node production deployment..."

## 🔧 Development Setup

### Prerequisites
- Node.js 16+ (for validation tools)
- Git

### Clone and Install

```bash
git clone https://github.com/bthornemail/epistemic-topology.git
cd epistemic-topology
npm install
```

### Validate Your Changes

```bash
npm run validate
```

This checks:
- ✅ All front matter is valid YAML
- ✅ All required fields are present
- ✅ All levels and types are valid
- ✅ All prerequisite nodes exist
- ✅ No circular dependencies
- ✅ Reading times are reasonable
- ✅ Difficulty matches level

## ✍️ Writing Process

### 1. Plan Your Document

Before writing, answer:
- **Who is this for?** (Determines level)
- **What will they learn?** (Becomes enables)
- **What must they know first?** (Becomes prerequisites)
- **How does this connect?** (Becomes related)

### 2. Create the File

```bash
# Gateway document
touch docs/gateway/your-topic.md

# Foundational document
touch docs/foundational/your-concept.md

# Practical document
touch docs/practical/your-guide.md

# Applied document  
touch docs/applied/your-case-study.md
```

### 3. Add Front Matter

Copy template from [types/epistemic-node.ts](types/epistemic-node.ts) and fill it out.

### 4. Write Content

Follow the level guidelines above. Remember:
- **Gateway:** Analogies and motivation
- **Foundational:** Concepts and theory
- **Practical:** Code and implementation
- **Applied:** Patterns and production

### 5. Add Cross-Links

Link to related documents:
```markdown
See also: [Related Concept](../foundational/related.md)
```

### 6. Validate

```bash
npm run validate
```

Fix any errors or warnings.

### 7. Test Readability

- Read it aloud
- Have someone at the target level review it
- Check that reading time estimate is accurate
- Ensure difficulty rating matches content

## 🎨 Visual Guidelines

### Diagrams

Use ASCII art for simple diagrams:

```
    Gateway Level
         ↓
  Foundational Level
         ↓
    Practical Level
         ↓
    Applied Level
```

Or create SVG/PNG and place in `docs/assets/`

### Code Blocks

Always specify language:

````markdown
```scheme
(define (example x)
  (+ x 1))
```
````

### Images

- Place in `docs/assets/images/`
- Use descriptive names: `epistemic-tetrahedron.svg`
- Include alt text: `![Epistemic Tetrahedron](../assets/images/epistemic-tetrahedron.svg)`

## 🔍 Review Process

### Self-Review Checklist

Before submitting, ensure:

- [ ] Front matter is complete and valid
- [ ] Title is clear and descriptive
- [ ] Level and difficulty are appropriate
- [ ] Prerequisites are listed
- [ ] Reading time is estimated
- [ ] All internal links work
- [ ] Code examples run correctly
- [ ] Validation passes (`npm run validate`)
- [ ] Writing matches level guidelines
- [ ] No typos or grammatical errors

### Peer Review

All contributions go through peer review:
1. Submit pull request
2. Automated validation runs
3. Maintainer reviews for quality and accuracy
4. Revisions if needed
5. Merge!

## 📝 Commit Messages

Use clear, descriptive commit messages:

```
Add gateway doc: What is DANL?

- Explains core concepts using block party analogy
- Includes four knowledge quadrants
- Links to why-it-matters and core-ideas-simple
```

## 🌍 Translations

We welcome translations! When translating:

1. Keep front matter IDs in English (for linking)
2. Translate title, content, and tags/keywords
3. Add language code to filename: `what-is-danl.es.md`
4. Create language-specific index: `INDEX.es.md`

## 🐛 Reporting Issues

Found a problem? [Open an issue](https://github.com/bthornemail/epistemic-topology/issues) with:

- **What's wrong?** (broken link, unclear explanation, error)
- **Where is it?** (file path and line number)
- **Suggested fix** (if you have one)

## 💬 Questions?

- **General questions:** [Discussion board](https://github.com/bthornemail/epistemic-topology/discussions)
- **Bug reports:** [Issues](https://github.com/bthornemail/epistemic-topology/issues)
- **Email:** bthornemail@gmail.com

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Acknowledgments

Thank you for helping make distributed systems knowledge accessible to everyone!

---

<p align="center">
  <strong>Ready to contribute? <a href="https://github.com/bthornemail/epistemic-topology">Visit the repository</a></strong>
</p>