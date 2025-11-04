#!/usr/bin/env python3
"""
DANL Detailed Validation Tests
Simulates network behavior and validates convergence logic
"""

import json
import sys

# Lattice level indices (from spec)
LEVEL_INDICES = {
    'bottom': 0,
    'potential': 1,
    'active': 2,
    'confident': 3,
    'top': 4
}

def level_index(level):
    """Get index for a level"""
    return LEVEL_INDICES.get(level, -1)

def level_join(a, b):
    """Join operation: max(a, b)"""
    idx_a = level_index(a)
    idx_b = level_index(b)
    if idx_a >= idx_b:
        return a
    return b

def level_meet(a, b):
    """Meet operation: min(a, b)"""
    idx_a = level_index(a)
    idx_b = level_index(b)
    if idx_a <= idx_b:
        return a
    return b

def list_join(levels):
    """Fold-left join"""
    if not levels:
        return 'bottom'
    result = levels[0]
    for level in levels[1:]:
        result = level_join(result, level)
    return result

def list_meet(levels):
    """Fold-left meet"""
    if not levels:
        return 'top'
    result = levels[0]
    for level in levels[1:]:
        result = level_meet(result, level)
    return result

def propagate_belief(self, neighbors):
    """propagate-belief transition"""
    neighbor_join = list_join(neighbors) if neighbors else 'bottom'
    return level_join(self, neighbor_join)

def interpret_evidence(self, neighbors, tau_coeff=1.5):
    """interpret-evidence transition (simplified - uses join)"""
    neighbor_join = list_join(neighbors) if neighbors else 'bottom'
    # Simplified: actual implementation uses weighted blending
    return level_join(self, neighbor_join)

def safeguard_consensus(self, neighbors, ceiling='confident', floor='potential'):
    """safeguard-consensus transition"""
    neighbor_join = list_join(neighbors) if neighbors else 'bottom'
    candidate = level_join(self, neighbor_join)
    result = level_meet(candidate, ceiling)
    return level_join(floor, result)

def test_propagate_belief():
    """Test propagate-belief transition"""
    print("=" * 60)
    print("TEST: propagate-belief Transition")
    print("=" * 60)
    
    # Test cases
    test_cases = [
        ('potential', ['active'], 'active'),
        ('active', ['potential'], 'active'),
        ('active', ['active', 'confident'], 'confident'),
        ('bottom', ['top'], 'top'),
        ('confident', ['confident'], 'confident'),
    ]
    
    passed = 0
    failed = 0
    
    for self, neighbors, expected in test_cases:
        result = propagate_belief(self, neighbors)
        if result == expected:
            print(f"✅ PASS: {self} + {neighbors} -> {result}")
            passed += 1
        else:
            print(f"❌ FAIL: {self} + {neighbors} -> {result} (expected {expected})")
            failed += 1
    
    print(f"\nResult: {passed} passed, {failed} failed")
    return failed == 0

def test_interpret_evidence():
    """Test interpret-evidence transition"""
    print("\n" + "=" * 60)
    print("TEST: interpret-evidence Transition")
    print("=" * 60)
    
    # Test cases (simplified - actual uses weighted blending)
    test_cases = [
        ('active', ['potential'], 'active'),  # Should join
        ('active', ['active', 'confident'], 'confident'),
    ]
    
    passed = 0
    failed = 0
    
    for self, neighbors, expected in test_cases:
        result = interpret_evidence(self, neighbors)
        if result == expected:
            print(f"✅ PASS: {self} + {neighbors} -> {result}")
            passed += 1
        else:
            print(f"❌ FAIL: {self} + {neighbors} -> {result} (expected {expected})")
            failed += 1
    
    print(f"\nResult: {passed} passed, {failed} failed")
    return failed == 0

def test_safeguard_consensus():
    """Test safeguard-consensus transition"""
    print("\n" + "=" * 60)
    print("TEST: safeguard-consensus Transition")
    print("=" * 60)
    
    # Test cases
    test_cases = [
        ('potential', ['active'], 'confident', 'potential', 'active'),  # candidate=active, meet confident=active, join potential=active
        ('active', ['confident'], 'confident', 'potential', 'confident'),  # candidate=confident, meet confident=confident, join potential=confident
    ]
    
    passed = 0
    failed = 0
    
    for self, neighbors, ceiling, floor, expected in test_cases:
        result = safeguard_consensus(self, neighbors, ceiling, floor)
        if result == expected:
            print(f"✅ PASS: {self} + {neighbors} (ceiling={ceiling}, floor={floor}) -> {result}")
            passed += 1
        else:
            print(f"❌ FAIL: {self} + {neighbors} -> {result} (expected {expected})")
            failed += 1
    
    print(f"\nResult: {passed} passed, {failed} failed")
    return failed == 0

def test_example_network_convergence():
    """Test example network convergence"""
    print("\n" + "=" * 60)
    print("TEST: Example Network Convergence")
    print("=" * 60)
    
    # Initial state
    network = {
        'perceptual-array': 'potential',
        'inference-engine': 'active',
        'consensus-forum': 'potential'
    }
    
    # Neighbor relationships
    neighbors = {
        'perceptual-array': ['inference-engine'],
        'inference-engine': ['perceptual-array', 'consensus-forum'],
        'consensus-forum': ['inference-engine']
    }
    
    print("\nInitial state:")
    for node, state in network.items():
        print(f"  {node}: {state}")
    
    # Transition functions
    transitions = {
        'perceptual-array': lambda self, nbs: propagate_belief(self, nbs),
        'inference-engine': lambda self, nbs: interpret_evidence(self, nbs),
        'consensus-forum': lambda self, nbs: safeguard_consensus(self, nbs, 'confident', 'potential')
    }
    
    max_iterations = 10
    history = [network.copy()]
    
    for iteration in range(max_iterations):
        next_network = {}
        
        for node, state in network.items():
            # Get neighbor states
            neighbor_states = [network[n] for n in neighbors[node]]
            
            # Apply transition
            transition = transitions[node]
            next_state = transition(state, neighbor_states)
            next_network[node] = next_state
        
        # Check for convergence
        if network == next_network:
            print(f"\n✅ CONVERGED at iteration {iteration + 1}")
            print(f"Final state:")
            for node, state in next_network.items():
                print(f"  {node}: {state}")
            break
        
        network = next_network
        history.append(network.copy())
        
        print(f"\nIteration {iteration + 1}:")
        for node, state in network.items():
            print(f"  {node}: {state}")
    else:
        print(f"\n❌ FAIL: Did not converge after {max_iterations} iterations")
        return False
    
    # Verify monotonicity
    print("\n" + "=" * 60)
    print("TEST: Monotonicity Verification")
    print("=" * 60)
    
    is_monotonic = True
    for i in range(1, len(history)):
        prev = history[i-1]
        curr = history[i]
        
        for node in prev:
            prev_idx = level_index(prev[node])
            curr_idx = level_index(curr[node])
            
            if curr_idx < prev_idx:
                print(f"❌ FAIL: Non-monotonic: {node} {prev[node]} -> {curr[node]}")
                is_monotonic = False
    
    if is_monotonic:
        print("✅ PASS: Network is monotonic (states only increase)")
    
    return is_monotonic

def test_lattice_properties():
    """Test lattice properties"""
    print("\n" + "=" * 60)
    print("TEST: Lattice Properties")
    print("=" * 60)
    
    levels = ['bottom', 'potential', 'active', 'confident', 'top']
    
    # Test idempotency
    passed = True
    for level in levels:
        if level_join(level, level) != level:
            print(f"❌ FAIL: Join not idempotent for {level}")
            passed = False
        if level_meet(level, level) != level:
            print(f"❌ FAIL: Meet not idempotent for {level}")
            passed = False
    
    if passed:
        print("✅ PASS: Join and meet are idempotent")
    
    # Test commutativity
    passed = True
    for i, a in enumerate(levels):
        for b in levels[i+1:]:
            if level_join(a, b) != level_join(b, a):
                print(f"❌ FAIL: Join not commutative: {a} ∨ {b} != {b} ∨ {a}")
                passed = False
            if level_meet(a, b) != level_meet(b, a):
                print(f"❌ FAIL: Meet not commutative: {a} ∧ {b} != {b} ∧ {a}")
                passed = False
    
    if passed:
        print("✅ PASS: Join and meet are commutative")
    
    # Test associativity
    passed = True
    for a in levels:
        for b in levels:
            for c in levels:
                left_join = level_join(level_join(a, b), c)
                right_join = level_join(a, level_join(b, c))
                if left_join != right_join:
                    print(f"❌ FAIL: Join not associative: ({a} ∨ {b}) ∨ {c} != {a} ∨ ({b} ∨ {c})")
                    passed = False
                
                left_meet = level_meet(level_meet(a, b), c)
                right_meet = level_meet(a, level_meet(b, c))
                if left_meet != right_meet:
                    print(f"❌ FAIL: Meet not associative: ({a} ∧ {b}) ∧ {c} != {a} ∧ ({b} ∧ {c})")
                    passed = False
    
    if passed:
        print("✅ PASS: Join and meet are associative")
    
    return passed

def main():
    """Run all validation tests"""
    print("\n" + "=" * 60)
    print("DANL Detailed Validation Test Suite")
    print("=" * 60)
    
    tests = [
        test_lattice_properties,
        test_propagate_belief,
        test_interpret_evidence,
        test_safeguard_consensus,
        test_example_network_convergence,
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ FAIL: Test crashed: {e}")
            import traceback
            traceback.print_exc()
            results.append(False)
    
    # Summary
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("✅ ALL VALIDATION TESTS PASSED")
        return 0
    else:
        print(f"❌ {total - passed} VALIDATION TEST(S) FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())
