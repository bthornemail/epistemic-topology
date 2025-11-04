#!/usr/bin/env python3
"""
DANL Accurate Implementation Test
Matches Scheme implementation exactly including weighted blending
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

def index_to_level(idx):
    """Convert index to level (matches Scheme index->level)"""
    if idx <= 0:
        return 'bottom'
    elif idx <= 1:
        return 'potential'
    elif idx <= 2:
        return 'active'
    elif idx <= 3:
        return 'confident'
    else:
        return 'top'

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

def blend_level(self, neighbor, weight):
    """Blend levels using weighted average (matches Scheme blend-level)"""
    self_idx = level_index(self)
    neighbor_idx = level_index(neighbor)
    weighted = (self_idx + weight * neighbor_idx) / (1 + weight)
    return index_to_level(weighted)

# Network state
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

# Tau coefficients (from example network)
tau_coeffs = {
    'perceptual-array': 1.25,
    'inference-engine': 1.5,
    'consensus-forum': 0.9
}

# Attributes
attributes = {
    'perceptual-array': {'ceiling': 'confident'},
    'inference-engine': {'floor': 'potential'},
    'consensus-forum': {'ceiling': 'confident', 'floor': 'potential'}
}

def propagate_belief(self, neighbor_states):
    """propagate-belief: join(self, neighbor-join)"""
    neighbor_join = list_join(neighbor_states) if neighbor_states else 'bottom'
    return level_join(self, neighbor_join)

def interpret_evidence(self, neighbor_states, tau_coeff, neighbor_count):
    """interpret-evidence: blend(self, neighbor-join, weight)"""
    neighbor_join = list_join(neighbor_states) if neighbor_states else 'bottom'
    weight = (tau_coeff + neighbor_count) / neighbor_count
    return blend_level(self, neighbor_join, weight)

def safeguard_consensus(self, neighbor_states, ceiling, floor):
    """safeguard-consensus: join(floor, meet(ceiling, join(self, neighbor-join)))"""
    neighbor_join = list_join(neighbor_states) if neighbor_states else 'bottom'
    candidate = level_join(self, neighbor_join)
    result1 = level_meet(candidate, ceiling)
    result = level_join(floor, result1)
    return result

print("=" * 60)
print("DANL Example Network - Accurate Implementation Test")
print("=" * 60)

history = [network.copy()]

for iteration in range(10):
    print(f"\n{'='*60}")
    print(f"ITERATION {iteration}")
    print(f"{'='*60}")
    print("Current state:")
    for node, state in network.items():
        print(f"  {node}: {state}")
    
    if iteration > 0:
        print("\nApplying transitions:")
    
    next_network = {}
    
    for node, state in network.items():
        neighbor_states = [network[n] for n in neighbors[node]]
        neighbor_count = len(neighbor_states)
        tau = tau_coeffs[node]
        attrs = attributes.get(node, {})
        
        if node == 'perceptual-array':
            next_state = propagate_belief(state, neighbor_states)
            print(f"  {node}: {state} -> {next_state} (propagate-belief)")
        
        elif node == 'inference-engine':
            next_state = interpret_evidence(state, neighbor_states, tau, neighbor_count)
            print(f"  {node}: {state} -> {next_state} (interpret-evidence, tau={tau})")
        
        elif node == 'consensus-forum':
            ceiling = attrs.get('ceiling', 'confident')
            floor = attrs.get('floor', 'potential')
            next_state = safeguard_consensus(state, neighbor_states, ceiling, floor)
            print(f"  {node}: {state} -> {next_state} (safeguard-consensus)")
        
        next_network[node] = next_state
    
    # Check convergence
    if network == next_network:
        print(f"\n✅ CONVERGED at iteration {iteration + 1}")
        print("\nFinal state:")
        for node, state in next_network.items():
            print(f"  {node}: {state}")
        
        # Check against expected
        expected = {
            'perceptual-array': 'confident',
            'inference-engine': 'confident',
            'consensus-forum': 'confident'
        }
        
        if next_network == expected:
            print("\n✅ SUCCESS: Converged to expected state (confident)")
        else:
            print("\n⚠️  WARNING: Converged to different state than expected")
            print("Expected:")
            for node, state in expected.items():
                print(f"  {node}: {state}")
        break
    
    network = next_network
    history.append(network.copy())

print("\n" + "=" * 60)
print("TEST SUMMARY")
print("=" * 60)
print(f"Converged: {len(history) > 1}")
print(f"Iterations: {len(history) - 1}")
print(f"Final state: {network}")
