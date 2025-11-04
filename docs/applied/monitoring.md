---
id: monitoring
title: "Monitoring and Observability"
level: applied
type: application
tags: ["monitoring", "observability", "metrics", "logging", "tracing"]
keywords: ["monitoring", "metrics", "logging", "tracing", "observability", "alerting"]
prerequisites: ["production-architecture", "performance-tuning"]
enables: ["troubleshooting", "disaster-recovery"]
related: ["performance-optimization", "scaling"]
readingTime: 45
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Monitoring and Observability

> **Comprehensive monitoring strategy for DANL production systems**

Complete guide to monitoring DANL systems, including metrics, logging, tracing, alerting, and observability best practices.

## Monitoring Strategy

### Three Pillars of Observability

1. **Metrics** - Quantitative measurements over time
2. **Logs** - Discrete events with context
3. **Traces** - Request flows across services

### Monitoring Goals

**What to monitor**:
- System health and availability
- Performance metrics
- Consensus status
- Epistemic state changes
- Network topology
- Error rates and anomalies

## Metrics

### Core Metrics

**System Metrics**:
```python
system_metrics = {
    'nodes': {
        'total': len(all_nodes),
        'active': len(active_nodes),
        'failed': len(failed_nodes)
    },
    'consensus': {
        'proposals': proposal_count,
        'achieved': consensus_count,
        'failed': failed_count,
        'avg_time': avg_consensus_time
    },
    'epistemic': {
        'state_changes': state_change_count,
        'lattice_operations': lattice_op_count
    }
}
```

**Performance Metrics**:
```python
performance_metrics = {
    'latency': {
        'p50': percentile_latency(50),
        'p95': percentile_latency(95),
        'p99': percentile_latency(99)
    },
    'throughput': {
        'events_per_sec': events_per_second,
        'messages_per_sec': messages_per_second
    },
    'resource': {
        'cpu_usage': cpu_utilization,
        'memory_usage': memory_utilization,
        'network_io': network_io_rate
    }
}
```

### Prometheus Metrics

**Expose metrics**:
```python
from prometheus_client import Counter, Histogram, Gauge

# Counters
consensus_proposals = Counter('danl_consensus_proposals_total', 'Total consensus proposals')
consensus_achieved = Counter('danl_consensus_achieved_total', 'Total consensus achieved')

# Histograms
consensus_duration = Histogram('danl_consensus_duration_seconds', 'Consensus duration')

# Gauges
active_nodes = Gauge('danl_nodes_active', 'Active nodes count')
epistemic_kk = Gauge('danl_epistemic_kk', 'Known Knowns value', ['node_id'])
```

**Use metrics**:
```python
# Track consensus
consensus_proposals.inc()
consensus_duration.observe(duration)
if consensus_achieved:
    consensus_achieved.inc()

# Track nodes
active_nodes.set(len(active_nodes))

# Track epistemic state
epistemic_kk.labels(node_id='node-1').set(state.kk)
```

## Logging

### Log Levels

**Standard levels**:
- **DEBUG** - Detailed diagnostic information
- **INFO** - General informational messages
- **WARN** - Warning messages
- **ERROR** - Error conditions
- **FATAL** - Critical failures

### Structured Logging

**JSON logging**:
```python
import json
import logging

def setup_structured_logging():
    logger = logging.getLogger('danl')
    handler = logging.StreamHandler()
    
    formatter = logging.Formatter(
        json.dumps({
            'timestamp': '%(asctime)s',
            'level': '%(levelname)s',
            'logger': '%(name)s',
            'message': '%(message)s',
            'node_id': '%(node_id)s',
            'trace_id': '%(trace_id)s'
        })
    )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

# Use logger
logger.info('Consensus achieved', extra={
    'node_id': 'node-1',
    'trace_id': trace_id,
    'proposal_id': proposal_id,
    'geometry': 'tetrahedron'
})
```

### Log Aggregation

**Centralized logging**:
```yaml
# Fluentd configuration
<source>
  @type forward
  port 24224
</source>

<match danl.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name danl
  type_name log
</match>
```

## Distributed Tracing

### OpenTelemetry Integration

**Setup tracing**:
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

def setup_tracing():
    trace.set_tracer_provider(TracerProvider())
    
    jaeger_exporter = JaegerExporter(
        agent_host_name='jaeger',
        agent_port=6831
    )
    
    span_processor = BatchSpanProcessor(jaeger_exporter)
    trace.get_tracer_provider().add_span_processor(span_processor)
    
    return trace.get_tracer(__name__)

# Use tracing
tracer = setup_tracing()

with tracer.start_as_current_span('consensus-proposal') as span:
    span.set_attribute('proposal_id', proposal_id)
    span.set_attribute('geometry', geometry)
    
    result = execute_consensus(proposal)
    
    span.set_attribute('consensus_achieved', result)
```

### Trace Context Propagation

**Propagate context**:
```python
from opentelemetry import trace
from opentelemetry.propagate import inject, extract

def send_message(message, headers):
    """Send message with trace context"""
    tracer = trace.get_tracer(__name__)
    
    with tracer.start_as_current_span('send-message'):
        # Inject trace context
        inject(headers)
        
        # Send message
        send(message, headers)

def receive_message(message, headers):
    """Receive message with trace context"""
    tracer = trace.get_tracer(__name__)
    
    # Extract trace context
    context = extract(headers)
    
    with tracer.start_as_current_span('receive-message', context=context):
        process_message(message)
```

## Alerting

### Alert Rules

**Prometheus alert rules**:
```yaml
groups:
  - name: danl_alerts
    rules:
      - alert: HighConsensusFailureRate
        expr: rate(danl_consensus_failed_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High consensus failure rate"
          description: "Consensus failure rate is {{ $value }} failures/sec"
      
      - alert: NodeDown
        expr: danl_nodes_active < 3
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Too few nodes active"
          description: "Only {{ $value }} nodes are active"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, danl_consensus_duration_seconds) > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High consensus latency"
          description: "95th percentile latency is {{ $value }}s"
```

### Alert Routing

**Alertmanager configuration**:
```yaml
route:
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'oncall'
    - match:
        severity: warning
      receiver: 'slack'

receivers:
  - name: 'oncall'
    webhook_configs:
      - url: 'http://pagerduty/webhook'
  
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#alerts'
```

## Dashboards

### Grafana Dashboard

**Key panels**:
- Node status and health
- Consensus metrics (proposals, achieved, failed)
- Latency percentiles (p50, p95, p99)
- Throughput (events/sec, messages/sec)
- Resource utilization (CPU, memory, network)
- Epistemic state trends

**Example query**:
```promql
# Consensus success rate
rate(danl_consensus_achieved_total[5m]) / rate(danl_consensus_proposals_total[5m])
```

## Health Checks

### Health Endpoint

**HTTP health check**:
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'nodes': {
            'total': len(all_nodes),
            'active': len(active_nodes)
        },
        'consensus': {
            'last_achieved': last_consensus_time
        }
    })

@app.route('/ready')
def ready():
    """Readiness check"""
    if len(active_nodes) >= minimum_nodes:
        return jsonify({'status': 'ready'}), 200
    else:
        return jsonify({'status': 'not ready'}), 503
```

### Kubernetes Health Checks

**Liveness and readiness probes**:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Epistemic State Monitoring

### Track Epistemic Changes

**Monitor epistemic states**:
```python
def track_epistemic_state(node_id, state):
    """Track epistemic state changes"""
    metrics = {
        'kk': state.kk,
        'ku': state.ku,
        'uk': state.uk,
        'uu': state.uu
    }
    
    # Update metrics
    for key, value in metrics.items():
        epistemic_gauge.labels(node_id=node_id, metric=key).set(value)
    
    # Log state change
    logger.info('Epistemic state changed', extra={
        'node_id': node_id,
        'state': metrics
    })
```

## Network Topology Monitoring

### Track Network Changes

**Monitor topology**:
```python
def track_topology_change(old_topology, new_topology):
    """Track network topology changes"""
    added = new_topology - old_topology
    removed = old_topology - new_topology
    
    if added:
        logger.info('Nodes added', extra={'nodes': list(added)})
        topology_changes.inc({'type': 'added'})
    
    if removed:
        logger.warn('Nodes removed', extra={'nodes': list(removed)})
        topology_changes.inc({'type': 'removed'})
```

## Best Practices

### Monitoring Guidelines

1. **Monitor what matters** - Focus on business-critical metrics
2. **Set appropriate thresholds** - Avoid alert fatigue
3. **Use structured logging** - Enable better analysis
4. **Track distributed traces** - Understand request flows
5. **Automate alerting** - Reduce manual monitoring

### Performance Tips

1. **Batch metrics** - Reduce overhead
2. **Sample traces** - Don't trace everything
3. **Compress logs** - Reduce storage costs
4. **Retention policies** - Manage log retention

## Next Steps

- **Learn troubleshooting**: [Troubleshooting Guide](troubleshooting.md)
- **See disaster recovery**: [Disaster Recovery](disaster-recovery.md)
- **Check performance**: [Performance Optimization](performance-optimization.md)

## Related Resources

- [Performance Optimization](performance-optimization.md) - Performance tuning
- [Troubleshooting](troubleshooting.md) - Troubleshooting guide
- [Production Architecture](production-architecture.md) - Architecture guide
