---
id: configuration
title: "Configuration Guide"
level: practical
type: guide
tags: ["configuration", "setup", "settings", "environment"]
keywords: ["config", "configuration", "settings", "environment", "setup"]
prerequisites: ["dev-environment", "protocol-specs"]
enables: ["docker-deployment", "k8s-deployment"]
related: ["dev-environment", "protocol-specs"]
readingTime: 30
difficulty: 2
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Configuration Guide

> **Configure DANL for your environment**

Complete guide to configuring DANL systems, including environment variables, configuration files, and runtime settings.

## Configuration Files

### Scheme Configuration

**`config.scm`**:
```scheme
;;; DANL Configuration

(define danl-config
  '((network
      (nodes . 4)
      (geometry . tetrahedron)
      (threshold . 0.75))
    
    (epistemic
      (initial-kk . 100)
      (initial-ku . 50)
      (initial-uk . 30)
      (initial-uu . 20))
    
    (consensus
      (geometry-selection . auto)
      (tau-local . 0.7)
      (tau-federated . 0.4))
    
    (vector-clock
      (sync-interval . 1)
      (max-drift . 1000))
    
    (hypergraph
      (max-hyperedges . 100)
      (max-members . 10))))
```

**Load configuration**:
```scheme
(load "config.scm")

;; Access config
(define network-nodes (cdr (assoc 'nodes (cdr (assoc 'network danl-config)))))
```

### YAML Configuration

**`config.yaml`**:
```yaml
network:
  nodes: 4
  geometry: tetrahedron
  threshold: 0.75

epistemic:
  initial:
    kk: 100
    ku: 50
    uk: 30
    uu: 20

consensus:
  geometry-selection: auto
  tau-local: 0.7
  tau-federated: 0.4

vector-clock:
  sync-interval: 1
  max-drift: 1000

hypergraph:
  max-hyperedges: 100
  max-members: 10

database:
  type: postgresql
  host: localhost
  port: 5432
  database: danl
  user: danl_user
  password: ${DB_PASSWORD}

websocket:
  port: 8080
  path: /ws
  protocol: danl-protocol/1.0

api:
  port: 8080
  base-path: /api/v1
```

## Environment Variables

### Core Variables

**Required**:
```bash
# Network configuration
DANL_NODE_ID=node-1
DANL_NODES=4
DANL_GEOMETRY=tetrahedron

# Database
DANL_DB_TYPE=postgresql
DANL_DB_HOST=localhost
DANL_DB_PORT=5432
DANL_DB_NAME=danl
DANL_DB_USER=danl_user
DANL_DB_PASSWORD=secret

# API
DANL_API_PORT=8080
DANL_WS_PORT=8080
```

### Optional Variables

**Optional**:
```bash
# Logging
DANL_LOG_LEVEL=info
DANL_LOG_FILE=/var/log/danl.log

# Performance
DANL_MAX_EVENTS=10000
DANL_SNAPSHOT_INTERVAL=1000

# Security
DANL_TLS_ENABLED=true
DANL_TLS_CERT=/path/to/cert.pem
DANL_TLS_KEY=/path/to/key.pem
```

## Network Configuration

### Node Configuration

**Node settings**:
```yaml
nodes:
  - id: node-1
    host: localhost
    port: 8081
    geometry: tetrahedron
  
  - id: node-2
    host: localhost
    port: 8082
    geometry: tetrahedron
  
  - id: node-3
    host: localhost
    port: 8083
    geometry: tetrahedron
  
  - id: node-4
    host: localhost
    port: 8084
    geometry: tetrahedron
```

### Hypergraph Configuration

**Hypergraph settings**:
```yaml
hypergraph:
  edges:
    - id: e1
      members: [node-1, node-2, node-3]
    - id: e2
      members: [node-2, node-3, node-4]
```

## Consensus Configuration

### Geometry Selection

**Auto selection**:
```yaml
consensus:
  geometry-selection: auto
  tau-local: 0.7
  tau-federated: 0.4
```

**Manual selection**:
```yaml
consensus:
  geometry-selection: manual
  geometry: tetrahedron
  threshold: 0.75
```

### Thresholds

**Threshold configuration**:
```yaml
thresholds:
  tetrahedron: 0.75
  cube: 0.50
  octahedron: 0.50
  icosahedron: 0.25
  dodecahedron: 0.25
  '600-cell': 0.025
```

## Database Configuration

### PostgreSQL

**PostgreSQL config**:
```yaml
database:
  type: postgresql
  host: localhost
  port: 5432
  database: danl
  user: danl_user
  password: ${DB_PASSWORD}
  pool-size: 10
  max-connections: 100
```

### SQLite

**SQLite config**:
```yaml
database:
  type: sqlite
  path: /var/lib/danl/events.db
  journal-mode: WAL
```

### MongoDB

**MongoDB config**:
```yaml
database:
  type: mongodb
  uri: mongodb://localhost:27017
  database: danl
  collection: events
```

## API Configuration

### REST API

**REST API config**:
```yaml
api:
  port: 8080
  base-path: /api/v1
  cors:
    enabled: true
    origins: ["http://localhost:3000"]
  rate-limit:
    enabled: true
    requests-per-minute: 100
```

### WebSocket

**WebSocket config**:
```yaml
websocket:
  port: 8080
  path: /ws
  protocol: danl-protocol/1.0
  ping-interval: 30
  max-connections: 1000
```

## Security Configuration

### TLS Configuration

**TLS config**:
```yaml
tls:
  enabled: true
  cert-file: /path/to/cert.pem
  key-file: /path/to/key.pem
  ca-file: /path/to/ca.pem
  mutual: true
  min-version: "1.3"
```

### Authentication

**Auth config**:
```yaml
auth:
  type: token
  token-secret: ${AUTH_SECRET}
  token-expiry: 3600
```

## Logging Configuration

### Log Levels

**Log config**:
```yaml
logging:
  level: info
  format: json
  output:
    - type: file
      path: /var/log/danl.log
    - type: stdout
  rotation:
    max-size: 100MB
    max-files: 10
```

## Performance Configuration

### Caching

**Cache config**:
```yaml
cache:
  enabled: true
  type: redis
  host: localhost
  port: 6379
  ttl: 3600
```

### Snapshot Configuration

**Snapshot config**:
```yaml
snapshots:
  enabled: true
  interval: 1000
  path: /var/lib/danl/snapshots
```

## Monitoring Configuration

### Metrics

**Metrics config**:
```yaml
metrics:
  enabled: true
  port: 9090
  path: /metrics
  interval: 10
```

### Tracing

**Tracing config**:
```yaml
tracing:
  enabled: true
  type: jaeger
  endpoint: http://localhost:14268/api/traces
```

## Runtime Configuration

### Scheme Runtime

**Load config**:
```scheme
;;; Load configuration
(define (load-config config-file)
  (let ((config (read-config-file config-file)))
    (set! danl-config config)))

;;; Access config
(define (get-config key)
  (cdr (assoc key danl-config)))
```

### Prolog Runtime

**Load config**:
```prolog
:- use_module(config).

% Access config
get_config(Key, Value) :-
    config(Key, Value).
```

## Configuration Validation

### Validate Configuration

**Validation script**:
```python
import yaml
import jsonschema

def validate_config(config_file):
    """Validate configuration file"""
    with open(config_file) as f:
        config = yaml.safe_load(f)
    
    schema = load_schema('config-schema.json')
    jsonschema.validate(config, schema)
    
    return config
```

## Best Practices

### Configuration Management

1. **Use environment variables** - Sensitive data in env vars
2. **Validate configs** - Validate on startup
3. **Document defaults** - Document all defaults
4. **Version configs** - Version control configs
5. **Separate environments** - Separate dev/prod configs

### Security

1. **Don't commit secrets** - Use environment variables
2. **Use secrets management** - Use Vault, AWS Secrets Manager
3. **Rotate credentials** - Regular credential rotation
4. **Encrypt sensitive data** - Encrypt at rest

## Next Steps

- **Learn deployment**: [Docker Deployment](docker-deployment.md) - Docker setup
- **See Kubernetes**: [Kubernetes Deployment](k8s-deployment.md) - K8s setup
- **Check performance**: [Performance Tuning](performance-tuning.md) - Performance

## Related Resources

- [Dev Environment](dev-environment.md) - Environment setup
- [Protocol Specs](protocol-specs.md) - Protocol details
- [Docker Deployment](docker-deployment.md) - Docker config
