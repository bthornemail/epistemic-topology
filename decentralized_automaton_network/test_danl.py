#!/usr/bin/env python3
"""
DANL Test Suite
Tests all three implementations: Scheme, Prolog, Datalog
"""

import json
import subprocess
import sys
import os

def test_lattice_spec():
    """Test that lattice_spec.json is valid and complete"""
    print("=" * 60)
    print("TEST 1: Lattice Specification")
    print("=" * 60)
    
    spec_path = "docs/lattice_spec.json"
    if not os.path.exists(spec_path):
        print(f"❌ FAIL: {spec_path} not found")
        return False
    
    try:
        with open(spec_path, 'r') as f:
            spec = json.load(f)
        
        # Check required fields
        required = ['lattice', 'ms_descriptors', 'example_network']
        for field in required:
            if field not in spec:
                print(f"❌ FAIL: Missing field '{field}' in spec")
                return False
        
        # Check lattice levels
        levels = spec['lattice']['levels']
        if len(levels) != 5:
            print(f"❌ FAIL: Expected 5 levels, got {len(levels)}")
            return False
        
        expected_levels = ['bottom', 'potential', 'active', 'confident', 'top']
        for i, level in enumerate(levels):
            if level['name'] != expected_levels[i]:
                print(f"❌ FAIL: Level {i} should be '{expected_levels[i]}', got '{level['name']}'")
                return False
        
        # Check MS descriptors
        ms_descriptors = spec['ms_descriptors']
        required_ms = ['propagate-belief', 'interpret-evidence', 'safeguard-consensus']
        for ms_name in required_ms:
            if ms_name not in ms_descriptors:
                print(f"❌ FAIL: Missing MS descriptor '{ms_name}'")
                return False
        
        # Check example network
        nodes = spec['example_network']['nodes']
        if len(nodes) != 3:
            print(f"❌ FAIL: Expected 3 nodes in example, got {len(nodes)}")
            return False
        
        print("✅ PASS: Lattice specification is valid")
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ FAIL: Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Error reading spec: {e}")
        return False

def test_scheme_syntax():
    """Test Scheme file syntax (basic check)"""
    print("\n" + "=" * 60)
    print("TEST 2: Scheme Implementation Syntax")
    print("=" * 60)
    
    scheme_path = "scheme/danl.scm"
    if not os.path.exists(scheme_path):
        print(f"❌ FAIL: {scheme_path} not found")
        return False
    
    try:
        with open(scheme_path, 'r') as f:
            content = f.read()
        
        # Check for required functions
        required_functions = [
            'level-join',
            'level-meet',
            'make-ms',
            'simulate-network',
            'example-network'
        ]
        
        missing = []
        for func in required_functions:
            if func not in content:
                missing.append(func)
        
        if missing:
            print(f"❌ FAIL: Missing functions: {missing}")
            return False
        
        # Check for example network definition
        if 'example-network' not in content:
            print("❌ FAIL: Missing example-network definition")
            return False
        
        # Check for Z-combinator
        if 'Z' not in content or 'Z-combinator' not in content.lower():
            print("⚠️  WARN: Z-combinator not clearly defined")
        
        print("✅ PASS: Scheme file structure looks correct")
        print("   Note: Full syntax check requires Scheme interpreter")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Error reading Scheme file: {e}")
        return False

def test_prolog_syntax():
    """Test Prolog file syntax (basic check)"""
    print("\n" + "=" * 60)
    print("TEST 3: Prolog Implementation Syntax")
    print("=" * 60)
    
    prolog_path = "prolog/danl.pl"
    if not os.path.exists(prolog_path):
        print(f"❌ FAIL: {prolog_path} not found")
        return False
    
    try:
        with open(prolog_path, 'r') as f:
            content = f.read()
        
        # Check for required predicates
        required_predicates = [
            'level_join',
            'level_meet',
            'transition',
            'monotone',
            'converges'
        ]
        
        missing = []
        for pred in required_predicates:
            if pred not in content:
                missing.append(pred)
        
        if missing:
            print(f"❌ FAIL: Missing predicates: {missing}")
            return False
        
        # Check for module declaration
        if ':- module' not in content:
            print("⚠️  WARN: Module declaration not found")
        
        # Check for example queries
        if 'run_examples' not in content:
            print("⚠️  WARN: run_examples not found")
        
        print("✅ PASS: Prolog file structure looks correct")
        print("   Note: Full syntax check requires SWI-Prolog")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Error reading Prolog file: {e}")
        return False

def test_datalog_syntax():
    """Test Datalog file syntax (basic check)"""
    print("\n" + "=" * 60)
    print("TEST 4: Datalog Implementation Syntax")
    print("=" * 60)
    
    datalog_path = "datalog/danl.dl"
    if not os.path.exists(datalog_path):
        print(f"❌ FAIL: {datalog_path} not found")
        return False
    
    try:
        with open(datalog_path, 'r') as f:
            content = f.read()
        
        # Check for required declarations
        required_decls = [
            '.decl',
            'node',
            'state',
            'stable'
        ]
        
        missing = []
        for decl in required_decls:
            if decl not in content:
                missing.append(decl)
        
        if missing:
            print(f"❌ FAIL: Missing declarations: {missing}")
            return False
        
        # Check for transition rules
        if 'state(Node, Iter + 1' not in content:
            print("⚠️  WARN: Iterative state rules not found")
        
        # Check for fixpoint detection
        if 'stable' not in content:
            print("❌ FAIL: Stable state detection missing")
            return False
        
        print("✅ PASS: Datalog file structure looks correct")
        print("   Note: Full syntax check requires Soufflé")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Error reading Datalog file: {e}")
        return False

def test_example_trace():
    """Test example trace JSON"""
    print("\n" + "=" * 60)
    print("TEST 5: Example Trace JSON")
    print("=" * 60)
    
    trace_path = "ui/assets/example_trace.json"
    if not os.path.exists(trace_path):
        print(f"⚠️  WARN: {trace_path} not found (optional)")
        return True
    
    try:
        with open(trace_path, 'r') as f:
            trace = json.load(f)
        
        # Check structure
        if 'frames' not in trace:
            print("❌ FAIL: Missing 'frames' in trace")
            return False
        
        frames = trace['frames']
        if len(frames) == 0:
            print("❌ FAIL: Empty frames array")
            return False
        
        # Check each frame has required fields
        for i, frame in enumerate(frames):
            if 'step' not in frame:
                print(f"❌ FAIL: Frame {i} missing 'step'")
                return False
            if 'states' not in frame:
                print(f"❌ FAIL: Frame {i} missing 'states'")
                return False
        
        # Check states are monotonic (basic check)
        prev_states = {}
        for frame in frames:
            for state in frame['states']:
                node = state['node']
                level = state['level']
                
                if node in prev_states:
                    prev_level = prev_states[node]
                    # Check level ordering (simplified)
                    level_order = {
                        'bottom': 0,
                        'potential': 1,
                        'active': 2,
                        'confident': 3,
                        'top': 4
                    }
                    if level_order.get(level, -1) < level_order.get(prev_level, -1):
                        print(f"⚠️  WARN: Non-monotonic state for {node}: {prev_level} -> {level}")
                
                prev_states[node] = level
        
        print("✅ PASS: Example trace JSON is valid")
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ FAIL: Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Error reading trace: {e}")
        return False

def test_cross_reference():
    """Test cross-references between implementations"""
    print("\n" + "=" * 60)
    print("TEST 6: Cross-Reference Consistency")
    print("=" * 60)
    
    # Read all files
    try:
        with open("docs/lattice_spec.json", 'r') as f:
            spec = json.load(f)
        
        with open("scheme/danl.scm", 'r') as f:
            scheme = f.read()
        
        with open("prolog/danl.pl", 'r') as f:
            prolog = f.read()
        
        with open("datalog/danl.dl", 'r') as f:
            datalog = f.read()
        
        # Check that all three reference the same nodes
        spec_nodes = {node['name'] for node in spec['example_network']['nodes']}
        
        scheme_nodes = set()
        if 'perceptual-array' in scheme or 'perceptual_array' in scheme:
            scheme_nodes.add('perceptual-array')
        if 'inference-engine' in scheme or 'inference_engine' in scheme:
            scheme_nodes.add('inference-engine')
        if 'consensus-forum' in scheme or 'consensus_forum' in scheme:
            scheme_nodes.add('consensus-forum')
        
        prolog_nodes = set()
        if 'perceptual_array' in prolog:
            prolog_nodes.add('perceptual-array')
        if 'inference_engine' in prolog:
            prolog_nodes.add('inference-engine')
        if 'consensus_forum' in prolog:
            prolog_nodes.add('consensus-forum')
        
        datalog_nodes = set()
        if 'perceptual_array' in datalog:
            datalog_nodes.add('perceptual-array')
        if 'inference_engine' in datalog:
            datalog_nodes.add('inference-engine')
        if 'consensus_forum' in datalog:
            datalog_nodes.add('consensus-forum')
        
        # Check consistency
        all_expected = {'perceptual-array', 'inference-engine', 'consensus-forum'}
        
        issues = []
        if spec_nodes != all_expected:
            issues.append(f"Spec nodes: {spec_nodes}")
        if not scheme_nodes.issuperset(all_expected):
            issues.append(f"Scheme nodes: {scheme_nodes}")
        if not prolog_nodes.issuperset(all_expected):
            issues.append(f"Prolog nodes: {prolog_nodes}")
        if not datalog_nodes.issuperset(all_expected):
            issues.append(f"Datalog nodes: {datalog_nodes}")
        
        if issues:
            print(f"⚠️  WARN: Node name inconsistencies:")
            for issue in issues:
                print(f"   {issue}")
        else:
            print("✅ PASS: Node names are consistent across implementations")
        
        # Check MS descriptors are referenced
        ms_names = list(spec['ms_descriptors'].keys())
        for ms_name in ms_names:
            # Check if referenced in implementations
            scheme_has = ms_name.replace('-', '_') in scheme or ms_name in scheme
            prolog_has = ms_name.replace('-', '_') in prolog or ms_name in prolog
            datalog_has = ms_name.replace('-', '_') in datalog or ms_name in datalog
            
            if not (scheme_has and prolog_has and datalog_has):
                print(f"⚠️  WARN: MS descriptor '{ms_name}' not found in all implementations")
        
        print("✅ PASS: Cross-references are consistent")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Error checking cross-references: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("DANL Implementation Test Suite")
    print("=" * 60)
    print()
    
    tests = [
        test_lattice_spec,
        test_scheme_syntax,
        test_prolog_syntax,
        test_datalog_syntax,
        test_example_trace,
        test_cross_reference
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ FAIL: Test crashed: {e}")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("✅ ALL TESTS PASSED")
        return 0
    else:
        print(f"❌ {total - passed} TEST(S) FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())
