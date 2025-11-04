---
id: testing-guide
title: "Testing Guide for Epistemic Topology"
level: practical
type: guide
tags: ["testing", "validation", "epistemic", "quality-assurance"]
keywords: ["testing", "validation", "test", "quality", "epistemic-topology"]
prerequisites: ["prolog-rules", "datalog-queries"]
enables: ["validation-tools"]
related: ["validation-tools", "quick-start"]
readingTime: 30
difficulty: 2
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Testing Guide for Epistemic Topology

> **How to test DANL implementations and validate epistemic topology documents**

This guide explains how to test DANL implementations (Scheme, Prolog, Datalog) and validate that documentation follows the epistemic topology structure.

## Overview

### Testing Levels

1. **Unit Tests** - Test individual functions/predicates
2. **Integration Tests** - Test components working together
3. **Validation Tests** - Validate document structure
4. **Consistency Tests** - Check cross-references

## Testing Scheme Code

### Basic Testing

**Test vector clock operations**:
```scheme
;; Test vector clock creation
(define test-vector-clock
  (lambda ()
    (let ((v (make-vector-clock 3)))
      (assert (= (vector-ref v 0) 0))
      (assert (= (vector-ref v 1) 0))
      (assert (= (vector-ref v 2) 0)))))

;; Test vector clock tick
(define test-vector-clock-tick
  (lambda ()
    (let ((v (make-vector-clock 3)))
      (vector-clock-tick v 0)
      (assert (= (vector-ref v 0) 1))
      (assert (= (vector-ref v 1) 0)))))
```

### Testing Max-Plus Operations

**Test Max-Plus matrix multiplication**:
```scheme
;; Test Max-Plus matrix multiplication
(define test-max-plus-multiply
  (lambda ()
    (let ((A '((0 -inf.0 -inf.0)
               (0 0 -inf.0)
               (-inf.0 -inf.0 0)))
          (x '(1 2 3)))
      (let ((result (max-plus-multiply A x)))
        (assert (= (car result) 1))
        (assert (= (cadr result) 2))
        (assert (= (caddr result) 3))))))
```

### Testing Consensus

**Test geometric consensus**:
```scheme
;; Test consensus check
(define test-consensus
  (lambda ()
    (let ((participants '(alice bob carol))
          (proposal 'upgrade-system)
          (geometry 'tetrahedron))
      (assert (check-consensus participants proposal geometry)))))
```

## Testing Prolog Rules

### Running Prolog Tests

**Load module and run tests**:
```prolog
:- use_module(danl_rules).

% Run test suite
:- run_tests.
```

### Test Epistemic States

**Test epistemic state queries**:
```prolog
% Test epistemic state
test_epistemic :-
    write('=== Testing Epistemic States ===\n'),
    epistemic_state(alice, KK, KU, UK, UU),
    format('Alice: KK=~w, KU=~w, UK=~w, UU=~w\n', [KK, KU, UK, UU]),
    assert(KK > 0),
    assert(KU >= 0),
    assert(UK >= 0),
    assert(UU >= 0).
```

### Test Observable Parameters

**Test observable parameterization**:
```prolog
% Test observable params
test_observable :-
    write('=== Testing Observable Parameterization ===\n'),
    Vertices = 12,
    observable_params(alice, Vertices, KKObs, KUObs, TauUK, TauUU),
    format('V=~w: KK=~w, KU=~w, τ_UK=~w, τ_UU=~w\n', 
           [Vertices, KKObs, KUObs, TauUK, TauUU]),
    assert(TauUK > 0),
    assert(TauUU > 0).
```

### Test Consensus

**Test consensus rules**:
```prolog
% Test consensus
test_consensus :-
    write('=== Testing Consensus ===\n'),
    network_consensus([alice, bob, carol], proposal1, tetrahedron, Result),
    format('Consensus result: ~w\n', [Result]),
    assert(Result = consensus(_, _, _) ; Result = no_consensus(_, _, _)).
```

### Test Causality

**Test causal ordering**:
```prolog
% Test causality
test_causality :-
    write('=== Testing Causality ===\n'),
    happens_before(e1, e3),
    write('e1 happens before e3: true\n'),
    causal_history(e3, History),
    format('Causal history of e3: ~w\n', [History]),
    assert(member(e1, History)).
```

## Testing Datalog Queries

### Running Datalog Queries

**Load facts and run queries**:
```datalog
// Load facts
event("e1", "node1", 1000, "vc1").
event("e2", "node2", 1005, "vc2").
event("e3", "node3", 1010, "vc3").

// Query
.output happens_before
```

### Test Causal Ordering

**Test happens-before queries**:
```datalog
// Test: e1 should happen before e2
happens_before("e1", "e2")?

// Expected: happens_before("e1", "e2").
```

### Test Concurrent Events

**Test concurrent events**:
```datalog
// Test: e1 and e3 should be concurrent
concurrent("e1", "e3")?

// Expected: concurrent("e1", "e3").
```

### Test Consensus

**Test consensus queries**:
```datalog
// Test: Check consensus result
consensus_result("prop1", Agreeing, Total, Achieved)?

// Expected: consensus_result("prop1", 3, 4, "yes").
```

## Document Validation

### Using Validation Tool

**Run validator**:
```bash
node tools/validate-epistemic-topology.js docs/
```

**Output**:
```
Epistemic Topology Validator

Scanning directory: docs/

Found 18 markdown files

SUMMARY
  Total nodes: 18
  Errors: 0
  Warnings: 2
  Suggestions: 1
```

### Validation Checks

**Front matter validation**:
- ✅ Required fields present (id, title, level, type, tags, keywords, prerequisites, enables)
- ✅ Valid level values (gateway, foundational, practical, applied)
- ✅ Valid type values (navigation, concept, implementation, application, guide)
- ✅ Arrays are arrays (tags, keywords, prerequisites, enables)

**Relationship validation**:
- ✅ Prerequisites exist
- ✅ Enabled documents exist (warnings for future documents)
- ✅ Related documents exist
- ✅ No circular prerequisites

**Quality checks**:
- ✅ Reading time estimate present
- ✅ Difficulty rating present
- ✅ Difficulty appropriate for level

### Common Validation Errors

**Missing required field**:
```yaml
# Error: Missing required field "prerequisites"
---
id: my-doc
title: "My Document"
level: foundational
type: concept
tags: ["tag1"]
keywords: ["keyword1"]
# Missing: prerequisites, enables
---
```

**Fix**: Add missing fields:
```yaml
---
id: my-doc
title: "My Document"
level: foundational
type: concept
tags: ["tag1"]
keywords: ["keyword1"]
prerequisites: ["other-doc"]
enables: ["another-doc"]
---
```

**Invalid level**:
```yaml
# Error: Invalid level "foundation"
level: foundation  # Should be "foundational"
```

**Fix**: Use correct level:
```yaml
level: foundational
```

## Consistency Testing

### Cross-Reference Validation

**Check prerequisites**:
```bash
# Validate all prerequisites exist
grep -r "prerequisites:" docs/ | grep -v "\[\]" | while read line; do
    # Extract prerequisites and check they exist
done
```

**Check enables**:
```bash
# Validate all enables exist
grep -r "enables:" docs/ | grep -v "\[\]" | while read line; do
    # Extract enables and check they exist
done
```

### Link Validation

**Check markdown links**:
```bash
# Find all markdown links
grep -r "\[.*\](.*\.md)" docs/ | \
    sed 's/.*\[.*\](\(.*\.md\)).*/\1/' | \
    while read link; do
        if [ ! -f "docs/$link" ]; then
            echo "Broken link: $link"
        fi
    done
```

## Integration Testing

### End-to-End Test

**Test complete workflow**:
```scheme
;; 1. Create epistemic state
(let ((state (make-epistemic 100 50 30 20)))
  
  ;; 2. Calculate observable parameters
  (let ((obs (epistemic->observable state 12)))
    
    ;; 3. Calculate certainty
    (let ((certainty (calculate-certainty obs)))
      
      ;; 4. Select geometry
      (let ((geometry (select-geometry certainty 12)))
        
        ;; 5. Check consensus
        (check-consensus participants proposal geometry)))))
```

## Performance Testing

### Benchmark Queries

**Time Prolog queries**:
```prolog
% Time consensus query
time(network_consensus([alice, bob, carol], proposal1, tetrahedron, Result)).
```

**Time Datalog queries**:
```datalog
// Time causal ancestor query
.decl timed_query(event: symbol)
timed_query(E) :-
    causal_ancestor("e3", E).
```

## Best Practices

### Test Organization

1. **Separate test files**: Create `tests/` directory
2. **Test naming**: Use `test_` prefix
3. **Test documentation**: Document what each test validates
4. **Test isolation**: Each test should be independent

### Test Coverage

1. **Happy path**: Test normal operation
2. **Error cases**: Test error handling
3. **Edge cases**: Test boundary conditions
4. **Integration**: Test component interactions

### Continuous Testing

1. **Run tests frequently**: Test after each change
2. **Automate**: Use CI/CD for automated testing
3. **Monitor**: Track test results over time

## Next Steps

- **Learn about tools**: [Validation Tools](validation-tools.md) - Tools for validation
- **See examples**: [Quick Start](quick-start.md) - Example usage
- **Check API**: [Prolog API](prolog-api.md) - API reference

## Related Resources

- [Validation Tools](validation-tools.md) - Validation tool documentation
- [Quick Start](quick-start.md) - Getting started guide
- [Prolog API](prolog-api.md) - Prolog API reference
