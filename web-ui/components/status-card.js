/**
 * DANL Status Card - W3C Web Component
 * Implements Custom Elements v1 specification
 */

class DANLStatusCard extends HTMLElement {
    constructor() {
        super();
        
        // Attach shadow DOM for encapsulation (W3C Shadow DOM spec)
        this.attachShadow({ mode: 'open' });
    }
    
    // Observed attributes (W3C Custom Elements spec)
    static get observedAttributes() {
        return ['label', 'value', 'icon'];
    }
    
    // Lifecycle callback: element connected to DOM
    connectedCallback() {
        this.render();
    }
    
    // Lifecycle callback: attribute changed
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }
    
    // Getter/setter for value property
    get value() {
        return this.getAttribute('value') || '0';
    }
    
    set value(val) {
        this.setAttribute('value', val);
    }
    
    render() {
        const label = this.getAttribute('label') || 'Status';
        const value = this.getAttribute('value') || '0';
        const icon = this.getAttribute('icon') || '📊';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    min-height: 120px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                }
                
                .card-label {
                    font-size: 0.875rem;
                    opacity: 0.9;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .card-icon {
                    font-size: 2rem;
                    opacity: 0.8;
                }
                
                .card-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    line-height: 1;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .card {
                        transition: none;
                    }
                }
            </style>
            
            <div class="card" role="region" aria-label="${label} status">
                <div class="card-header">
                    <div class="card-label">${label}</div>
                    <div class="card-icon" aria-hidden="true">${icon}</div>
                </div>
                <div class="card-value" aria-live="polite">${value}</div>
            </div>
        `;
    }
}

// Register the custom element (W3C Custom Elements Registry)
if (!customElements.get('danl-status-card')) {
    customElements.define('danl-status-card', DANLStatusCard);
}

export default DANLStatusCard;
