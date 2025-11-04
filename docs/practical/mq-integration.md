---
id: mq-integration
title: "Message Queue Integration"
level: practical
type: implementation
tags: ["message-queue", "integration", "kafka", "rabbitmq", "mqtt"]
keywords: ["mq", "kafka", "rabbitmq", "mqtt", "message-queue", "pub-sub"]
prerequisites: ["database-integration", "web-integration"]
enables: ["integration-patterns"]
related: ["database-integration", "web-integration"]
readingTime: 35
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Message Queue Integration

> **Integrate DANL with message queues: Kafka, RabbitMQ, MQTT**

DANL integrates with message queues for event streaming, pub/sub patterns, and reliable message delivery. This guide covers Kafka, RabbitMQ, and MQTT integration.

## Overview

### Use Cases

1. **Event Streaming** - Stream S-expressions to consumers
2. **Pub/Sub** - Publish/subscribe to events
3. **Reliable Delivery** - Guaranteed message delivery
4. **Scaling** - Horizontal scaling via message queues

## Kafka Integration

### Producer Setup

**Kafka producer**:
```python
from kafka import KafkaProducer
import json

class DANLKafkaProducer:
    def __init__(self, bootstrap_servers):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    
    def publish_event(self, topic, s_expr):
        """Publish S-expression event to Kafka"""
        self.producer.send(topic, value={
            'type': s_expr['type'],
            'data': s_expr['data'],
            'timestamp': s_expr['timestamp'],
            'vector-clock': s_expr['vector-clock']
        })
    
    def flush(self):
        """Flush pending messages"""
        self.producer.flush()
```

### Consumer Setup

**Kafka consumer**:
```python
from kafka import KafkaConsumer
import json

class DANLKafkaConsumer:
    def __init__(self, bootstrap_servers, topics):
        self.consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=bootstrap_servers,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest',
            enable_auto_commit=True
        )
    
    def consume_events(self, callback):
        """Consume events and call callback"""
        for message in self.consumer:
            s_expr = message.value
            callback(s_expr)
```

### Topic Design

**Topic structure**:
```yaml
topics:
  - name: danl-events
    partitions: 3
    replication: 2
  
  - name: danl-events-binding-created
    partitions: 1
    replication: 2
  
  - name: danl-events-consensus
    partitions: 2
    replication: 2
```

### Example Usage

**Publish and consume**:
```python
# Producer
producer = DANLKafkaProducer(['localhost:9092'])
producer.publish_event('danl-events', {
    'type': 'binding-created',
    'data': ['x', 'global'],
    'timestamp': 1234567890,
    'vector-clock': {'node1': 1, 'node2': 0}
})

# Consumer
consumer = DANLKafkaConsumer(['localhost:9092'], ['danl-events'])

def handle_event(s_expr):
    print(f"Received event: {s_expr['type']}")

consumer.consume_events(handle_event)
```

## RabbitMQ Integration

### Publisher Setup

**RabbitMQ publisher**:
```python
import pika

class DANLRabbitMQPublisher:
    def __init__(self, connection_params):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(**connection_params)
        )
        self.channel = self.connection.channel()
        
        # Declare exchange
        self.channel.exchange_declare(
            exchange='danl_events',
            exchange_type='topic'
        )
    
    def publish_event(self, routing_key, s_expr):
        """Publish S-expression event"""
        self.channel.basic_publish(
            exchange='danl_events',
            routing_key=routing_key,
            body=json.dumps(s_expr)
        )
    
    def close(self):
        """Close connection"""
        self.connection.close()
```

### Consumer Setup

**RabbitMQ consumer**:
```python
class DANLRabbitMQConsumer:
    def __init__(self, connection_params, exchange, routing_keys):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(**connection_params)
        )
        self.channel = self.connection.channel()
        
        # Declare exchange
        self.channel.exchange_declare(
            exchange=exchange,
            exchange_type='topic'
        )
        
        # Declare queue
        result = self.channel.queue_declare('', exclusive=True)
        queue_name = result.method.queue
        
        # Bind queues
        for routing_key in routing_keys:
            self.channel.queue_bind(
                exchange=exchange,
                queue=queue_name,
                routing_key=routing_key
            )
        
        self.queue_name = queue_name
    
    def consume_events(self, callback):
        """Consume events"""
        self.channel.basic_consume(
            queue=self.queue_name,
            on_message_callback=lambda ch, method, props, body: callback(json.loads(body)),
            auto_ack=True
        )
        
        self.channel.start_consuming()
```

### Routing Keys

**Routing key patterns**:
```python
# Routing keys
routing_keys = {
    'binding.created': 'danl.event.binding.created',
    'binding.updated': 'danl.event.binding.updated',
    'consensus.achieved': 'danl.event.consensus.achieved',
    'network.update': 'danl.event.network.update'
}
```

## MQTT Integration

### Publisher Setup

**MQTT publisher**:
```python
import paho.mqtt.client as mqtt

class DANLMQTTPublisher:
    def __init__(self, broker, port=1883):
        self.client = mqtt.Client()
        self.client.connect(broker, port, 60)
        self.client.loop_start()
    
    def publish_event(self, topic, s_expr):
        """Publish S-expression event"""
        self.client.publish(topic, json.dumps(s_expr))
    
    def disconnect(self):
        """Disconnect"""
        self.client.loop_stop()
        self.client.disconnect()
```

### Subscriber Setup

**MQTT subscriber**:
```python
class DANLMQTTSubscriber:
    def __init__(self, broker, port=1883):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(broker, port, 60)
    
    def on_connect(self, client, userdata, flags, rc):
        """Subscribe on connect"""
        client.subscribe('danl/events/#')
    
    def on_message(self, client, userdata, msg):
        """Handle message"""
        s_expr = json.loads(msg.payload.decode())
        self.handle_event(s_expr)
    
    def handle_event(self, s_expr):
        """Override to handle events"""
        pass
    
    def start(self):
        """Start consuming"""
        self.client.loop_forever()
```

### Topic Structure

**MQTT topics**:
```python
topics = {
    'binding_created': 'danl/events/binding/created',
    'binding_updated': 'danl/events/binding/updated',
    'consensus': 'danl/events/consensus',
    'network_update': 'danl/events/network/update'
}
```

## Scheme Integration

### Kafka Bindings

**Scheme Kafka integration**:
```scheme
;;; Kafka bindings for Scheme
(define-module (danl mq kafka))

;;; Publish event
(define (kafka-publish-event topic s-expr)
  (let ((message (s-expr->json s-expr)))
    (foreign-call "kafka_produce" topic message)))
```

## Reliability Patterns

### At-Least-Once Delivery

**Kafka with acknowledgment**:
```python
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    acks='all',  # Wait for all replicas
    retries=3,
    max_in_flight_requests_per_connection=1
)
```

### Exactly-Once Delivery

**Kafka idempotent producer**:
```python
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    enable_idempotence=True,
    acks='all',
    retries=3
)
```

### Message Ordering

**Partition by key**:
```python
def publish_event_with_key(producer, topic, key, s_expr):
    """Publish with partition key for ordering"""
    producer.send(
        topic,
        key=key.encode('utf-8'),
        value=json.dumps(s_expr).encode('utf-8')
    )
```

## Integration Patterns

### Event Sourcing

**Pattern**: Store events in MQ and database

```python
class EventSourcingMQ:
    def publish_event(self, s_expr):
        # Publish to Kafka
        self.kafka_producer.publish_event('danl-events', s_expr)
        
        # Store in database
        self.db.insert_event(s_expr)
```

### CQRS

**Pattern**: Separate command and query queues

```python
# Command queue (writes)
command_queue = 'danl-commands'

# Query queue (reads)
query_queue = 'danl-queries'

# Event queue (results)
event_queue = 'danl-events'
```

## Best Practices

### Performance

1. **Batch messages** - Batch multiple messages
2. **Async publishing** - Use async producers
3. **Connection pooling** - Reuse connections
4. **Compression** - Compress large messages

### Reliability

1. **Acknowledgment** - Use acknowledgments
2. **Retries** - Configure retries
3. **Dead letter queues** - Handle failed messages
4. **Monitoring** - Monitor queue health

## Next Steps

- **Learn integration**: [Integration Patterns](integration-patterns.md) - More patterns
- **See database**: [Database Integration](database-integration.md) - Database integration
- **Check API**: [API Reference](api-reference.md) - Complete API

## Related Resources

- [Integration Patterns](integration-patterns.md) - Integration patterns
- [Database Integration](database-integration.md) - Database integration
- [Web Integration](web-integration.md) - Web integration
