#!/usr/bin/env python3
"""
DANL Convergence Debugger
Traces through the example network step-by-step to understand convergence
"""

LEVEL_INDICES = {
    'bottom': 0,
    'potential': 1,
    'active': 2,
    'confident': 3,
    'top': 4
}

def level_index(level):
    return LEVEL_INDICES.get(level, -1)

def level_join(a, b):
    idx_a = level_index(a)
    idx_b = level_index(b)
    return a if idx_a >= idx_b else b

def level_meet(a, b):
    idx_a = level_index(a)
    idx_b = level_index(b)
    return a if idx_a <= idx_b else b

def list_join(levels):
    if not levels:
        return 'bottom'
    result = levels[0]
    for level in levels[1:]:
        result = level_join(result, level)
    return result

def propagate_belief(self, neighbors):
    neighbor_join = list_join(neighbors) if neighbors else 'bottom'
    result = level_join(self, neighbor_join)
    print(f"    propagate-belief: {self} ∨ {neighbor_join} = {result}")
    return result

def interpret_evidence(self, neighbors, tau_coeff=1.5):
    neighbor_join = list_join(neighbors) if neighbors else 'bottom'
    # Simplified: actual uses weighted blending, but for convergence test we use join
    result = level_join(self, neighbor_join)
    print(f"    interpret-evidence: {self} ∨ {neighbor_join} = {result}")
    return result

def safeguard_consensus(self, neighbors, ceiling='confident', floor='potential'):
    neighbor_join = list_join(neighbors) if neighbors else 'bottom'
    candidate = level_join(self, neighbor_join)
    print(f"    safeguard-consensus step 1: {self} ∨ {neighbor_join} = {candidate}")
    result1 = level_meet(candidate, ceiling)
    print(f"    safeguard-consensus step 2: {candidate} ∧ {ceiling} = {result1}")
    result = level_join(floor, result1)
    print(f"    safeguard-consensus step 3: {floor} ∨ {result1} = {result}")
    return result

print("=" * 60)
print("DANL Example Network Convergence Trace")
print("=" * 60)

network = {
    'perceptual-array': 'potential',
    'inference-engine': 'active',
    'consensus-forum': 'potential'
}

neighbors = {
    'perceptual-array': ['inference-engine'],
    'inference-engine': ['perceptual-array', 'consensus-forum'],
    'consensus-forum': ['inference-engine']
}

transitions = {
    'perceptual-array': lambda self, nbs: propagate_belief(self, nbs),
    'inference-engine': lambda self, nbs: interpret_evidence(self, nbs),
    'consensus-forum': lambda self, nbs: safeguard_consensus(self, nbs, 'confident', 'potential')
}

for iteration in range(5):
    print(f"\n{'='*60}")
    print(f"ITERATION {iteration}")
    print(f"{'='*60}")
    print(f"Current state:")
    for node, state in network.items():
        print(f"  {node}: {state}")
    
    if iteration > 0:
        print(f"\nTransitions:")
    
    next_network = {}
    for node, state in network.items():
        neighbor_states = [network[n] for n in neighbors[node]]
        print(f"\n  {node}:")
        print(f"    Current: {state}")
        print(f"    Neighbors: {neighbor_states}")
        transition = transitions[node]
        next_state = transition(state, neighbor_states)
        next_network[node] = next_state
    
    if network == next_network:
        print(f"\n✅ CONVERGED at iteration {iteration}")
        break
    
    network = next_network

print("\n" + "=" * 60)
print("ANALYSIS")
print("=" * 60)
print("\nExpected final state: confident (all nodes)")
print("Actual final state: active (all nodes)")
print("\nThis suggests:")
print("1. The ceiling constraint may be preventing confident")
print("2. Or the transition logic needs adjustment")
print("3. Or the initial conditions need different tau coefficients")
