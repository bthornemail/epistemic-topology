---
id: docker-deployment
title: "Docker Deployment"
level: practical
type: guide
tags: ["docker", "deployment", "containerization", "dockerfile"]
keywords: ["docker", "container", "deployment", "dockerfile", "docker-compose"]
prerequisites: ["configuration", "dev-environment"]
enables: ["k8s-deployment"]
related: ["configuration", "k8s-deployment"]
readingTime: 35
difficulty: 3
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Docker Deployment

> **Deploy DANL using Docker containers**

Complete guide to containerizing and deploying DANL using Docker, including Dockerfiles, docker-compose, and best practices.

## Dockerfile

### Base Dockerfile

**`Dockerfile`**:
```dockerfile
FROM guile:3.0

# Install dependencies
RUN apt-get update && apt-get install -y \
    swi-prolog \
    souffle \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy DANL files
COPY danl-core.scm .
COPY danl-rules.pl .
COPY danl-queries.dl .
COPY config.scm .

# Expose ports
EXPOSE 8080

# Run DANL
CMD ["guile", "-s", "danl-core.scm"]
```

### Multi-Stage Build

**Optimized Dockerfile**:
```dockerfile
# Stage 1: Build
FROM guile:3.0 as builder

WORKDIR /build

COPY danl-core.scm .
COPY danl-rules.pl .
COPY danl-queries.dl .

# Compile if needed
RUN guile -c "(compile-file \"danl-core.scm\")"

# Stage 2: Runtime
FROM guile:3.0

RUN apt-get update && apt-get install -y \
    swi-prolog \
    souffle \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /build/*.go .
COPY danl-core.scm danl-rules.pl danl-queries.dl .
COPY config.scm .

EXPOSE 8080

CMD ["guile", "-s", "danl-core.scm"]
```

## Docker Compose

### Basic Compose

**`docker-compose.yml`**:
```yaml
version: '3.8'

services:
  danl-node-1:
    build: .
    ports:
      - "8081:8080"
    environment:
      - DANL_NODE_ID=node-1
      - DANL_NODES=4
      - DANL_GEOMETRY=tetrahedron
    volumes:
      - ./data/node-1:/app/data
  
  danl-node-2:
    build: .
    ports:
      - "8082:8080"
    environment:
      - DANL_NODE_ID=node-2
      - DANL_NODES=4
      - DANL_GEOMETRY=tetrahedron
    volumes:
      - ./data/node-2:/app/data
  
  danl-node-3:
    build: .
    ports:
      - "8083:8080"
    environment:
      - DANL_NODE_ID=node-3
      - DANL_NODES=4
      - DANL_GEOMETRY=tetrahedron
    volumes:
      - ./data/node-3:/app/data
  
  danl-node-4:
    build: .
    ports:
      - "8084:8080"
    environment:
      - DANL_NODE_ID=node-4
      - DANL_NODES=4
      - DANL_GEOMETRY=tetrahedron
    volumes:
      - ./data/node-4:/app/data
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=danl
      - POSTGRES_USER=danl_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres-data:
```

### Production Compose

**`docker-compose.prod.yml`**:
```yaml
version: '3.8'

services:
  danl-node-1:
    build: .
    image: danl:latest
    ports:
      - "8081:8080"
    environment:
      - DANL_NODE_ID=node-1
      - DANL_NODES=4
      - DANL_DB_TYPE=postgresql
      - DANL_DB_HOST=postgres
      - DANL_DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=danl
      - POSTGRES_USER=danl_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
```

## Build and Run

### Build Image

**Build**:
```bash
docker build -t danl:latest .
```

**Build with tag**:
```bash
docker build -t danl:1.0.0 .
```

### Run Container

**Run single container**:
```bash
docker run -d \
  --name danl-node-1 \
  -p 8081:8080 \
  -e DANL_NODE_ID=node-1 \
  -e DANL_NODES=4 \
  danl:latest
```

**Run with volumes**:
```bash
docker run -d \
  --name danl-node-1 \
  -p 8081:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/config.scm:/app/config.scm \
  danl:latest
```

### Docker Compose

**Start services**:
```bash
docker-compose up -d
```

**View logs**:
```bash
docker-compose logs -f danl-node-1
```

**Stop services**:
```bash
docker-compose down
```

## Networking

### Network Configuration

**Create network**:
```bash
docker network create danl-network
```

**Connect containers**:
```bash
docker network connect danl-network danl-node-1
docker network connect danl-network danl-node-2
```

**Docker Compose network**:
```yaml
networks:
  danl-network:
    driver: bridge

services:
  danl-node-1:
    networks:
      - danl-network
```

## Volumes

### Data Volumes

**Named volume**:
```yaml
volumes:
  danl-data:
    driver: local

services:
  danl-node-1:
    volumes:
      - danl-data:/app/data
```

**Bind mount**:
```yaml
services:
  danl-node-1:
    volumes:
      - ./data/node-1:/app/data
```

## Environment Variables

### Environment File

**`.env`**:
```bash
DANL_NODES=4
DANL_GEOMETRY=tetrahedron
DANL_DB_PASSWORD=secret_password
DANL_API_PORT=8080
```

**Use in docker-compose**:
```yaml
services:
  danl-node-1:
    env_file:
      - .env
    environment:
      - DANL_NODE_ID=node-1
```

## Health Checks

### Health Check Configuration

**Dockerfile**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

**docker-compose**:
```yaml
services:
  danl-node-1:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Security

### Non-Root User

**Dockerfile**:
```dockerfile
RUN useradd -m -u 1000 danl

USER danl

WORKDIR /app
```

### Security Scanning

**Scan image**:
```bash
docker scan danl:latest
```

## Multi-Architecture

### Build for Multiple Platforms

**Build**:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t danl:latest .
```

**Docker Compose**:
```yaml
services:
  danl-node-1:
    platform: linux/amd64
```

## Best Practices

### Image Optimization

1. **Use multi-stage builds** - Reduce image size
2. **Layer caching** - Order layers for caching
3. **Minimize layers** - Combine RUN commands
4. **Use .dockerignore** - Exclude unnecessary files

### Container Management

1. **Use health checks** - Monitor container health
2. **Set resource limits** - CPU and memory limits
3. **Use restart policies** - Auto-restart containers
4. **Log management** - Configure logging drivers

## Troubleshooting

### Common Issues

**Issue**: Container won't start
```bash
# Check logs
docker logs danl-node-1

# Check configuration
docker exec danl-node-1 cat /app/config.scm
```

**Issue**: Network connectivity
```bash
# Check network
docker network inspect danl-network

# Test connectivity
docker exec danl-node-1 ping danl-node-2
```

## Next Steps

- **Learn Kubernetes**: [Kubernetes Deployment](k8s-deployment.md) - K8s deployment
- **See configuration**: [Configuration](configuration.md) - Configuration guide
- **Check performance**: [Performance Tuning](performance-tuning.md) - Performance

## Related Resources

- [Configuration](configuration.md) - Configuration guide
- [Kubernetes Deployment](k8s-deployment.md) - K8s deployment
- [Dev Environment](dev-environment.md) - Environment setup
