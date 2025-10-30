# Cloudflare Pages Deployment Guide

Deploy the Grafana Dashboard Generator to Cloudflare Pages with serverless functions.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Methods](#deployment-methods)
- [Configuration](#configuration)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)

## Overview

Cloudflare Pages provides:
- ✅ Global CDN for frontend
- ✅ Serverless Functions for backend API
- ✅ Automatic HTTPS
- ✅ Free tier available
- ⚠️ **Timeout limitations** for long-running LLM calls

### Architecture

```
User Request
    ↓
Cloudflare Edge Network (CDN)
    ↓
├─→ Static Files (Frontend)
│   - index.html, CSS, JS
│
└─→ Functions (Backend API)
    - /api/health
    - /api/analyze-metrics
    - /api/generate-panels
        ↓
    OpenAI API (30-60s response time)
```

## Prerequisites

- Cloudflare account (free tier works)
- GitHub account
- OpenAI API key
- Git repository with your code

## Deployment Methods

### Method 1: Automatic Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow that automatically deploys to Cloudflare Pages on every push to `main`.

#### Setup Steps

1. **Get Cloudflare Credentials**

   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Go to: Account → API Tokens
   - Create token with permissions:
     - `Cloudflare Pages - Edit`
   - Copy the token

   - Get your Account ID:
     - Dashboard → Account → Account ID (on the right)

2. **Configure GitHub Secrets**

   Go to your GitHub repository → Settings → Secrets and variables → Actions

   Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Your API token from step 1
   - `CLOUDFLARE_ACCOUNT_ID`: Your account ID

3. **Create Cloudflare Pages Project**

   ```bash
   # First deployment creates the project
   git push origin main
   ```

   Or manually:
   - Go to Cloudflare Dashboard → Pages
   - Create a new project
   - Name it: `grafana-dashboard-generator`
   - Build settings: None (we handle this in GitHub Actions)

4. **Configure Environment Variables in Cloudflare**

   - Go to your Pages project → Settings → Environment variables
   - Add production variables:
     ```
     OPENAI_API_KEY=sk-your-actual-key
     OPENAI_MODEL=gpt-4-turbo-preview
     ```

5. **Deploy**

   ```bash
   git push origin main
   ```

   The GitHub Action will automatically build and deploy.

### Method 2: Manual Deployment (Wrangler CLI)

#### Install Wrangler

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

#### Build and Deploy

```bash
# Build the project
mkdir -p dist
cp -r frontend/* dist/
mkdir -p dist/_functions-lib
cp backend/src/*.js dist/_functions-lib/
cp -r functions dist/

# Deploy
wrangler pages publish dist --project-name=grafana-dashboard-generator

# Set environment variables
wrangler pages secret put OPENAI_API_KEY --project-name=grafana-dashboard-generator
# Enter your API key when prompted
```

### Method 3: Git Integration (Cloudflare Dashboard)

1. **Connect Repository**
   - Cloudflare Dashboard → Pages → Create a project
   - Connect your GitHub/GitLab repository
   - Select the repository

2. **Build Settings**
   - Build command: `npm run build:cloudflare` (you need to add this script)
   - Build output directory: `dist`
   - Root directory: `/`

3. **Environment Variables**
   - Add `OPENAI_API_KEY` and other variables

4. **Deploy**
   - Click "Save and Deploy"

## Configuration

### Environment Variables

Set these in Cloudflare Pages → Settings → Environment variables:

| Variable | Required | Example |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | `sk-...` |
| `OPENAI_MODEL` | No | `gpt-4-turbo-preview` |
| `LLM_API_KEY` | Alternative | For MiniMax, etc. |
| `LLM_API_BASE_URL` | No | `https://api.minimax.chat/v1` |
| `UMAMI_WEBSITE_ID` | No | For analytics |
| `UMAMI_SRC` | No | Umami script URL |

### Custom Domain

1. **Add Custom Domain**
   - Pages project → Custom domains
   - Add domain: `dashboard.yourdomain.com`
   - Update DNS records as instructed

2. **SSL Certificate**
   - Automatically provisioned by Cloudflare
   - Takes 1-5 minutes

### Build Script (Optional)

Add to `package.json` for easier deployment:

```json
{
  "scripts": {
    "build:cloudflare": "bash build-cloudflare.sh"
  }
}
```

Create `build-cloudflare.sh`:

```bash
#!/bin/bash
set -e

echo "Building for Cloudflare Pages..."

# Create dist directory
rm -rf dist
mkdir -p dist

# Copy frontend
cp -r frontend/* dist/

# Copy backend shared code
mkdir -p dist/_functions-lib
cp backend/src/metricsParser.js dist/_functions-lib/
cp backend/src/dashboardGenerator.js dist/_functions-lib/
cp backend/src/llmService.js dist/_functions-lib/
cp backend/src/prompts.js dist/_functions-lib/

# Copy functions
cp -r functions dist/

echo "Build complete!"
```

## Limitations

### Cloudflare Pages Functions Limits

| Plan | CPU Time | Wall Time | Memory |
|------|----------|-----------|--------|
| Free | 10ms | ~10s | 128MB |
| Paid | 50ms | ~30s | 128MB |

### Important Notes

⚠️ **LLM API calls typically take 30-60 seconds**, which may exceed Cloudflare's wall time limits.

**Recommendations:**

1. **For Production**: Use Docker deployment or traditional hosting for backend
2. **For Cloudflare**: Deploy only frontend, point API to external backend:

```javascript
// In frontend/app.js, set API URL
const API_URL = 'https://your-backend.example.com';
```

3. **Hybrid Approach**: 
   - Frontend on Cloudflare Pages (fast, global CDN)
   - Backend on:
     - Railway.app (easy Node.js hosting)
     - Render.com (free tier available)
     - Your own server with Docker

### Alternative: Cloudflare Workers (Advanced)

For more control and higher limits, consider Cloudflare Workers instead of Pages Functions:

- Longer execution times
- More memory
- Better for API-heavy workloads

## Troubleshooting

### Function Timeout

**Error**: "Function execution timed out"

**Solutions**:
1. Use hybrid deployment (frontend on Pages, backend elsewhere)
2. Upgrade to Cloudflare Paid plan (extends limits)
3. Optimize LLM prompts to reduce response time

### Environment Variables Not Working

```bash
# Verify variables are set
wrangler pages secret list --project-name=grafana-dashboard-generator

# Re-set if needed
wrangler pages secret put OPENAI_API_KEY --project-name=grafana-dashboard-generator
```

### Build Fails

```bash
# Check build logs in Cloudflare Dashboard
# Common issues:
# - Missing dependencies
# - Incorrect build command
# - Wrong output directory

# Test build locally
npm run build:cloudflare
```

### CORS Errors

The Functions include CORS headers. If you still see errors:

```javascript
// Check functions/_middleware.js
export async function onRequest(context) {
  const response = await context.next();
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  return newResponse;
}
```

### Module Import Errors

Cloudflare Functions use ES modules. Ensure:

```javascript
// Use .js extensions in imports
import { parseMetrics } from '../../_functions-lib/metricsParser.js';

// Not:
import { parseMetrics } from '../../_functions-lib/metricsParser';
```

## Monitoring

### Analytics

Cloudflare provides built-in analytics:
- Pages project → Analytics
- View requests, bandwidth, errors

### Logs

View function logs:
```bash
wrangler pages deployment tail
```

Or in Dashboard:
- Pages project → Functions → View logs

## Cost Estimation

### Cloudflare Pages Pricing

**Free Tier**:
- 500 builds per month
- Unlimited requests
- Unlimited bandwidth
- 100 custom domains

**Paid ($20/month)**:
- 5,000 builds per month
- Higher function limits
- More concurrent builds

### Total Cost Example

Assuming 1,000 dashboard generations per month:

- Cloudflare Pages: **$0** (free tier sufficient for frontend)
- Backend hosting (if hybrid): $5-20/month (Railway, Render, etc.)
- OpenAI API: ~$150-300 (based on usage)

**Total**: $155-320/month

## Recommended Setup

For best results with Cloudflare:

```
┌─────────────────────────────────┐
│   Cloudflare Pages (Frontend)   │
│   - Global CDN                  │
│   - Static files                │
│   - Free tier                   │
└────────────┬────────────────────┘
             │
             │ API Calls
             ▼
┌─────────────────────────────────┐
│   Backend (Docker/Railway)      │
│   - Node.js API                 │
│   - No timeout limits           │
│   - $5-20/month                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│        OpenAI API               │
└─────────────────────────────────┘
```

## Next Steps

- [Docker Deployment](DOCKER.md) - For backend hosting
- [GitHub Setup](GITHUB_SETUP.md) - Automate deployments
- [Umami Analytics](UMAMI.md) - Track usage
- [Main Deployment Guide](DEPLOYMENT.md) - Compare all options

