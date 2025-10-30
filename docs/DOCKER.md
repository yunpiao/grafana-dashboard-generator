# Docker Deployment Guide

Complete guide for deploying the Grafana Dashboard Generator using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Using Docker Compose](#using-docker-compose)
- [Using Docker Hub Images](#using-docker-hub-images)
- [Building Images Locally](#building-images-locally)
- [Configuration](#configuration)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ (for docker-compose method)
- OpenAI API key or compatible LLM API key

## Quick Start

The fastest way to get started:

```bash
# Clone repository
git clone https://github.com/yourusername/grafana-dashboard-generator.git
cd grafana-dashboard-generator

# Create environment file
cat > .env << EOF
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
EOF

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Access the application at `http://localhost`

## Using Docker Compose

### Full Stack Deployment

The `docker-compose.yml` file includes:
- **Backend**: Node.js API server (port 3000)
- **Frontend**: Nginx serving static files (port 80)
- Optional: **Umami Analytics** (uncomment to enable)

### Step-by-Step

1. **Create `.env` file** in the project root:

```bash
# Required
OPENAI_API_KEY=sk-your-key-here

# Optional customization
OPENAI_MODEL=gpt-4-turbo-preview
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*

# For alternative LLM providers (e.g., MiniMax)
# LLM_API_KEY=your-jwt-token
# LLM_API_BASE_URL=https://api.minimax.chat/v1
# LLM_MODEL=abab6.5s-chat
```

2. **Start the services**:

```bash
docker-compose up -d
```

3. **Verify services are running**:

```bash
docker-compose ps

# Should show:
# grafana-dashboard-backend    running
# grafana-dashboard-frontend   running
```

4. **Check health**:

```bash
# Backend health check
curl http://localhost:3000/api/health

# Frontend health check
curl http://localhost/health
```

### Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build

# Stop and remove volumes
docker-compose down -v
```

## Using Docker Hub Images

Pull and run pre-built images directly from Docker Hub.

### Backend Only

```bash
docker run -d \
  --name grafana-dashboard-backend \
  -p 3000:3000 \
  -e OPENAI_API_KEY=sk-your-key \
  -e OPENAI_MODEL=gpt-4-turbo-preview \
  --restart unless-stopped \
  yourusername/grafana-dashboard-backend:latest
```

### Frontend + Backend

```bash
# Create a network
docker network create grafana-dashboard

# Run backend
docker run -d \
  --name backend \
  --network grafana-dashboard \
  -e OPENAI_API_KEY=sk-your-key \
  --restart unless-stopped \
  yourusername/grafana-dashboard-backend:latest

# Run frontend
docker run -d \
  --name frontend \
  --network grafana-dashboard \
  -p 80:80 \
  --restart unless-stopped \
  yourusername/grafana-dashboard-frontend:latest
```

The frontend's Nginx is configured to proxy `/api/*` requests to the backend container.

## Building Images Locally

Build your own images from source.

### Build Backend

```bash
cd backend
docker build -t grafana-dashboard-backend:local .
```

### Build Frontend

```bash
cd frontend
docker build -t grafana-dashboard-frontend:local .
```

### Run Locally Built Images

```bash
# Backend
docker run -d \
  --name backend \
  -p 3000:3000 \
  -e OPENAI_API_KEY=sk-your-key \
  grafana-dashboard-backend:local

# Frontend
docker run -d \
  --name frontend \
  -p 80:80 \
  --link backend:backend \
  grafana-dashboard-frontend:local
```

## Configuration

### Environment Variables

See [DEPLOYMENT.md](DEPLOYMENT.md#environment-variables) for complete list.

### Custom Port Mapping

To use different ports:

```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "8080:3000"  # Host:Container
  
  frontend:
    ports:
      - "8000:80"
```

Or with docker run:

```bash
docker run -p 8080:3000 ... grafana-dashboard-backend:latest
```

### Using Alternative LLM Providers

For MiniMax or other OpenAI-compatible APIs:

```bash
# .env file
LLM_API_KEY=your-jwt-token-here
LLM_API_BASE_URL=https://api.minimax.chat/v1
LLM_MODEL=abab6.5s-chat
```

## Advanced Usage

### Enable Umami Analytics

Uncomment the Umami service in `docker-compose.yml`:

```yaml
services:
  # ... existing services ...
  
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    # ... (already in docker-compose.yml, just uncomment)
  
  umami-db:
    image: postgres:15-alpine
    # ...
```

Then restart:

```bash
docker-compose up -d
```

Access Umami at `http://localhost:3001`

Default credentials:
- Username: `admin`
- Password: `umami`

See [UMAMI.md](UMAMI.md) for complete setup.

### Persistent Logs

Add a volume for backend logs:

```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./logs:/app/logs
```

### Custom Nginx Configuration

Mount a custom nginx.conf:

```yaml
services:
  frontend:
    volumes:
      - ./custom-nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

### Resource Limits

Limit container resources:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issue: Missing API key
# Solution: Ensure OPENAI_API_KEY is set in .env
```

### Backend Health Check Failing

```bash
# Check if backend is listening
docker-compose exec backend wget -O- http://localhost:3000/api/health

# Check environment variables
docker-compose exec backend env | grep OPENAI
```

### Cannot Connect to Backend from Frontend

```bash
# Ensure both containers are on same network
docker network inspect grafana-dashboard_default

# Check backend logs
docker-compose logs backend

# Verify nginx proxy config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Generation Takes Too Long / Timeouts

The Nginx proxy is configured with 120s timeout for LLM calls:

```nginx
proxy_read_timeout 120s;
```

If you need longer:

1. Create custom nginx.conf with higher timeout
2. Mount it in docker-compose.yml

### Out of Memory

LLM generation can use significant memory:

```bash
# Increase Docker memory limit
# Docker Desktop: Settings → Resources → Memory

# Or limit concurrent requests in backend
# (requires code modification)
```

### Port Already in Use

```bash
# Check what's using the port
lsof -i :80
lsof -i :3000

# Change ports in docker-compose.yml or use:
docker-compose up -d --force-recreate
```

## Updating

### Update from Docker Hub

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d
```

### Rebuild from Source

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove with volumes
docker-compose down -v

# Remove images
docker rmi grafana-dashboard-backend grafana-dashboard-frontend

# Clean up everything Docker
docker system prune -a
```

## Next Steps

- [Configuration Options](DEPLOYMENT.md#environment-variables)
- [Setting up Analytics](UMAMI.md)
- [CI/CD with GitHub Actions](GITHUB_SETUP.md)
- [Production Best Practices](DEPLOYMENT.md#security-considerations)

