# Cloudflare Pages Functions

This directory contains Cloudflare Pages Functions that provide the backend API when deployed to Cloudflare Pages.

## Structure

- `api/health.js` - Health check endpoint
- `api/analyze-metrics.js` - Stage 1: Analyze metrics and return panel plans
- `api/generate-panels.js` - Stage 2: Generate dashboard from selected plans
- `_middleware.js` - Common middleware for CORS and other concerns

## Shared Code

The `_functions-lib/` directory (created during build) contains shared code from `backend/src/`:
- `metricsParser.js` - Prometheus metrics parsing
- `dashboardGenerator.js` - Dashboard generation logic
- `llmService.js` - LLM API integration
- `prompts.js` - Prompt templates

## Environment Variables

Set these in Cloudflare Pages dashboard (Settings → Environment variables):

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `OPENAI_MODEL` - Model to use (default: gpt-4-turbo-preview)
- `LLM_API_KEY` - Alternative LLM provider API key
- `LLM_API_BASE_URL` - Alternative LLM provider base URL
- `LLM_MODEL` - Alternative LLM model name

## Deployment

Deployment is automated via GitHub Actions (`.github/workflows/cloudflare-pages.yml`).

Manual deployment:
```bash
npm install -g wrangler
wrangler pages publish dist --project-name=grafana-dashboard-generator
```

## Important Notes

### Execution Time Limits

**Warning**: Cloudflare Pages Functions have execution time limits:
- Free plan: CPU time limit may cause timeouts for long LLM calls
- Paid plan: Better limits but still capped

The dashboard generation process calls the LLM API multiple times and can take 30-60 seconds. If you experience timeouts:

1. Reduce the number of panels to generate at once
2. Use a faster LLM model (e.g., gpt-3.5-turbo instead of gpt-4)
3. Consider deploying backend separately (VM, Docker, etc.)

### Alternative: Hybrid Deployment

For production with many users:
- Deploy frontend to Cloudflare Pages (fast, global CDN)
- Deploy backend separately (Docker, VPS, etc.) for better reliability
- Update frontend to point to your backend URL

See `docs/CLOUDFLARE.md` for detailed deployment guide.

