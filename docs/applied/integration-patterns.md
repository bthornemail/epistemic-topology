---
id: integration-patterns
title: "Integration Patterns"
level: applied
type: application
tags: ["integration", "patterns", "api", "events", "cqrs"]
keywords: ["integration", "api", "events", "cqrs", "microservices", "legacy"]
prerequisites: ["ms-expression-duality", "production-architecture"]
enables: ["microservices", "blockchain-integration"]
related: ["web-integration", "database-integration"]
readingTime: 35
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Integration Patterns

> **Common patterns for integrating DANL into existing systems**

DANL integrates with existing systems through M/S-expression patterns, event-driven architectures, and API gateways. This document explains integration patterns for legacy systems, microservices, and modern applications.

## Integration Principles

### Core Principles

1. **M/S Expression Duality** - Commands (M) compile to events (S)
2. **Event-Driven** - Systems communicate via events
3. **API Gateway** - Single entry point for external systems
4. **Backward Compatible** - Support legacy systems
5. **Gradual Migration** - Incremental adoption

## M/S Expression Integration

### Command Interface

**Pattern**: External systems send M-expressions (commands)

**Example**:
```json
{
  "type": "createBinding",
  "args": {
    "identifier": "user123",
    "scope": "global"
  }
}
```

**Compilation**: M-expression → S-expression (event)

```scheme
;; Compile M-expression to S-expression
(define (m-to-s-compile m-expr state)
  (case (m-expression-type m-expr)
    ['create-binding
     (list 'binding-created 
           (m-expr-arg m-expr 'identifier)
           (m-expr-arg m-expr 'scope)
           (current-time))]
    ...))
```

### Event Interface

**Pattern**: External systems read S-expressions (events)

**Example**:
```json
{
  "type": "binding-created",
  "identifier": "user123",
  "scope": "global",
  "timestamp": 1234567890,
  "vector-clock": {"node1": 1, "node2": 0}
}
```

## API Gateway Pattern

### Gateway Architecture

**Pattern**: Single API gateway for all external access

```
External Systems → API Gateway → DANL Nodes
                      ↓
                  Load Balancer
```

**Implementation**:
```python
class DANLAPIGateway:
    def __init__(self, danl_cluster):
        self.cluster = danl_cluster
        self.load_balancer = LoadBalancer()
    
    def handle_command(self, m_expression):
        """Handle M-expression command"""
        # Validate command
        validated = self.validate(m_expression)
        
        # Route to node
        node = self.load_balancer.select_node()
        
        # Compile and execute
        s_expression = compile_m_to_s(validated)
        result = node.execute(s_expression)
        
        return result
    
    def query_events(self, query):
        """Query S-expressions"""
        # Query event store
        events = self.cluster.query_events(query)
        
        return events
```

### REST API Wrapper

**Pattern**: Expose DANL via REST API

**Endpoints**:
```python
# POST /api/v1/commands
@app.route('/api/v1/commands', methods=['POST'])
def create_command():
    m_expr = request.json
    result = gateway.handle_command(m_expr)
    return jsonify(result)

# GET /api/v1/events
@app.route('/api/v1/events', methods=['GET'])
def query_events():
    query = request.args
    events = gateway.query_events(query)
    return jsonify(events)
```

## Event-Driven Integration

### Event Sourcing Pattern

**Pattern**: Store all events, reconstruct state

**Implementation**:
```python
class EventStore:
    def append_event(self, s_expression):
        """Append event to store"""
        event_id = generate_id()
        self.store.append({
            'id': event_id,
            'event': s_expression,
            'timestamp': current_time()
        })
        return event_id
    
    def replay_events(self, since=None):
        """Replay events since timestamp"""
        events = self.store.filter(since=since)
        return events
```

### Event Bus Integration

**Pattern**: Integrate with message buses

**Kafka Integration**:
```python
from kafka import KafkaProducer

class KafkaEventBus:
    def __init__(self, kafka_brokers):
        self.producer = KafkaProducer(bootstrap_servers=kafka_brokers)
    
    def publish_event(self, topic, s_expression):
        """Publish event to Kafka"""
        self.producer.send(topic, value=json.dumps(s_expression))
    
    def subscribe_events(self, topic, callback):
        """Subscribe to events"""
        consumer = KafkaConsumer(topic)
        for message in consumer:
            s_expression = json.loads(message.value)
            callback(s_expression)
```

## Legacy System Integration

### Adapter Pattern

**Pattern**: Adapter for legacy protocols

**Example**: SOAP to M-expression adapter

```python
class SOAPAdapter:
    def soap_to_m_expression(self, soap_request):
        """Convert SOAP request to M-expression"""
        operation = soap_request.operation
        params = soap_request.parameters
        
        if operation == 'CreateBinding':
            return {
                'type': 'create-binding',
                'args': {
                    'identifier': params['id'],
                    'scope': params['scope']
                }
            }
```

### Database Integration

**Pattern**: Integrate with existing databases

**Implementation**:
```python
class DatabaseAdapter:
    def sync_to_database(self, events):
        """Sync events to database"""
        for event in events:
            if event.type == 'binding-created':
                self.db.execute(
                    "INSERT INTO bindings (id, scope) VALUES (?, ?)",
                    (event.identifier, event.scope)
                )
```

## Microservices Integration

### Service Mesh Pattern

**Pattern**: DANL as coordination layer

**Architecture**:
```
Microservice A → Service Mesh → DANL → Service Mesh → Microservice B
```

**Implementation**:
```yaml
services:
  - name: user-service
    danl_integration:
      commands: ['create-user', 'update-user']
      events: ['user-created', 'user-updated']
  
  - name: order-service
    danl_integration:
      commands: ['create-order', 'cancel-order']
      events: ['order-created', 'order-cancelled']
```

### CQRS Integration

**Pattern**: Separate command and query services

**Command Side**:
```python
class CommandService:
    def handle_command(self, m_expression):
        """Handle command"""
        s_expression = compile_m_to_s(m_expression)
        event_store.append(s_expression)
        return {'status': 'accepted'}
```

**Query Side**:
```python
class QueryService:
    def query_state(self, query):
        """Query current state"""
        # Replay events to get state
        state = replay_events(query.timestamp)
        return query.execute(state)
```

## Phased Rollout

### Phase 1: Read-Only Integration

**Pattern**: Start with read-only access

**Implementation**:
```python
# Phase 1: Read events only
def phase1_integration():
    # Subscribe to events
    event_bus.subscribe('all-events', handle_event)
    
    # No commands yet
    pass
```

### Phase 2: Write Integration

**Pattern**: Add write capabilities

**Implementation**:
```python
# Phase 2: Add commands
def phase2_integration():
    # Handle commands
    api_gateway.add_endpoint('/commands', handle_command)
    
    # Validate before accepting
    validator.enable()
```

### Phase 3: Full Integration

**Pattern**: Complete integration

**Implementation**:
```python
# Phase 3: Full integration
def phase3_integration():
    # All features enabled
    api_gateway.enable_all()
    event_bus.enable_all()
    consensus.enable()
```

## Data Migration

### Event Replay Migration

**Pattern**: Migrate by replaying events

**Implementation**:
```python
def migrate_by_replay(source_system, target_system):
    """Migrate data by replaying events"""
    # Extract events from source
    events = source_system.extract_events()
    
    # Replay to target
    for event in events:
        target_system.replay_event(event)
```

### Snapshot Migration

**Pattern**: Migrate via snapshots

**Implementation**:
```python
def migrate_by_snapshot(source_system, target_system):
    """Migrate data via snapshot"""
    # Create snapshot
    snapshot = source_system.create_snapshot()
    
    # Restore in target
    target_system.restore_snapshot(snapshot)
    
    # Sync recent events
    recent_events = source_system.get_events_since(snapshot.time)
    for event in recent_events:
        target_system.replay_event(event)
```

## WebSocket Integration

### Real-Time Updates

**Pattern**: WebSocket for real-time events

**Implementation**:
```python
from flask_socketio import SocketIO

class WebSocketIntegration:
    def __init__(self, danl_cluster):
        self.socketio = SocketIO()
        self.cluster = danl_cluster
    
    def setup_routes(self):
        """Setup WebSocket routes"""
        @self.socketio.on('subscribe')
        def handle_subscribe(query):
            # Subscribe to events matching query
            self.cluster.subscribe(query, self.broadcast_event)
    
    def broadcast_event(self, event):
        """Broadcast event to clients"""
        self.socketio.emit('event', event)
```

## Best Practices

### Integration Guidelines

1. **Start simple** - Begin with read-only integration
2. **Validate inputs** - Always validate M-expressions
3. **Handle errors** - Graceful error handling
4. **Monitor integration** - Track integration metrics
5. **Document APIs** - Complete API documentation

### Common Pitfalls

1. **Bypassing consensus** - Don't bypass consensus layer
2. **Ignoring events** - Don't ignore event ordering
3. **Not validating** - Always validate inputs
4. **Missing error handling** - Handle all error cases

## Next Steps

- **Learn about microservices**: [Microservices](microservices.md) - Microservices patterns
- **See blockchain**: [Blockchain Integration](blockchain-integration.md) - Blockchain patterns
- **Understand web**: [Web Integration](web-integration.md) - Web integration

## Related Resources

- [M/S Expression Duality](ms-expression-duality.md) - M/S expressions
- [Production Architecture](production-architecture.md) - Architecture patterns
- [Web Integration](web-integration.md) - Web integration
