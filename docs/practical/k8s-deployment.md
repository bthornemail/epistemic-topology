---
id: k8s-deployment
title: "Kubernetes Deployment"
level: practical
type: guide
tags: ["kubernetes", "k8s", "deployment", "orchestration"]
keywords: ["kubernetes", "k8s", "deployment", "helm", "yaml"]
prerequisites: ["docker-deployment", "configuration"]
enables: ["monitoring", "scaling"]
related: ["docker-deployment", "ha-patterns"]
readingTime: 45
difficulty: 4
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Kubernetes Deployment

> **Deploy DANL on Kubernetes**

Complete guide to deploying DANL on Kubernetes, including deployments, services, configmaps, secrets, and Helm charts.

## Deployment

### Basic Deployment

**`deployment.yaml`**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: danl-node-1
  labels:
    app: danl
    node: node-1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: danl
      node: node-1
  template:
    metadata:
      labels:
        app: danl
        node: node-1
    spec:
      containers:
      - name: danl
        image: danl:latest
        ports:
        - containerPort: 8080
        env:
        - name: DANL_NODE_ID
          value: "node-1"
        - name: DANL_NODES
          value: "4"
        - name: DANL_GEOMETRY
          value: "tetrahedron"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Multi-Node Deployment

**`deployment-multi.yaml`**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: danl-nodes
spec:
  replicas: 4
  selector:
    matchLabels:
      app: danl
  template:
    metadata:
      labels:
        app: danl
    spec:
      containers:
      - name: danl
        image: danl:latest
        ports:
        - containerPort: 8080
        env:
        - name: DANL_NODES
          value: "4"
        - name: DANL_GEOMETRY
          value: "tetrahedron"
        - name: DANL_NODE_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
```

## Service

### ClusterIP Service

**`service.yaml`**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: danl-service
spec:
  selector:
    app: danl
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
```

### LoadBalancer Service

**`service-lb.yaml`**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: danl-loadbalancer
spec:
  selector:
    app: danl
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: LoadBalancer
```

### Headless Service

**`service-headless.yaml`**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: danl-headless
spec:
  clusterIP: None
  selector:
    app: danl
  ports:
  - port: 8080
    targetPort: 8080
```

## ConfigMap

### Configuration Map

**`configmap.yaml`**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: danl-config
data:
  config.yaml: |
    network:
      nodes: 4
      geometry: tetrahedron
    
    consensus:
      geometry-selection: auto
      tau-local: 0.7
      tau-federated: 0.4
    
    vector-clock:
      sync-interval: 1
      max-drift: 1000
```

**Use in deployment**:
```yaml
spec:
  containers:
  - name: danl
    volumeMounts:
    - name: config
      mountPath: /app/config
  volumes:
  - name: config
    configMap:
      name: danl-config
```

## Secrets

### Secret Definition

**`secret.yaml`**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: danl-secrets
type: Opaque
stringData:
  db-password: secret_password
  api-key: secret_api_key
```

**Use in deployment**:
```yaml
spec:
  containers:
  - name: danl
    env:
    - name: DANL_DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: danl-secrets
          key: db-password
```

## StatefulSet

### StatefulSet for DANL

**`statefulset.yaml`**:
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: danl-nodes
spec:
  serviceName: danl-headless
  replicas: 4
  selector:
    matchLabels:
      app: danl
  template:
    metadata:
      labels:
        app: danl
    spec:
      containers:
      - name: danl
        image: danl:latest
        ports:
        - containerPort: 8080
        env:
        - name: DANL_NODE_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        volumeMounts:
        - name: data
          mountPath: /app/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

## Helm Chart

### Chart Structure

**`Chart.yaml`**:
```yaml
apiVersion: v2
name: danl
description: Decentralized Automaton Network Lattice
version: 1.0.0
appVersion: "1.0.0"
```

**`values.yaml`**:
```yaml
replicaCount: 4

image:
  repository: danl
  tag: latest
  pullPolicy: IfNotPresent

network:
  nodes: 4
  geometry: tetrahedron

consensus:
  geometry-selection: auto
  tau-local: 0.7
  tau-federated: 0.4

database:
  type: postgresql
  host: postgres
  port: 5432

service:
  type: ClusterIP
  port: 8080

ingress:
  enabled: false
  annotations: {}
  hosts:
    - host: danl.example.com
      paths: ["/"]
```

**`templates/deployment.yaml`**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "danl.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "danl.name" . }}
  template:
    metadata:
      labels:
        app: {{ include "danl.name" . }}
    spec:
      containers:
      - name: danl
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: 8080
        env:
        - name: DANL_NODES
          value: "{{ .Values.network.nodes }}"
        - name: DANL_GEOMETRY
          value: "{{ .Values.network.geometry }}"
```

## Ingress

### Ingress Configuration

**`ingress.yaml`**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: danl-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: danl.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: danl-service
            port:
              number: 8080
```

## Horizontal Pod Autoscaler

### HPA Configuration

**`hpa.yaml`**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: danl-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: danl-nodes
  minReplicas: 4
  maxReplicas: 12
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Persistent Volumes

### PVC Configuration

**`pvc.yaml`**:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: danl-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

## Deployment Steps

### Apply Manifests

**Deploy**:
```bash
# Apply all manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Check status
kubectl get pods
kubectl get services
```

### Helm Deployment

**Install with Helm**:
```bash
# Install
helm install danl ./helm-chart

# Upgrade
helm upgrade danl ./helm-chart

# Uninstall
helm uninstall danl
```

## Monitoring

### ServiceMonitor

**`servicemonitor.yaml`**:
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: danl-monitor
spec:
  selector:
    matchLabels:
      app: danl
  endpoints:
  - port: 8080
    path: /metrics
    interval: 30s
```

## Best Practices

### Resource Management

1. **Set requests and limits** - CPU and memory
2. **Use HPA** - Auto-scale based on metrics
3. **Monitor resources** - Track usage

### High Availability

1. **Multiple replicas** - Distribute across nodes
2. **Pod disruption budgets** - Maintain availability
3. **Anti-affinity** - Spread pods across nodes

## Next Steps

- **Learn monitoring**: [Monitoring](monitoring.md) - Monitoring setup
- **See scaling**: [Scaling](scaling.md) - Scaling strategies
- **Check HA**: [HA Patterns](ha-patterns.md) - High availability

## Related Resources

- [Docker Deployment](docker-deployment.md) - Docker setup
- [HA Patterns](ha-patterns.md) - High availability
- [Scaling](scaling.md) - Scaling strategies
