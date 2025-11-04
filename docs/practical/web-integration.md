---
id: web-integration
title: "Web Integration Guide"
level: practical
type: implementation
tags: ["web", "integration", "websocket", "javascript", "api"]
keywords: ["web", "websocket", "javascript", "api", "integration", "browser"]
prerequisites: ["first-automaton", "scheme-api"]
enables: ["api-reference"]
related: ["integration-patterns", "database-integration"]
readingTime: 40
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Web Integration Guide

> **Integrate DANL with web applications using WebSocket and REST APIs**

This guide explains how to integrate DANL with web applications using WebSocket for real-time updates and REST APIs for commands and queries.

## Overview

### Integration Components

1. **WebSocket Client** - Real-time S-expression streaming
2. **REST API Wrapper** - M-expression commands
3. **JavaScript Client Library** - High-level API
4. **Event Handling** - React to network updates

## WebSocket Integration

### WebSocket Client

The DANL WebSocket client (`web-ui/websocket-client.js`) implements the W3C WebSocket API with automatic reconnection and event handling.

**Basic connection**:
```javascript
import { WebSocketClient } from './websocket-client.js';

const ws = new WebSocketClient('ws://localhost:8080/ws');

ws.on('connected', () => {
    console.log('Connected to DANL');
});

ws.on('s-expression', (event) => {
    console.log('Received event:', event);
});

ws.on('network-update', (update) => {
    console.log('Network update:', update);
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
```

**Connection with automatic reconnection** (from `web-ui/websocket-client.js`):
```javascript
// The WebSocketClient automatically handles reconnection
const ws = new WebSocketClient('ws://localhost:8080/ws');

// Connection states: CONNECTING, OPEN, CLOSING, CLOSED
console.log(ws.getState()); // 'CONNECTING' or 'OPEN'

// Check connection status
if (ws.isConnected()) {
    // Send M-expression command
    ws.submitMExpression('createBinding[x; global]');
    
    // Query epistemic state
    ws.queryEpistemicState('node-1');
}
```

**Handshake on connection**:
```javascript
// The client automatically sends handshake on connect
ws.on('connected', () => {
    console.log('Handshake completed');
    // Client capabilities: ['s-expressions', 'network-updates', 'epistemic-updates']
});
```

### WebSocket Message Types

**Supported message types**:
- `s-expression` - S-expression events
- `network-update` - Network state changes
- `epistemic-update` - Epistemic state updates
- `consensus-result` - Consensus results
- `error` - Error messages

**Example message**:
```json
{
  "type": "s-expression",
  "payload": {
    "type": "binding-created",
    "data": ["x", "global"],
    "timestamp": 1234567890,
    "vector-clock": {"node1": 1, "node2": 0}
  }
}
```

### Sending Commands

**Send M-expression** (using WebSocketClient API):
```javascript
// Submit M-expression directly
ws.submitMExpression('createBinding[x; global]');

// Or send raw message
ws.send({
    type: 'm-expression',
    payload: { mExpr: 'createBinding[x; global]' }
});
```

**Full application example** (from `web-ui/app.js`):
```javascript
import { WebSocketClient } from './websocket-client.js';

class DANLApplication {
    constructor() {
        this.ws = null;
        this.initWebSocket();
    }
    
    initWebSocket() {
        const wsUrl = this.getWebSocketURL();
        this.ws = new WebSocketClient(wsUrl);
        
        this.ws.on('s-expression', (event) => {
            this.handleSExpression(event);
        });
        
        this.ws.on('network-update', (data) => {
            this.handleNetworkUpdate(data);
        });
        
        this.ws.on('epistemic-update', (data) => {
            this.handleEpistemicUpdate(data);
        });
    }
    
    getWebSocketURL() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host || 'localhost:8080';
        return `${protocol}//${host}/ws`;
    }
    
    handleMExprSubmit(event) {
        event.preventDefault();
        const mExpr = document.getElementById('m-expr-input').value;
        
        // Submit M-expression via WebSocket
        if (this.ws && this.ws.isConnected()) {
            this.ws.submitMExpression(mExpr);
        }
    }
}
```

## REST API Integration

### API Endpoints

**Base URL**: `http://localhost:8080/api/v1`

**Endpoints**:
- `POST /commands` - Send M-expression command
- `GET /events` - Query S-expressions
- `GET /state` - Get current state
- `GET /consensus` - Check consensus status

### Sending Commands

**POST /commands**:
```javascript
async function sendCommand(functor, args) {
    const response = await fetch('http://localhost:8080/api/v1/commands', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            functor: functor,
            args: args
        })
    });
    
    return await response.json();
}

// Example: Create binding
sendCommand('createBinding', ['x', 'global'])
    .then(result => console.log('Result:', result))
    .catch(error => console.error('Error:', error));
```

### Querying Events

**GET /events**:
```javascript
async function queryEvents(query) {
    const params = new URLSearchParams(query);
    const response = await fetch(`http://localhost:8080/api/v1/events?${params}`);
    return await response.json();
}

// Example: Query events
queryEvents({ type: 'binding-created', since: '1234567890' })
    .then(events => console.log('Events:', events));
```

## JavaScript Client Library

### DANL Client Class

**Complete client**:
```javascript
class DANLClient {
    constructor(options = {}) {
        this.wsUrl = options.wsUrl || 'ws://localhost:8080/ws';
        this.apiUrl = options.apiUrl || 'http://localhost:8080/api/v1';
        this.ws = null;
        this.listeners = new Map();
    }
    
    connect() {
        this.ws = new WebSocketClient(this.wsUrl);
        
        this.ws.on('s-expression', (event) => {
            this.emit('event', event);
        });
        
        this.ws.on('network-update', (update) => {
            this.emit('network', update);
        });
        
        this.ws.on('consensus-result', (result) => {
            this.emit('consensus', result);
        });
        
        return new Promise((resolve, reject) => {
            this.ws.on('connected', () => resolve());
            this.ws.on('error', (error) => reject(error));
        });
    }
    
    async sendCommand(functor, args) {
        const response = await fetch(`${this.apiUrl}/commands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ functor, args })
        });
        return await response.json();
    }
    
    async queryEvents(query) {
        const params = new URLSearchParams(query);
        const response = await fetch(`${this.apiUrl}/events?${params}`);
        return await response.json();
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
    }
}
```

### Usage Example

**Using the client**:
```javascript
const client = new DANLClient();

await client.connect();

// Listen for events
client.on('event', (event) => {
    console.log('Event received:', event);
});

// Send command
await client.sendCommand('createBinding', ['x', 'global']);

// Query events
const events = await client.queryEvents({ type: 'binding-created' });
```

## Real-Time Updates

### Network State Updates

**Listen for network updates**:
```javascript
client.on('network', (update) => {
    // Update UI with network state
    updateNetworkVisualization(update.nodes);
    updateConsensusStatus(update.consensus);
});
```

### Epistemic Updates

**Listen for epistemic updates**:
```javascript
client.on('event', (event) => {
    if (event.type === 'epistemic-updated') {
        updateEpistemicDisplay(event.payload);
    }
});
```

## React Integration

### React Hook

**useDANL hook**:
```javascript
import { useState, useEffect } from 'react';

function useDANL(options) {
    const [client, setClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState([]);
    
    useEffect(() => {
        const danlClient = new DANLClient(options);
        
        danlClient.connect().then(() => {
            setClient(danlClient);
            setConnected(true);
        });
        
        danlClient.on('event', (event) => {
            setEvents(prev => [...prev, event]);
        });
        
        return () => {
            danlClient.disconnect();
        };
    }, []);
    
    return { client, connected, events };
}
```

**Using the hook**:
```javascript
function MyComponent() {
    const { client, connected, events } = useDANL();
    
    const handleCreateBinding = async () => {
        await client.sendCommand('createBinding', ['x', 'global']);
    };
    
    return (
        <div>
            <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
            <button onClick={handleCreateBinding}>Create Binding</button>
            <ul>
                {events.map((event, i) => (
                    <li key={i}>{event.type}</li>
                ))}
            </ul>
        </div>
    );
}
```

## Vue Integration

### Vue Plugin

**Vue plugin**:
```javascript
import { DANLClient } from './danl-client.js';

const DANLPlugin = {
    install(app, options) {
        const client = new DANLClient(options);
        
        app.config.globalProperties.$danl = client;
        app.provide('danl', client);
    }
};

export default DANLPlugin;
```

**Using in component**:
```vue
<template>
  <div>
    <p>Status: {{ connected ? 'Connected' : 'Disconnected' }}</p>
    <button @click="createBinding">Create Binding</button>
  </div>
</template>

<script>
import { inject, onMounted, ref } from 'vue';

export default {
    setup() {
        const client = inject('danl');
        const connected = ref(false);
        
        onMounted(async () => {
            await client.connect();
            connected.value = true;
        });
        
        const createBinding = async () => {
            await client.sendCommand('createBinding', ['x', 'global']);
        };
        
        return { connected, createBinding };
    }
};
</script>
```

## Error Handling

### Connection Errors

**Handle connection errors**:
```javascript
client.on('error', (error) => {
    console.error('DANL error:', error);
    
    if (error.type === 'connection') {
        // Retry connection
        setTimeout(() => client.connect(), 1000);
    }
});
```

### Command Errors

**Handle command errors**:
```javascript
try {
    const result = await client.sendCommand('createBinding', ['x', 'global']);
    if (result.error) {
        console.error('Command error:', result.error);
    }
} catch (error) {
    console.error('Request failed:', error);
}
```

## Authentication

### Token-Based Auth

**Add authentication**:
```javascript
class AuthenticatedDANLClient extends DANLClient {
    constructor(options) {
        super(options);
        this.token = options.token;
    }
    
    async sendCommand(functor, args) {
        const response = await fetch(`${this.apiUrl}/commands`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ functor, args })
        });
        
        if (response.status === 401) {
            // Token expired, refresh
            await this.refreshToken();
            return this.sendCommand(functor, args);
        }
        
        return await response.json();
    }
}
```

## Best Practices

### Performance

1. **Batch commands** - Send multiple commands together
2. **Debounce updates** - Don't update UI on every event
3. **Filter events** - Only subscribe to needed events
4. **Use caching** - Cache frequently accessed data

### Security

1. **Use HTTPS/WSS** - Encrypt connections
2. **Validate inputs** - Validate all user inputs
3. **Sanitize data** - Sanitize data before display
4. **Handle errors** - Graceful error handling

## Implementation Files

The following files in the `web-ui/` directory provide complete implementations:

- **`web-ui/websocket-client.js`** - WebSocket client with reconnection, event handling, and M-expression submission
- **`web-ui/app.js`** - Main application controller with network visualization, epistemic state updates, and consensus monitoring
- **`web-ui/index.html`** - Complete HTML interface with ARIA accessibility, custom elements, and semantic structure
- **`web-ui/components/status-card.js`** - Web component for status cards
- **`web-ui/styles.css`** - W3C CSS3 compliant styling

**Example: Using the actual implementation**:
```javascript
// From web-ui/app.js - Initialize DANL application
const app = new DANLApplication();

// Handle M-expression form submission
document.getElementById('m-expr-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const mExpr = document.getElementById('m-expr-input').value;
    
    // Submit via WebSocket
    app.ws.submitMExpression(mExpr);
    
    // Display compiled S-expression
    const compiled = compileMExpression(mExpr);
    document.getElementById('s-expr-content').textContent = compiled;
});
```

## Visual Interface

The `web-ui/index.html` provides a complete visual interface including:

- **Network Status Panel** - Active nodes, geometric level, consensus threshold
- **M-Expression Command Interface** - Submit commands with quick templates
- **Network Visualization** - SVG-based network topology visualization
- **Epistemic State Monitor** - KK, KU, UK, UU displays with observable parameters
- **Consensus Monitor** - Real-time consensus status and agreement ratios
- **Event Stream** - Live S-expression event log
- **Vector Clock Visualization** - Causal ordering display

All components use W3C standards (HTML5, ARIA, Web Components) for accessibility and compatibility.

## Next Steps

- **Learn integration patterns**: [Integration Patterns](../applied/integration-patterns.md) - More patterns
- **See database**: [Database Integration](database-integration.md) - Database integration
- **Check API**: [API Reference](api-reference.md) - Complete API
- **Explore UI**: Check `web-ui/` directory for complete implementation

## Related Resources

- [Integration Patterns](../applied/integration-patterns.md) - Integration patterns
- [API Reference](api-reference.md) - Complete API reference
- [First Automaton](first-automaton.md) - Automaton tutorial
- [Web UI Source](../web-ui/) - Complete web UI implementation
