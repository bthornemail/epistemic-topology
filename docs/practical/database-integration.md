---
id: database-integration
title: "Database Integration"
level: practical
type: implementation
tags: ["database", "integration", "event-store", "persistence", "sql"]
keywords: ["database", "sql", "postgresql", "event-store", "persistence"]
prerequisites: ["scheme-core", "web-integration"]
enables: ["integration-patterns"]
related: ["mq-integration", "web-integration"]
readingTime: 35
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Database Integration

> **Persist DANL state and events to databases**

DANL uses event sourcing patterns. This guide explains how to integrate with databases for event storage, snapshots, and queries.

## Event Store Pattern

### Event Sourcing

**Principle**: Store all events (S-expressions), reconstruct state by replaying.

**Benefits**:
- Complete audit trail
- Time travel debugging
- State reconstruction
- Event replay

## PostgreSQL Integration

### Schema Design

**Events table**:
```sql
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    timestamp BIGINT NOT NULL,
    vector_clock JSONB NOT NULL,
    node_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_node ON events(node_id);
CREATE INDEX idx_events_vclock ON events USING GIN(vector_clock);
```

### Inserting Events

**Insert S-expression**:
```python
import psycopg2
import json

def insert_event(conn, s_expr):
    """Insert S-expression event into database"""
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO events (event_type, event_data, timestamp, vector_clock, node_id)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, (
        s_expr['type'],
        json.dumps(s_expr['data']),
        s_expr['timestamp'],
        json.dumps(s_expr['vector-clock']),
        s_expr['node-id']
    ))
    
    event_id = cursor.fetchone()[0]
    conn.commit()
    return event_id
```

### Querying Events

**Query events**:
```python
def query_events(conn, query_params):
    """Query events from database"""
    cursor = conn.cursor()
    
    conditions = []
    params = []
    
    if 'type' in query_params:
        conditions.append("event_type = %s")
        params.append(query_params['type'])
    
    if 'since' in query_params:
        conditions.append("timestamp >= %s")
        params.append(query_params['since'])
    
    if 'node_id' in query_params:
        conditions.append("node_id = %s")
        params.append(query_params['node_id'])
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    cursor.execute(f"""
        SELECT id, event_type, event_data, timestamp, vector_clock, node_id
        FROM events
        WHERE {where_clause}
        ORDER BY timestamp ASC
    """, params)
    
    return cursor.fetchall()
```

## Snapshot Storage

### Snapshot Schema

**Snapshots table**:
```sql
CREATE TABLE snapshots (
    id BIGSERIAL PRIMARY KEY,
    node_id VARCHAR(100) NOT NULL,
    state_data JSONB NOT NULL,
    timestamp BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE INDEX idx_snapshots_node ON snapshots(node_id);
CREATE INDEX idx_snapshots_timestamp ON snapshots(timestamp);
```

### Creating Snapshots

**Save snapshot**:
```python
def save_snapshot(conn, node_id, state, timestamp, last_event_id):
    """Save state snapshot"""
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO snapshots (node_id, state_data, timestamp, event_id)
        VALUES (%s, %s, %s, %s)
        RETURNING id
    """, (
        node_id,
        json.dumps(state),
        timestamp,
        last_event_id
    ))
    
    snapshot_id = cursor.fetchone()[0]
    conn.commit()
    return snapshot_id
```

### Restoring from Snapshot

**Restore state**:
```python
def restore_snapshot(conn, node_id, timestamp=None):
    """Restore state from snapshot"""
    cursor = conn.cursor()
    
    if timestamp:
        cursor.execute("""
            SELECT state_data, event_id
            FROM snapshots
            WHERE node_id = %s AND timestamp <= %s
            ORDER BY timestamp DESC
            LIMIT 1
        """, (node_id, timestamp))
    else:
        cursor.execute("""
            SELECT state_data, event_id
            FROM snapshots
            WHERE node_id = %s
            ORDER BY timestamp DESC
            LIMIT 1
        """, (node_id,))
    
    result = cursor.fetchone()
    if result:
        return json.loads(result[0]), result[1]
    return None, None
```

## Event Replay

### Replaying Events

**Replay events**:
```python
def replay_events(conn, node_id, since_event_id=None):
    """Replay events to reconstruct state"""
    cursor = conn.cursor()
    
    if since_event_id:
        cursor.execute("""
            SELECT event_type, event_data, timestamp, vector_clock
            FROM events
            WHERE node_id = %s AND id > %s
            ORDER BY timestamp ASC
        """, (node_id, since_event_id))
    else:
        cursor.execute("""
            SELECT event_type, event_data, timestamp, vector_clock
            FROM events
            WHERE node_id = %s
            ORDER BY timestamp ASC
        """, (node_id,))
    
    events = cursor.fetchall()
    
    # Replay events
    state = initial_state()
    for event in events:
        state = apply_event(state, event)
    
    return state
```

### Fast Replay with Snapshot

**Optimized replay**:
```python
def fast_replay(conn, node_id, target_timestamp):
    """Fast replay using snapshot"""
    # Get latest snapshot before target
    snapshot_state, snapshot_event_id = restore_snapshot(conn, node_id, target_timestamp)
    
    if snapshot_state:
        # Replay events since snapshot
        state = snapshot_state
        events = get_events_since(conn, node_id, snapshot_event_id, target_timestamp)
    else:
        # No snapshot, replay all events
        state = initial_state()
        events = get_events_up_to(conn, node_id, target_timestamp)
    
    # Replay events
    for event in events:
        state = apply_event(state, event)
    
    return state
```

## SQLite Integration

### Lightweight Option

**SQLite schema**:
```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_data TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    vector_clock TEXT NOT NULL,
    node_id TEXT NOT NULL
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_timestamp ON events(timestamp);
```

### SQLite Usage

**Python with SQLite**:
```python
import sqlite3
import json

def init_sqlite_db(db_path):
    """Initialize SQLite database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            event_data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            vector_clock TEXT NOT NULL,
            node_id TEXT NOT NULL
        )
    """)
    
    conn.commit()
    return conn
```

## MongoDB Integration

### Document Store

**MongoDB schema**:
```javascript
// Events collection
{
  _id: ObjectId,
  event_type: String,
  event_data: Object,
  timestamp: Number,
  vector_clock: Object,
  node_id: String,
  created_at: Date
}
```

### MongoDB Operations

**Insert event**:
```javascript
async function insertEvent(db, sExpr) {
    const events = db.collection('events');
    
    await events.insertOne({
        event_type: sExpr.type,
        event_data: sExpr.data,
        timestamp: sExpr.timestamp,
        vector_clock: sExpr.vectorClock,
        node_id: sExpr.nodeId,
        created_at: new Date()
    });
}
```

**Query events**:
```javascript
async function queryEvents(db, query) {
    const events = db.collection('events');
    
    const mongoQuery = {};
    if (query.type) mongoQuery.event_type = query.type;
    if (query.since) mongoQuery.timestamp = { $gte: query.since };
    if (query.nodeId) mongoQuery.node_id = query.nodeId;
    
    return await events.find(mongoQuery).sort({ timestamp: 1 }).toArray();
}
```

## Scheme Integration

### Database Bindings

**Scheme FFI for PostgreSQL**:
```scheme
;;; PostgreSQL bindings for Scheme
(define-module (danl database postgresql))

;;; Connect to database
(define (db-connect host port database user password)
  ;; Use FFI to connect
  (foreign-call "PQconnectdb" host port database user password))

;;; Insert event
(define (db-insert-event conn s-expr)
  (let ((query "INSERT INTO events (event_type, event_data, timestamp, vector_clock, node_id) VALUES ($1, $2, $3, $4, $5)"))
    (foreign-call "PQexecParams" conn query
                  (s-expr-type s-expr)
                  (s-expr-data s-expr)
                  (s-expr-timestamp s-expr)
                  (s-expr-vector-clock s-expr)
                  (s-expr-node-id s-expr))))
```

## Query Optimization

### Indexing Strategy

**Key indexes**:
```sql
-- Primary lookup indexes
CREATE INDEX idx_events_type_timestamp ON events(event_type, timestamp);
CREATE INDEX idx_events_node_timestamp ON events(node_id, timestamp);

-- Vector clock queries (GIN index for JSONB)
CREATE INDEX idx_events_vclock_gin ON events USING GIN(vector_clock);
```

### Partitioning

**Time-based partitioning**:
```sql
-- Partition by month
CREATE TABLE events_2025_01 PARTITION OF events
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE events_2025_02 PARTITION OF events
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

## Best Practices

### Performance

1. **Use snapshots** - Reduce replay time
2. **Index properly** - Index frequently queried fields
3. **Partition tables** - Partition by time
4. **Batch inserts** - Batch multiple inserts

### Consistency

1. **Transactional writes** - Use transactions
2. **Idempotent operations** - Make operations idempotent
3. **Event ordering** - Preserve event order
4. **Vector clocks** - Use vector clocks for ordering

## Next Steps

- **Learn integration**: [Integration Patterns](integration-patterns.md) - More patterns
- **See MQ**: [Message Queue Integration](mq-integration.md) - Message queues
- **Check API**: [API Reference](api-reference.md) - Complete API

## Related Resources

- [Integration Patterns](integration-patterns.md) - Integration patterns
- [Message Queue Integration](mq-integration.md) - Message queue integration
- [Web Integration](web-integration.md) - Web integration
