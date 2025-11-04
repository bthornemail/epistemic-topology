---
id: protocol-specs
title: "Protocol Specifications"
level: practical
type: implementation
tags: ["protocol", "specification", "network", "communication"]
keywords: ["protocol", "spec", "network", "communication", "message", "format"]
prerequisites: ["api-reference", "ms-expression-duality"]
enables: ["configuration"]
related: ["api-reference", "integration-patterns"]
readingTime: 45
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Protocol Specifications

> **Complete protocol specifications for DANL network communication**

This document specifies the protocols used for communication between DANL nodes, including message formats, handshakes, consensus protocols, and error handling.

## Protocol Overview

### Protocol Stack

```
┌─────────────────────────────────────┐
│ Application Layer (M/S Expressions) │
├─────────────────────────────────────┤
│ Consensus Layer (Geometric)        │
├─────────────────────────────────────┤
│ Causality Layer (Vector Clocks)     │
├─────────────────────────────────────┤
│ Transport Layer (TCP/WebSocket)     │
└─────────────────────────────────────┘
```

## Message Format

### M-Expression Format

**Syntax**:
```
M-Expression ::= Functor[Arg1; Arg2; ...]
```

**Examples**:
```
createBinding[x; global]
callRPC[node3; compute; [arg1, arg2]]
query[epistemic-state; [alice]]
```

**JSON Format**:
```json
{
  "type": "m-expression",
  "functor": "createBinding",
  "args": ["x", "global"]
}
```

### S-Expression Format

**Syntax**:
```scheme
(S-Expression ::= (Type Data Timestamp VectorClock))
```

**Examples**:
```scheme
(binding-created "x" "global" 1234567890 #{(node1 1) (node2 0)})
(rpc-called "node3" "compute" [arg1 arg2] 1234567891 #{(node1 1) (node2 1)})
```

**JSON Format**:
```json
{
  "type": "s-expression",
  "event-type": "binding-created",
  "data": ["x", "global"],
  "timestamp": 1234567890,
  "vector-clock": {
    "node1": 1,
    "node2": 0
  }
}
```

## Handshake Protocol

### Initial Handshake

**Client → Server**:
```json
{
  "type": "handshake",
  "version": "1.0",
  "capabilities": ["s-expressions", "network-updates", "epistemic-updates"],
  "node-id": "node-1"
}
```

**Server → Client**:
```json
{
  "type": "handshake-response",
  "version": "1.0",
  "supported-capabilities": ["s-expressions", "network-updates", "epistemic-updates"],
  "session-id": "session-123"
}
```

### Capability Negotiation

**Supported capabilities**:
- `s-expressions` - S-expression events
- `network-updates` - Network state updates
- `epistemic-updates` - Epistemic state updates
- `consensus` - Consensus protocol
- `vector-clocks` - Vector clock synchronization

## Command Protocol

### Command Message

**Format**:
```json
{
  "type": "command",
  "id": "cmd-123",
  "m-expression": {
    "functor": "createBinding",
    "args": ["x", "global"]
  },
  "timestamp": 1234567890
}
```

### Command Response

**Success**:
```json
{
  "type": "command-response",
  "id": "cmd-123",
  "status": "success",
  "s-expression": {
    "type": "binding-created",
    "data": ["x", "global"],
    "timestamp": 1234567890,
    "vector-clock": {"node1": 1}
  }
}
```

**Error**:
```json
{
  "type": "command-response",
  "id": "cmd-123",
  "status": "error",
  "error": {
    "code": "INVALID_BINDING",
    "message": "Binding already exists"
  }
}
```

## Event Protocol

### Event Subscription

**Subscribe**:
```json
{
  "type": "subscribe",
  "event-types": ["binding-created", "consensus-achieved"],
  "filters": {
    "node-id": "node-1"
  }
}
```

### Event Notification

**Event message**:
```json
{
  "type": "event",
  "event-type": "binding-created",
  "s-expression": {
    "type": "binding-created",
    "data": ["x", "global"],
    "timestamp": 1234567890,
    "vector-clock": {"node1": 1}
  }
}
```

## Consensus Protocol

### Consensus Proposal

**Format**:
```json
{
  "type": "consensus-proposal",
  "proposal-id": "prop-123",
  "proposal": {
    "type": "upgrade-system",
    "version": "2.0"
  },
  "geometry": "tetrahedron",
  "timestamp": 1234567890
}
```

### Consensus Vote

**Format**:
```json
{
  "type": "consensus-vote",
  "proposal-id": "prop-123",
  "node-id": "node-1",
  "vote": "agree",
  "vector-clock": {"node1": 1, "node2": 0},
  "timestamp": 1234567891
}
```

### Consensus Result

**Format**:
```json
{
  "type": "consensus-result",
  "proposal-id": "prop-123",
  "result": "achieved",
  "agreeing": 3,
  "total": 4,
  "geometry": "tetrahedron",
  "threshold": 0.75,
  "timestamp": 1234567892
}
```

## Vector Clock Protocol

### Synchronization Request

**Format**:
```json
{
  "type": "vclock-sync-request",
  "node-id": "node-1",
  "vector-clock": {
    "node1": 1,
    "node2": 0,
    "node3": 0
  }
}
```

### Synchronization Response

**Format**:
```json
{
  "type": "vclock-sync-response",
  "node-id": "node-2",
  "merged-vector-clock": {
    "node1": 1,
    "node2": 1,
    "node3": 0
  }
}
```

## Network Update Protocol

### Network State Update

**Format**:
```json
{
  "type": "network-update",
  "nodes": [
    {
      "id": "node-1",
      "status": "active",
      "epistemic-state": {
        "kk": 100,
        "ku": 50,
        "uk": 30,
        "uu": 20
      }
    }
  ],
  "geometry": "tetrahedron",
  "timestamp": 1234567890
}
```

## Error Protocol

### Error Message

**Format**:
```json
{
  "type": "error",
  "error-code": "INVALID_COMMAND",
  "error-message": "Invalid M-expression syntax",
  "request-id": "cmd-123",
  "timestamp": 1234567890
}
```

### Error Codes

**Common error codes**:
- `INVALID_COMMAND` - Invalid M-expression
- `UNAUTHORIZED` - Authentication failed
- `RATE_LIMITED` - Rate limit exceeded
- `CONSENSUS_FAILED` - Consensus not achieved
- `NETWORK_ERROR` - Network communication error

## WebSocket Protocol

### Connection

**URL**: `ws://host:port/ws` or `wss://host:port/ws`

**Protocol**: `danl-protocol/1.0`

**Connection**:
```javascript
const ws = new WebSocket('ws://localhost:8080/ws', 'danl-protocol/1.0');
```

### Message Types

**Client → Server**:
- `handshake` - Initial handshake
- `command` - Send M-expression command
- `subscribe` - Subscribe to events
- `unsubscribe` - Unsubscribe from events
- `query` - Query events

**Server → Client**:
- `handshake-response` - Handshake response
- `command-response` - Command response
- `event` - Event notification
- `network-update` - Network state update
- `error` - Error message

## HTTP REST Protocol

### Endpoints

**Base URL**: `http://host:port/api/v1`

**Endpoints**:
- `POST /commands` - Send command
- `GET /events` - Query events
- `GET /state` - Get current state
- `GET /consensus` - Check consensus
- `GET /nodes` - List nodes

### Request Format

**POST /commands**:
```http
POST /api/v1/commands HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "functor": "createBinding",
  "args": ["x", "global"]
}
```

### Response Format

**Success**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "s-expression": {
    "type": "binding-created",
    "data": ["x", "global"],
    "timestamp": 1234567890
  }
}
```

**Error**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "INVALID_COMMAND",
    "message": "Invalid M-expression"
  }
}
```

## Transport Protocol

### TCP Protocol

**Port**: `8080` (default)

**Protocol**: Custom binary protocol over TCP

**Message framing**:
```
[Length: 4 bytes][Type: 1 byte][Payload: Length bytes]
```

### WebSocket Protocol

**Port**: `8080` (default)

**Path**: `/ws`

**Protocol**: `danl-protocol/1.0`

**Message format**: JSON

## Security Protocol

### Authentication

**Token-based**:
```json
{
  "type": "auth",
  "token": "bearer-token-here"
}
```

**Certificate-based**:
- TLS client certificates
- Mutual TLS (mTLS)

### Encryption

**TLS 1.3**:
- Required for all connections
- Certificate pinning supported
- Perfect forward secrecy

## Versioning

### Protocol Version

**Version format**: `MAJOR.MINOR`

**Current version**: `1.0`

**Version negotiation**:
- Client sends version in handshake
- Server responds with supported version
- Fallback to compatible version

## Next Steps

- **Learn configuration**: [Configuration](configuration.md) - Configuration guide
- **See integration**: [Integration Patterns](integration-patterns.md) - Integration patterns
- **Check API**: [API Reference](api-reference.md) - Complete API

## Related Resources

- [API Reference](api-reference.md) - API reference
- [M/S Expression Duality](ms-expression-duality.md) - M/S expressions
- [Integration Patterns](integration-patterns.md) - Integration patterns
