---
id: ha-patterns
title: "High Availability Patterns"
level: applied
type: application
tags: ["high-availability", "fault-tolerance", "consensus", "geometric"]
keywords: ["ha", "availability", "fault-tolerance", "consensus", "redundancy"]
prerequisites: ["geometric-consensus", "platonic-solids", "production-architecture"]
enables: ["disaster-recovery", "monitoring"]
related: ["scaling", "case-study-consensus"]
readingTime: 35
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# High Availability Patterns

> **Achieving high availability through geometric consensus and fault tolerance**

DANL provides high availability through geometric consensus patterns that ensure system operation even when nodes fail. This document explains how to design HA systems using Platonic solid-based consensus and fault tolerance.

## Principles of High Availability

### Core HA Principles

1. **No Single Point of Failure** - Every component has redundancy
2. **Geometric Consensus** - Thresholds adapt to failures
3. **Automatic Failover** - System continues with fewer nodes
4. **State Recovery** - Complete state reconstruction from events
5. **Progressive Degradation** - System degrades gracefully

## Fault Tolerance by Geometry

### Fault Tolerance Levels

| Geometry | Nodes | Threshold | Survives Failures | Use Case |
|----------|-------|-----------|-------------------|----------|
| **Tetrahedron** | 4 | 75% (3/4) | 1 failure | Local clusters |
| **Cube** | 8 | 50% (4/8) | 3 failures | Regional clusters |
| **Icosahedron** | 12 | 25% (3/12) | 7 failures | Global clusters |
| **Dodecahedron** | 20 | 25% (5/20) | 10 failures | Large clusters |
| **600-cell** | 120 | 2.5% (3/120) | 117 failures | Very large clusters |

### Selecting Geometry for HA

**Algorithm**: Select geometry based on required fault tolerance:

```python
def select_geometry_for_ha(required_fault_tolerance, total_nodes):
    """Select geometry that provides required fault tolerance"""
    if required_fault_tolerance == 1 and total_nodes <= 4:
        return 'tetrahedron'  # 1 failure tolerance
    elif required_fault_tolerance <= 3 and total_nodes <= 8:
        return 'cube'  # 3 failures tolerance
    elif required_fault_tolerance <= 7 and total_nodes <= 12:
        return 'icosahedron'  # 7 failures tolerance
    elif required_fault_tolerance <= 10 and total_nodes <= 20:
        return 'dodecahedron'  # 10 failures tolerance
    else:
        return '600-cell'  # Up to 117 failures
```

## Redundancy Patterns

### N+1 Redundancy

**Pattern**: Always have one extra node beyond minimum

**Example**:
```yaml
# Tetrahedron: Need 3/4, deploy 5 nodes (N+1)
geometry: tetrahedron
minimum_nodes: 3
deployed_nodes: 5
fault_tolerance: 2  # Can lose 2 nodes
```

### N+2 Redundancy

**Pattern**: Extra redundancy for critical systems

**Example**:
```yaml
# Cube: Need 4/8, deploy 10 nodes (N+2)
geometry: cube
minimum_nodes: 4
deployed_nodes: 10
fault_tolerance: 6  # Can lose 6 nodes
```

### Geographic Distribution

**Pattern**: Distribute nodes across regions

**Example**:
```yaml
regions:
  - name: us-east
    nodes: 3
    geometry: tetrahedron
  - name: us-west
    nodes: 3
    geometry: tetrahedron
  - name: eu-west
    nodes: 3
    geometry: tetrahedron
global_consensus: cube  # 3 regions = 9 nodes total
```

## Failure Detection

### Health Checks

**Implementation**:
```scheme
;; Health check endpoint
(define (health-check node-id)
  (let ((last-heartbeat (get-last-heartbeat node-id))
        (current-time (current-milliseconds)))
    (if (< (- current-time last-heartbeat) 5000)  ; 5 second timeout
        'healthy
        'unhealthy)))
```

### Consensus-Based Detection

**Pattern**: Use consensus to detect failures

**Implementation**:
```python
def detect_failures(nodes, consensus_geometry):
    """Detect failed nodes via consensus"""
    threshold = get_threshold(consensus_geometry)
    responding_nodes = [n for n in nodes if n.is_healthy()]
    
    if len(responding_nodes) < threshold * len(nodes):
        # Not enough nodes for consensus
        return {"status": "degraded", "failed": len(nodes) - len(responding_nodes)}
    else:
        # Still have consensus
        return {"status": "healthy", "failed": len(nodes) - len(responding_nodes)}
```

## Automatic Failover

### Node Replacement

**Pattern**: Automatically replace failed nodes

**Implementation**:
```python
def automatic_failover(cluster_config):
    """Replace failed nodes automatically"""
    current_nodes = get_active_nodes()
    failed_nodes = detect_failures(current_nodes)
    
    if failed_nodes:
        # Scale up to replace failed nodes
        scale_up(count=len(failed_nodes))
        
        # Update consensus geometry if needed
        new_total = len(current_nodes) + len(failed_nodes)
        geometry = select_geometry_for_ha(new_total)
        update_consensus_geometry(geometry)
```

### Geometry Downgrade

**Pattern**: Downgrade geometry when nodes fail

**Example**:
```python
# Start with cube (8 nodes)
geometry = 'cube'
nodes = 8

# 3 nodes fail → downgrade to tetrahedron (4 nodes)
if len(active_nodes) < 8:
    geometry = 'tetrahedron'
    threshold = 0.75  # 3/4 instead of 4/8
```

## State Recovery

### Event Store Replay

**Pattern**: Recover state from event store

**Implementation**:
```scheme
;; Replay events to recover state
(define (recover-state-from-events node-id)
  (let ((events (get-events-since-snapshot node-id)))
    (fold (lambda (event state)
            (apply-event event state))
          initial-state
          events)))
```

### Snapshot Restoration

**Pattern**: Restore from snapshots for faster recovery

**Implementation**:
```python
def restore_from_snapshot(node_id, snapshot_time):
    """Restore state from snapshot"""
    snapshot = load_snapshot(node_id, snapshot_time)
    events = get_events_since(snapshot_time)
    
    # Replay events since snapshot
    state = snapshot.state
    for event in events:
        state = apply_event(state, event)
    
    return state
```

## Consensus Recovery

### Quorum Recovery

**Pattern**: Recover consensus after partition

**Implementation**:
```python
def recover_consensus(partition1, partition2):
    """Merge consensus after partition"""
    # Each partition reached consensus independently
    consensus1 = get_consensus(partition1)
    consensus2 = get_consensus(partition2)
    
    # Merge using lattice join
    merged = lattice_join(consensus1.state, consensus2.state)
    
    # Verify merged state
    if verify_consensus(merged):
        return merged
    else:
        # Conflict resolution needed
        return resolve_conflict(consensus1, consensus2)
```

### Conflict Resolution

**Pattern**: Resolve conflicts after partition merge

**Implementation**:
```python
def resolve_conflict(consensus1, consensus2):
    """Resolve conflicting consensus"""
    # Use vector clocks to determine ordering
    if vector_clock_before(consensus1.vclock, consensus2.vclock):
        return consensus1  # consensus1 happened first
    elif vector_clock_before(consensus2.vclock, consensus1.vclock):
        return consensus2  # consensus2 happened first
    else:
        # Concurrent - use lattice join
        return lattice_join(consensus1.state, consensus2.state)
```

## Progressive Degradation

### Service Levels

**Pattern**: Degrade gracefully as nodes fail

**Service Levels**:
```yaml
service_levels:
  - level: full
    nodes_required: 8
    geometry: cube
    features: [all]
  
  - level: degraded
    nodes_required: 4
    geometry: tetrahedron
    features: [essential]
  
  - level: minimal
    nodes_required: 3
    geometry: tetrahedron
    features: [read-only]
```

### Feature Gating

**Implementation**:
```python
def check_feature_availability(feature, active_nodes):
    """Check if feature available with current nodes"""
    geometry = select_geometry(len(active_nodes))
    
    if geometry == 'cube':
        return feature in ['read', 'write', 'consensus']
    elif geometry == 'tetrahedron':
        return feature in ['read', 'consensus']
    else:
        return feature in ['read']  # Minimal mode
```

## Monitoring for HA

### Key Metrics

**Metrics to monitor**:
- Node health status
- Consensus quorum status
- Failover events
- Recovery time
- Service availability

**Implementation**:
```python
metrics = {
    'nodes_active': len(active_nodes),
    'nodes_total': len(all_nodes),
    'consensus_quorum': get_quorum_status(),
    'failover_count': get_failover_count(),
    'recovery_time': get_recovery_time(),
    'availability': calculate_availability()
}
```

### Alerting Rules

**Critical alerts**:
```yaml
alerts:
  - name: quorum_lost
    condition: active_nodes < threshold * total_nodes
    severity: critical
    action: trigger_failover
  
  - name: node_failure
    condition: failed_nodes > 0
    severity: warning
    action: notify_ops
  
  - name: degraded_mode
    condition: geometry_downgraded == true
    severity: warning
    action: notify_ops
```

## Deployment Patterns

### Active-Active

**Pattern**: All nodes active, load balanced

**Example**:
```yaml
deployment:
  pattern: active-active
  nodes: 8
  geometry: cube
  load_balancer: round-robin
  health_checks: enabled
```

### Active-Passive

**Pattern**: Active nodes with passive backups

**Example**:
```yaml
deployment:
  pattern: active-passive
  active_nodes: 4
  passive_nodes: 4
  geometry: tetrahedron
  failover: automatic
```

### Multi-Region

**Pattern**: Nodes across multiple regions

**Example**:
```yaml
deployment:
  pattern: multi-region
  regions:
    - name: primary
      nodes: 4
      geometry: tetrahedron
    - name: secondary
      nodes: 4
      geometry: tetrahedron
  global_consensus: cube
```

## Best Practices

### Design Principles

1. **Plan for failures** - Design assuming nodes will fail
2. **Test failure scenarios** - Chaos engineering
3. **Monitor proactively** - Detect issues before they cause outages
4. **Automate recovery** - Reduce manual intervention
5. **Document procedures** - Runbooks for common failures

### Testing Strategies

1. **Chaos testing** - Randomly kill nodes
2. **Network partition testing** - Split network
3. **Load testing** - Test under failure conditions
4. **Recovery testing** - Verify recovery procedures

## Next Steps

- **Learn about scaling**: [Scaling](scaling.md) - Scale systems efficiently
- **See case study**: [Case Study: Consensus](case-study-consensus.md) - Real-world HA
- **Understand monitoring**: [Monitoring](monitoring.md) - Monitor HA systems

## Related Resources

- [Geometric Consensus](geometric-consensus.md) - Consensus theory
- [Platonic Solids](platonic-solids.md) - Geometry details
- [Production Architecture](production-architecture.md) - Architecture patterns
