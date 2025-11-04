---
id: microservices
title: "Microservices Architecture Patterns"
level: applied
type: application
tags: ["microservices", "architecture", "distributed", "patterns"]
keywords: ["microservices", "architecture", "distributed", "patterns", "service-mesh"]
prerequisites: ["production-architecture", "integration-patterns"]
enables: ["migration-guide"]
related: ["production-architecture", "integration-patterns"]
readingTime: 45
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Microservices Architecture Patterns

> **Applying DANL principles to microservices architecture**

This guide explains how to design and implement microservices using DANL's geometric consensus, epistemic state tracking, and distributed causality.

## Microservices with DANL

### Architecture Principles

**Core principles**:
1. **Service autonomy** - Each service owns its domain
2. **Geometric consensus** - Service coordination via consensus
3. **Event-driven** - Services communicate via events
4. **Epistemic state** - Track service knowledge explicitly
5. **Distributed causality** - Vector clocks for ordering

### Service Architecture

**Service layout**:
```
┌─────────────────────────────────────┐
│ API Gateway                         │
│   - Route requests                   │
│   - Authentication                   │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│User   │  │Order │  │Payment│
│Service│  │Service│  │Service│
└───┬───┘  └───┬───┘  └───┬───┘
    │          │          │
    └──────────┼──────────┘
               │
┌──────────────▼──────────────────────┐
│ Consensus Layer (Geometric)         │
│   - Service coordination             │
│   - Event ordering                   │
└─────────────────────────────────────┘
```

## Service Patterns

### Pattern 1: Service Discovery

**Geometric service discovery**:
```python
class ServiceRegistry:
    def __init__(self):
        self.services = {}
        self.geometry = 'tetrahedron'
    
    def register_service(self, service_id, service_info):
        """Register service"""
        self.services[service_id] = service_info
        
        # Consensus on service availability
        if len(self.services) >= 4:
            self.geometry = 'tetrahedron'
        elif len(self.services) >= 8:
            self.geometry = 'cube'
        elif len(self.services) >= 12:
            self.geometry = 'icosahedron'
    
    def discover_service(self, service_type):
        """Discover service using consensus"""
        matching_services = [s for s in self.services.values() 
                           if s['type'] == service_type]
        
        # Consensus on service selection
        if len(matching_services) >= consensus_threshold(self.geometry):
            return select_service(matching_services)
        return None
```

### Pattern 2: Event Sourcing

**Event-driven communication**:
```python
class EventStore:
    def __init__(self):
        self.events = []
        self.vector_clock = {}
    
    def append_event(self, service_id, event):
        """Append event with vector clock"""
        # Increment vector clock
        self.vector_clock[service_id] = self.vector_clock.get(service_id, 0) + 1
        
        # Create S-expression
        s_expr = {
            'type': event['type'],
            'data': event['data'],
            'timestamp': time.time(),
            'vector-clock': self.vector_clock.copy(),
            'service-id': service_id
        }
        
        self.events.append(s_expr)
        return s_expr
    
    def replay_events(self, service_id):
        """Replay events for service"""
        service_events = [e for e in self.events 
                         if e['service-id'] == service_id]
        return sorted(service_events, key=lambda e: e['timestamp'])
```

### Pattern 3: Saga Pattern

**Distributed transaction coordination**:
```python
class SagaCoordinator:
    def __init__(self):
        self.sagas = {}
    
    def start_saga(self, saga_id, steps):
        """Start distributed saga"""
        saga = {
            'id': saga_id,
            'steps': steps,
            'current_step': 0,
            'status': 'running'
        }
        
        self.sagas[saga_id] = saga
        
        # Execute first step
        self.execute_step(saga_id)
    
    def execute_step(self, saga_id):
        """Execute saga step"""
        saga = self.sagas[saga_id]
        step = saga['steps'][saga['current_step']]
        
        # Execute step
        result = call_service(step['service'], step['action'])
        
        if result['success']:
            # Move to next step
            saga['current_step'] += 1
            
            if saga['current_step'] >= len(saga['steps']):
                # Saga complete
                saga['status'] = 'completed'
            else:
                # Continue saga
                self.execute_step(saga_id)
        else:
            # Compensate
            self.compensate_saga(saga_id)
```

## Service Communication

### Synchronous Communication

**REST API calls**:
```python
import requests

def call_service(service_name, endpoint, data):
    """Call service synchronously"""
    service_url = service_discovery.get_service_url(service_name)
    
    response = requests.post(
        f"{service_url}/{endpoint}",
        json=data,
        headers={'X-Trace-Id': get_trace_id()}
    )
    
    return response.json()
```

### Asynchronous Communication

**Message queue**:
```python
from kafka import KafkaProducer

producer = KafkaProducer()

def publish_event(topic, event):
    """Publish event asynchronously"""
    producer.send(topic, value=json.dumps(event).encode())
```

## Service Decomposition

### Domain-Driven Design

**Service boundaries**:
```python
# User Service
class UserService:
    def create_user(self, user_data):
        """Create user"""
        # M-expression
        m_expr = {
            'functor': 'createUser',
            'args': user_data
        }
        
        # Compile to S-expression
        s_expr = compile_m_expr(m_expr)
        
        # Store event
        event_store.append_event('user-service', s_expr)
        
        return s_expr

# Order Service
class OrderService:
    def create_order(self, order_data):
        """Create order"""
        # Validate user exists
        user = user_service.get_user(order_data['user_id'])
        
        # Create order
        m_expr = {
            'functor': 'createOrder',
            'args': order_data
        }
        
        s_expr = compile_m_expr(m_expr)
        event_store.append_event('order-service', s_expr)
        
        return s_expr
```

## Service Mesh

### Service Mesh Integration

**Istio integration**:
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
    - user-service
  http:
    - match:
        - uri:
            prefix: /api
      route:
        - destination:
            host: user-service
            port:
              number: 8080
```

## Monitoring Microservices

### Distributed Tracing

**OpenTelemetry tracing**:
```python
from opentelemetry import trace
from opentelemetry.instrumentation.requests import RequestsInstrumentor

tracer = trace.get_tracer(__name__)
RequestsInstrumentor().instrument()

def call_service_with_trace(service_name, endpoint, data):
    """Call service with distributed tracing"""
    with tracer.start_as_current_span('service-call') as span:
        span.set_attribute('service', service_name)
        span.set_attribute('endpoint', endpoint)
        
        result = call_service(service_name, endpoint, data)
        
        span.set_attribute('result', result['status'])
        return result
```

## Best Practices

### Microservices Guidelines

1. **Service boundaries** - Clear domain boundaries
2. **Event-driven** - Use events for communication
3. **Consensus** - Coordinate via geometric consensus
4. **Monitoring** - Distributed tracing and metrics
5. **Resilience** - Handle failures gracefully

## Next Steps

- **Learn migration**: [Migration Guide](migration-guide.md)
- **See integration**: [Integration Patterns](integration-patterns.md)
- **Check architecture**: [Production Architecture](production-architecture.md)

## Related Resources

- [Production Architecture](production-architecture.md) - Architecture guide
- [Integration Patterns](integration-patterns.md) - Integration patterns
- [Monitoring](monitoring.md) - Monitoring guide
