/**
 * DANL WebSocket Client
 * W3C WebSocket API implementation for real-time S-expression streaming
 */

export class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // ms
        this.listeners = new Map();
        
        this.connect();
    }
    
    connect() {
        try {
            console.log(`Connecting to WebSocket: ${this.url}`);
            
            // Create WebSocket connection (W3C WebSocket API)
            this.ws = new WebSocket(this.url);
            
            // Setup event handlers
            this.ws.addEventListener('open', (event) => this.handleOpen(event));
            this.ws.addEventListener('message', (event) => this.handleMessage(event));
            this.ws.addEventListener('error', (event) => this.handleError(event));
            this.ws.addEventListener('close', (event) => this.handleClose(event));
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.scheduleReconnect();
        }
    }
    
    handleOpen(event) {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send initial handshake
        this.send({
            type: 'handshake',
            version: '1.0',
            capabilities: ['s-expressions', 'network-updates', 'epistemic-updates']
        });
        
        this.emit('connected', { timestamp: Date.now() });
    }
    
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            console.log('WebSocket message received:', data.type);
            
            // Route message to appropriate handler
            switch (data.type) {
                case 's-expression':
                    this.emit('s-expression', data.payload);
                    break;
                    
                case 'network-update':
                    this.emit('network-update', data.payload);
                    break;
                    
                case 'epistemic-update':
                    this.emit('epistemic-update', data.payload);
                    break;
                    
                case 'consensus-result':
                    this.emit('consensus-result', data.payload);
                    break;
                    
                case 'error':
                    this.emit('error', data.payload);
                    break;
                    
                default:
                    console.warn('Unknown message type:', data.type);
            }
            
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }
    
    handleError(event) {
        console.error('WebSocket error:', event);
        this.emit('error', { error: 'WebSocket error occurred' });
    }
    
    handleClose(event) {
        console.log('WebSocket closed:', event.code, event.reason);
        
        this.emit('disconnected', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
        });
        
        // Attempt reconnection if not a clean close
        if (!event.wasClean) {
            this.scheduleReconnect();
        }
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('reconnect-failed', {
                attempts: this.reconnectAttempts
            });
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify(data);
            this.ws.send(message);
            return true;
        } else {
            console.warn('WebSocket not open, cannot send message');
            return false;
        }
    }
    
    // Submit M-expression command
    submitMExpression(mExpr) {
        return this.send({
            type: 'm-expression',
            payload: { mExpr }
        });
    }
    
    // Query epistemic state
    queryEpistemicState(nodeId) {
        return this.send({
            type: 'query',
            payload: {
                query: 'epistemic-state',
                args: [nodeId]
            }
        });
    }
    
    // Event emitter pattern
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
    }
    
    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            const callbacks = this.listeners.get(eventName);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(eventName, data) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }
    
    close() {
        if (this.ws) {
            this.ws.close(1000, 'Client closing connection');
        }
    }
    
    // Get connection state (W3C WebSocket states)
    getState() {
        if (!this.ws) return 'CLOSED';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'CONNECTING';
            case WebSocket.OPEN:
                return 'OPEN';
            case WebSocket.CLOSING:
                return 'CLOSING';
            case WebSocket.CLOSED:
                return 'CLOSED';
            default:
                return 'UNKNOWN';
        }
    }
    
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

export default WebSocketClient;
