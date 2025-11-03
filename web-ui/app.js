/**
 * DANL Web Application - Main Controller
 * Uses W3C DOM, Fetch, WebSocket, and Custom Elements APIs
 */

import { WebSocketClient } from './websocket-client.js';

class DANLApplication {
    constructor() {
        this.ws = null;
        this.eventStore = [];
        this.networkState = {
            nodes: [],
            edges: [],
            geometricLevel: 'tetrahedron',
            consensusThreshold: 0.75
        };
        this.epistemicState = {
            kk: 0,
            ku: 0,
            uk: 0,
            uu: 0
        };
        
        // W3C Page Visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden - pausing updates');
            } else {
                console.log('Page visible - resuming updates');
            }
        });
        
        this.init();
    }
    
    async init() {
        console.log('Initializing DANL Application...');
        
        // Wait for DOM to be ready (W3C DOMContentLoaded)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Initialize WebSocket connection
        this.initWebSocket();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize network visualization
        this.initNetworkVisualization();
        
        // Start status updates
        this.startStatusUpdates();
        
        // Load initial state from server
        this.loadInitialState();
        
        console.log('DANL Application initialized successfully');
    }
    
    initWebSocket() {
        // Connect to WebSocket server (W3C WebSocket API)
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
    
    setupEventListeners() {
        // M-Expression form submission
        const form = document.getElementById('m-expr-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleMExprSubmit(e));
        }
        
        // Quick command buttons
        const quickCmdButtons = document.querySelectorAll('[data-template]');
        quickCmdButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.getAttribute('data-template');
                document.getElementById('m-expr-input').value = template;
            });
        });
        
        // Network visualization controls
        const addNodeBtn = document.getElementById('add-node-btn');
        if (addNodeBtn) {
            addNodeBtn.addEventListener('click', () => this.addNode());
        }
        
        const addEdgeBtn = document.getElementById('add-edge-btn');
        if (addEdgeBtn) {
            addEdgeBtn.addEventListener('click', () => this.addHyperedge());
        }
        
        const layoutBtn = document.getElementById('layout-btn');
        if (layoutBtn) {
            layoutBtn.addEventListener('click', () => this.autoLayoutNetwork());
        }
        
        // Event stream controls
        const pauseStreamBtn = document.getElementById('pause-stream-btn');
        if (pauseStreamBtn) {
            pauseStreamBtn.addEventListener('click', () => this.toggleEventStream());
        }
        
        const clearStreamBtn = document.getElementById('clear-stream-btn');
        if (clearStreamBtn) {
            clearStreamBtn.addEventListener('click', () => this.clearEventStream());
        }
        
        const exportStreamBtn = document.getElementById('export-stream-btn');
        if (exportStreamBtn) {
            exportStreamBtn.addEventListener('click', () => this.exportEvents());
        }
    }
    
    async handleMExprSubmit(event) {
        event.preventDefault();
        
        const input = document.getElementById('m-expr-input');
        const mExpr = input.value.trim();
        
        if (!mExpr) {
            this.showNotification('Please enter an M-expression', 'warning');
            return;
        }
        
        try {
            // Send M-expression to server via Fetch API (W3C Fetch spec)
            const response = await fetch('/api/m-expression', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mExpr })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Display compiled S-expression
            this.displaySExpression(result.sExpr);
            
            // Show success notification
            this.showNotification('M-expression compiled successfully', 'success');
            
            // Clear input
            input.value = '';
            
        } catch (error) {
            console.error('Error submitting M-expression:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }
    
    displaySExpression(sExpr) {
        const output = document.getElementById('s-expr-content');
        if (output) {
            output.textContent = JSON.stringify(sExpr, null, 2);
        }
    }
    
    handleSExpression(event) {
        // Add to event store
        this.eventStore.push(event);
        
        // Display in event log
        this.addEventToLog(event);
        
        // Update counters
        this.updateEventCount();
    }
    
    addEventToLog(event) {
        const eventLog = document.getElementById('event-log');
        if (!eventLog) return;
        
        // Create event entry element
        const entry = document.createElement('div');
        entry.className = 'event-entry';
        entry.setAttribute('role', 'listitem');
        
        const timestamp = new Date(event.timestamp).toISOString();
        
        entry.innerHTML = `
            <div class="event-timestamp">${timestamp}</div>
            <div class="event-type">${event.type}</div>
            <div class="event-data">${JSON.stringify(event.data, null, 2)}</div>
        `;
        
        // Add to log (prepend for reverse chronological order)
        eventLog.insertBefore(entry, eventLog.firstChild);
        
        // Limit log size (keep last 100 events)
        while (eventLog.children.length > 100) {
            eventLog.removeChild(eventLog.lastChild);
        }
    }
    
    handleNetworkUpdate(data) {
        this.networkState = { ...this.networkState, ...data };
        this.updateNetworkVisualization();
        this.updateNetworkStatus();
    }
    
    handleEpistemicUpdate(data) {
        this.epistemicState = { ...this.epistemicState, ...data };
        this.updateEpistemicDisplay();
    }
    
    updateEpistemicDisplay() {
        const { kk, ku, uk, uu } = this.epistemicState;
        const total = kk + ku + uk + uu;
        
        // Update values
        document.getElementById('kk-value').textContent = kk;
        document.getElementById('ku-value').textContent = ku;
        document.getElementById('uk-value').textContent = uk;
        document.getElementById('uu-value').textContent = uu;
        
        // Update progress bars
        if (total > 0) {
            const kkPercent = (kk / total) * 100;
            const kuPercent = (ku / total) * 100;
            const ukPercent = (uk / total) * 100;
            const uuPercent = (uu / total) * 100;
            
            this.updateProgressBar('.kk-bar', kkPercent);
            this.updateProgressBar('.ku-bar', kuPercent);
            this.updateProgressBar('.uk-bar', ukPercent);
            this.updateProgressBar('.uu-bar', uuPercent);
        }
        
        // Compute observable parameters
        const vertices = this.getVertexCount();
        const phi = this.eulerPhi(vertices);
        const innerDim = vertices / phi;
        
        const tauUK = uk * phi;
        const tauUU = uu * innerDim;
        
        const certainty = kk > 0 ? kk / (1 + tauUK / kk) : 0;
        const confidence = ku > 0 ? ku / (1 + tauUU / ku) : 0;
        
        // Update observable parameters display
        document.getElementById('tau-uk').textContent = tauUK.toFixed(2);
        document.getElementById('tau-uu').textContent = tauUU.toFixed(2);
        document.getElementById('phi-value').textContent = phi;
        document.getElementById('certainty-value').textContent = certainty.toFixed(3);
        document.getElementById('confidence-value').textContent = confidence.toFixed(3);
    }
    
    updateProgressBar(selector, percent) {
        const bar = document.querySelector(selector);
        if (bar) {
            bar.style.width = `${percent}%`;
            bar.setAttribute('aria-valuenow', percent.toFixed(0));
        }
    }
    
    // Euler's totient function
    eulerPhi(n) {
        let result = n;
        for (let p = 2; p * p <= n; p++) {
            if (n % p === 0) {
                while (n % p === 0) n /= p;
                result -= result / p;
            }
        }
        if (n > 1) result -= result / n;
        return Math.floor(result);
    }
    
    getVertexCount() {
        const level = this.networkState.geometricLevel;
        const vertices = {
            'tetrahedron': 4,
            'cube': 8,
            'icosahedron': 12,
            'dodecahedron': 20,
            '600-cell': 120
        };
        return vertices[level] || 4;
    }
    
    initNetworkVisualization() {
        // Initialize SVG network visualization
        const svg = document.getElementById('network-canvas');
        if (!svg) return;
        
        // Get SVG namespace (W3C SVG spec)
        const svgNS = 'http://www.w3.org/2000/svg';
        
        // Clear existing elements
        const nodesLayer = document.getElementById('nodes-layer');
        const edgesLayer = document.getElementById('edges-layer');
        const labelsLayer = document.getElementById('labels-layer');
        
        if (nodesLayer) nodesLayer.innerHTML = '';
        if (edgesLayer) edgesLayer.innerHTML = '';
        if (labelsLayer) labelsLayer.innerHTML = '';
    }
    
    updateNetworkVisualization() {
        // Redraw network based on current state
        const { nodes, edges } = this.networkState;
        
        // Use force-directed layout algorithm
        this.layoutNetwork(nodes, edges);
    }
    
    layoutNetwork(nodes, edges) {
        // Simple circular layout for now
        const svg = document.getElementById('network-canvas');
        if (!svg) return;
        
        const width = 800;
        const height = 600;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        const svgNS = 'http://www.w3.org/2000/svg';
        const nodesLayer = document.getElementById('nodes-layer');
        const edgesLayer = document.getElementById('edges-layer');
        const labelsLayer = document.getElementById('labels-layer');
        
        if (!nodesLayer || !edgesLayer || !labelsLayer) return;
        
        // Clear layers
        nodesLayer.innerHTML = '';
        edgesLayer.innerHTML = '';
        labelsLayer.innerHTML = '';
        
        // Position nodes in circle
        nodes.forEach((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
        });
        
        // Draw edges
        edges.forEach(edge => {
            const line = document.createElementNS(svgNS, 'line');
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            
            if (source && target) {
                line.setAttribute('x1', source.x);
                line.setAttribute('y1', source.y);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
                line.setAttribute('class', 'network-edge');
                line.setAttribute('marker-end', 'url(#arrowhead)');
                edgesLayer.appendChild(line);
            }
        });
        
        // Draw nodes
        nodes.forEach(node => {
            const group = document.createElementNS(svgNS, 'g');
            group.setAttribute('class', 'network-node');
            group.setAttribute('role', 'button');
            group.setAttribute('aria-label', `Node ${node.id}`);
            group.setAttribute('tabindex', '0');
            
            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '25');
            circle.setAttribute('fill', 'url(#node-gradient)');
            
            group.appendChild(circle);
            nodesLayer.appendChild(group);
            
            // Add label
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', node.x);
            label.setAttribute('y', node.y + 40);
            label.setAttribute('class', 'node-label');
            label.textContent = node.id;
            labelsLayer.appendChild(label);
        });
    }
    
    addNode() {
        const nodeId = `node-${this.networkState.nodes.length + 1}`;
        this.networkState.nodes.push({ id: nodeId, x: 0, y: 0 });
        this.updateNetworkVisualization();
        this.updateNetworkStatus();
    }
    
    addHyperedge() {
        if (this.networkState.nodes.length < 2) {
            this.showNotification('Need at least 2 nodes to create edge', 'warning');
            return;
        }
        
        const source = this.networkState.nodes[0].id;
        const target = this.networkState.nodes[1].id;
        
        this.networkState.edges.push({ source, target });
        this.updateNetworkVisualization();
    }
    
    autoLayoutNetwork() {
        this.updateNetworkVisualization();
        this.showNotification('Network layout updated', 'info');
    }
    
    updateNetworkStatus() {
        const nodeCount = document.getElementById('node-count');
        if (nodeCount) {
            nodeCount.setAttribute('value', this.networkState.nodes.length);
        }
        
        const geometricLevel = document.getElementById('geometric-level');
        if (geometricLevel) {
            geometricLevel.setAttribute('value', this.networkState.geometricLevel);
        }
        
        const threshold = document.getElementById('consensus-threshold');
        if (threshold) {
            threshold.setAttribute('value', this.networkState.consensusThreshold.toFixed(2));
        }
    }
    
    updateEventCount() {
        const eventCount = document.getElementById('event-count');
        if (eventCount) {
            eventCount.setAttribute('value', this.eventStore.length);
        }
    }
    
    toggleEventStream() {
        const btn = document.getElementById('pause-stream-btn');
        if (!btn) return;
        
        const isPaused = btn.dataset.paused === 'true';
        
        if (isPaused) {
            btn.innerHTML = '<span class="btn-icon">⏸️</span> Pause';
            btn.dataset.paused = 'false';
        } else {
            btn.innerHTML = '<span class="btn-icon">▶️</span> Resume';
            btn.dataset.paused = 'true';
        }
    }
    
    clearEventStream() {
        const eventLog = document.getElementById('event-log');
        if (eventLog) {
            eventLog.innerHTML = '';
        }
        this.eventStore = [];
        this.updateEventCount();
    }
    
    exportEvents() {
        // Export events as JSON file using W3C File API
        const data = JSON.stringify(this.eventStore, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `danl-events-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification('Events exported successfully', 'success');
    }
    
    showNotification(message, type = 'info') {
        // Use W3C Notifications API if available
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('DANL', {
                body: message,
                icon: '/favicon.ico'
            });
        }
        
        // Also show in-app notification
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Could create a toast notification element here
    }
    
    startStatusUpdates() {
        // Update status every second
        setInterval(() => {
            this.updateNetworkStatus();
        }, 1000);
    }
    
    async loadInitialState() {
        try {
            // Load initial state from server (W3C Fetch API)
            const response = await fetch('/api/state');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const state = await response.json();
            
            this.networkState = { ...this.networkState, ...state.network };
            this.epistemicState = { ...this.epistemicState, ...state.epistemic };
            
            this.updateNetworkVisualization();
            this.updateEpistemicDisplay();
            this.updateNetworkStatus();
            
        } catch (error) {
            console.error('Error loading initial state:', error);
            // Use default mock state for demo
            this.loadMockState();
        }
    }
    
    loadMockState() {
        // Mock state for demonstration
        this.networkState.nodes = [
            { id: 'node-1', x: 400, y: 200 },
            { id: 'node-2', x: 600, y: 300 },
            { id: 'node-3', x: 400, y: 400 },
            { id: 'node-4', x: 200, y: 300 }
        ];
        
        this.networkState.edges = [
            { source: 'node-1', target: 'node-2' },
            { source: 'node-2', target: 'node-3' },
            { source: 'node-3', target: 'node-4' },
            { source: 'node-4', target: 'node-1' }
        ];
        
        this.epistemicState = {
            kk: 100,
            ku: 50,
            uk: 30,
            uu: 20
        };
        
        this.updateNetworkVisualization();
        this.updateEpistemicDisplay();
        this.updateNetworkStatus();
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.danlApp = new DANLApplication();
    });
} else {
    window.danlApp = new DANLApplication();
}

export default DANLApplication;
