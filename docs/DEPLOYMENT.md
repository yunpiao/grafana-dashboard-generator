# Deployment Guide

This guide provides an overview of different deployment options for the Grafana Dashboard Generator.

## Deployment Options Comparison

| Method | Difficulty | Best For | Pros | Cons |
|--------|-----------|----------|------|------|
| **Docker Compose** | ⭐ Easy | Production, Self-hosting | Complete setup, Easy to manage | Requires server |
| **Docker Hub Images** | ⭐ Easy | Quick deployment | Pre-built images, Fast setup | Requires Docker |
| **Cloudflare Pages** | ⭐⭐ Medium | Global CDN, Serverless | Free tier, Auto-scaling, Global | LLM timeout risk |
| **Source Code** | ⭐⭐⭐ Advanced | Development, Customization | Full control, Easy debugging | Manual setup required |

## Quick Start

### Option 1: Docker Compose (Recommended)

Perfect for production deployment with both frontend and backend.

```bash
# Clone the repository
git clone https://github.com/yourusername/grafana-dashboard-generator.git
cd grafana-dashboard-generator

# Create .env file with your API key
cat > .env << EOF
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
EOF

# Start the services
docker-compose up -d

# Access the application
open http://localhost
```

See [Docker Deployment Guide](DOCKER.md) for detailed instructions.

### Option 2: Docker Hub Images

Use pre-built images from Docker Hub.

```bash
# Pull the images
docker pull yourusername/grafana-dashboard-backend:latest
docker pull yourusername/grafana-dashboard-frontend:latest

# Run backend
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY=sk-your-key \
  --name grafana-backend \
  yourusername/grafana-dashboard-backend:latest

# Run frontend
docker run -d \
  -p 80:80 \
  --link grafana-backend:backend \
  --name grafana-frontend \
  yourusername/grafana-dashboard-frontend:latest
```

### Option 3: Cloudflare Pages

Deploy to Cloudflare Pages for global CDN and serverless functions.

**Note**: LLM API calls can take 30-60 seconds. Cloudflare Pages Functions have timeout limits that may affect generation.

See [Cloudflare Deployment Guide](CLOUDFLARE.md) for detailed instructions.

### Option 4: From Source

For development or custom deployments.

```bash
# Clone and install backend
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API key

# Start backend
npm start

# In another terminal, serve frontend
cd ../frontend
python3 -m http.server 8080

# Access at http://localhost:8080
```

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  (Static HTML/CSS/JS or Nginx Container)        │
│                                                  │
│  - User Interface                               │
│  - Metrics Input                                │
│  - Panel Selection                              │
│  - Dashboard Download                           │
└──────────────────┬──────────────────────────────┘
                   │ HTTP API
                   ▼
┌─────────────────────────────────────────────────┐
│                   Backend                        │
│      (Node.js Express or CF Functions)          │
│                                                  │
│  Endpoints:                                     │
│  - POST /api/analyze-metrics                    │
│  - POST /api/generate-panels                    │
│  - GET  /api/health                             │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              OpenAI API / LLM Provider          │
│                                                  │
│  - GPT-4 Turbo                                  │
│  - MiniMax (alternative)                        │
│  - Other compatible LLMs                        │
└─────────────────────────────────────────────────┘
```

## Environment Variables

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |
| `LLM_API_KEY` | Yes* | - | Alternative LLM API key |
| `OPENAI_MODEL` | No | `gpt-4-turbo-preview` | Model to use |
| `LLM_API_BASE_URL` | No | - | Custom LLM endpoint |
| `PORT` | No | `3000` | Backend server port |
| `NODE_ENV` | No | `production` | Environment mode |
| `CORS_ORIGIN` | No | `*` | CORS allowed origins |

*Either `OPENAI_API_KEY` or `LLM_API_KEY` is required.

### Frontend (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `UMAMI_WEBSITE_ID` | No | - | Umami analytics website ID |
| `UMAMI_SRC` | No | - | Umami script URL |

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Restrict CORS origins in production (`CORS_ORIGIN`)
4. **Rate Limiting**: Consider implementing rate limiting
5. **Input Validation**: The backend validates all inputs

## Monitoring & Analytics

- **Application Health**: `/api/health` endpoint
- **User Analytics**: Optional Umami integration (see [UMAMI.md](UMAMI.md))
- **Logs**: Check container logs with `docker-compose logs`

## Scaling Considerations

- **Backend**: Stateless, can be horizontally scaled
- **Frontend**: Static files, can use CDN
- **LLM API**: Rate limits depend on your OpenAI plan
- **Memory**: Each request uses ~50-200MB during generation

## Troubleshooting

### Common Issues

**Issue**: API key not working
- Check if the key is correctly set in environment variables
- Verify the key has not expired
- Ensure you have API credits

**Issue**: Generation takes too long
- Normal: 30-60 seconds for analysis + generation
- Check your internet connection
- Verify OpenAI API status

**Issue**: Dashboard import fails in Grafana
- Ensure you select a Prometheus datasource
- Check metric names match your actual metrics
- Verify Grafana version compatibility (12.0+)

## Next Steps

- [Docker Deployment Guide](DOCKER.md)
- [Cloudflare Pages Deployment](CLOUDFLARE.md)
- [GitHub Setup for CI/CD](GITHUB_SETUP.md)
- [Release Process](RELEASE.md)
- [Umami Analytics Setup](UMAMI.md)

