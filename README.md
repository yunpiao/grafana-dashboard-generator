# Metrics to Grafana Dashboard Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/yunpiao/grafana-dashboard-generator)](https://github.com/yunpiao/grafana-dashboard-generator/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/yunpiao/grafana-dashboard-generator)](https://github.com/yunpiao/grafana-dashboard-generator/issues)

Automatically generate beautiful Grafana dashboards from your Prometheus metrics using AI.

> **✨ Latest Update (v1.1.8)**: 
> - ✅ Fixed dashboard generation format issues - can be imported directly to Grafana
> - ✅ Added LLM automatic retry mechanism - retries on failure instead of exiting
> - ✅ Enhanced JSON parsing - handles `<think>` tags and special cases
> - ✅ Partial panel failure doesn't affect overall generation
> - ✅ Fixed datasource configuration - select any Prometheus datasource after import
> - ✅ Fixed byRefId error - using correct fieldConfig configuration
> - ✅ Optimized PromQL syntax rules - generating more accurate queries
> - ✅ Panel Plans visualization - transparent display of AI analysis process
> - ✅ User can select which panels to generate - flexible control, saves time and cost
> - ✅ Frontend metrics preview - displays labels/types/help, saves bandwidth
> - ✅ **Local API configuration management - save multiple configs, quick switching** ⭐ Latest
> 
> See [CHANGELOG.md](CHANGELOG.md) and [最新改进总结.md](最新改进总结.md) for details.

## Overview

This tool analyzes Prometheus metrics text and uses OpenAI's GPT-4 to automatically create comprehensive Grafana dashboard JSON files. Simply paste your metrics, and get a production-ready dashboard in seconds.

## Features

- 🤖 **AI-Powered Analysis**: GPT-4 analyzes your metrics and suggests the most relevant visualizations
- 📊 **Smart Panel Generation**: Automatically creates panels with proper PromQL queries, units, and visualization types
- 🎯 **Two-Stage Process**: First plans the dashboard structure, then generates each panel for maximum quality
- 🚀 **Easy to Use**: Simple web interface - paste metrics, click generate, download JSON
- 💾 **No Storage**: All processing happens in real-time, nothing is stored on the server

## Architecture

```
grafana-dashboard-generator/
├── backend/                 # Node.js + Express API server
│   └── src/
│       ├── server.js              # Express server and API endpoints
│       ├── metricsParser.js       # Parses Prometheus metrics text
│       ├── llmService.js          # OpenAI API integration
│       ├── dashboardGenerator.js  # Dashboard generation orchestration
│       └── prompts.js             # LLM prompt templates
├── frontend/                # Static HTML/CSS/JS web interface
│   ├── index.html
│   ├── app.js
│   └── style.css
├── scripts/                 # Utility scripts
├── docs/                    # Documentation
└── submodules/
    ├── kaggle-gemini3-writeups-explorer/  # Kaggle Writeups Explorer (Streamlit)
    └── prometheus-to-grafana-ai/          # Alternative Grafana Dashboard Generator
```

## 🚀 Quick Start

Choose your preferred deployment method:

### Docker Compose (Recommended)

```bash
git clone https://github.com/yunpiao/grafana-dashboard-generator.git
cd grafana-dashboard-generator
echo "OPENAI_API_KEY=sk-your-key" > .env
docker-compose up -d
```

Access at `http://localhost`

### Docker Hub

```bash
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=sk-your-key \
  yunpiao/grafana-dashboard-backend:latest
```

### From Source

```bash
cd backend && npm install
echo "OPENAI_API_KEY=sk-your-key" > .env
npm start
# In another terminal: cd frontend && python3 -m http.server 8080
```

**📖 [Complete Deployment Guide](docs/DEPLOYMENT.md)**

## Deployment Options

| Method | Difficulty | Best For | Documentation |
|--------|-----------|----------|---------------|
| **Docker Compose** | ⭐ Easy | Production | [Guide](docs/DOCKER.md) |
| **Docker Hub** | ⭐ Easy | Quick Start | [Guide](docs/DOCKER.md#using-docker-hub-images) |
| **Cloudflare Pages** | ⭐⭐ Medium | Global CDN | [Guide](docs/CLOUDFLARE.md) |
| **From Source** | ⭐⭐⭐ Advanced | Development | [Guide](docs/DEPLOYMENT.md#option-4-from-source) |

## Prerequisites

- Docker (for Docker deployment) or Node.js 18+ (for source deployment)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /Users/dongyunfei/go/src/zawx/grafana
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   PORT=3000
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

## Usage

### Start the Server

```bash
cd backend
npm start
```

The server will start at `http://localhost:3000`

For development with auto-reload:
```bash
npm run dev
```

### Generate a Dashboard

1. **Access the web interface** at `http://localhost:3000`

2. **Get your metrics**:
   - Access your application's `/metrics` endpoint
   - Example: `curl http://localhost:8080/metrics`
   - Copy all the output

3. **Paste and generate**:
   - Paste the metrics into the textarea
   - Optionally provide your OpenAI API key (if not configured on server)
   - Click "Generate Dashboard"
   - Wait 30-60 seconds for the AI to analyze and generate

4. **Import to Grafana**:
   - Download the generated JSON file
   - In Grafana: Dashboards → New → Import
   - Upload the JSON file
   - Select your Prometheus data source
   - Click Import

## How It Works

### 1. Metrics Parsing
The parser extracts structured information from Prometheus metrics text:
- Metric names
- Metric types (counter, gauge, histogram, summary)
- Help documentation
- Available labels

### 2. AI Analysis (Stage 1)
GPT-4 analyzes the metrics summary and plans the dashboard:
- Identifies monitoring capabilities
- Groups related metrics
- Suggests appropriate visualization types
- Outputs a list of panel plans

### 3. Panel Generation (Stage 2)
For each planned panel, GPT-4 generates:
- Accurate PromQL queries
- Proper aggregations (rate, histogram_quantile, etc.)
- Appropriate units and formatting
- Legend templates
- Visualization configuration

### 4. Dashboard Assembly
All panels are assembled into a complete Grafana dashboard JSON with:
- Proper grid layout
- Time range settings
- Refresh configuration
- Metadata and tags

## API Reference

### POST `/api/generate-dashboard`

Generate a Grafana dashboard from metrics text.

**Request Body:**
```json
{
  "metricsText": "# HELP ... \n# TYPE ...",
  "openaiApiKey": "sk-..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "dashboard": { /* Grafana dashboard JSON */ },
  "metadata": {
    "metricsCount": 42,
    "panelsCount": 8,
    "generationTimeMs": 45320,
    "model": "gpt-4-turbo-preview"
  }
}
```

### GET `/api/health`

Check server health and configuration.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-29T...",
  "hasOpenAIKey": true
}
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `OPENAI_MODEL` - Model to use (default: gpt-4-turbo-preview)

### Model Options

- `gpt-4-turbo-preview` - Recommended for best results
- `gpt-4` - Higher quality, slower, more expensive
- `gpt-3.5-turbo` - Faster, cheaper, lower quality

## Example Metrics

Here's a sample of what your metrics might look like:

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{handler="/api/v1/user",method="GET",status_code="200"} 1027
http_requests_total{handler="/api/v1/user",method="POST",status_code="201"} 54

# HELP http_request_duration_seconds HTTP request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{handler="/api/v1/user",method="GET",le="0.1"} 800
http_request_duration_seconds_bucket{handler="/api/v1/user",method="GET",le="0.5"} 950
http_request_duration_seconds_sum{handler="/api/v1/user",method="GET"} 127.5
http_request_duration_seconds_count{handler="/api/v1/user",method="GET"} 1027
```

## Troubleshooting

### "OpenAI API key is required"
- Set `OPENAI_API_KEY` in your `.env` file, OR
- Provide the API key in the web interface

### "No valid metrics found"
- Ensure you copied the complete metrics output
- Check that the metrics follow Prometheus text format
- Verify there are no encoding issues

### Generation takes too long
- Normal generation takes 30-60 seconds
- More metrics = longer processing time
- Check your OpenAI API rate limits

### Generated dashboard doesn't work in Grafana
- Verify your Prometheus data source is configured
- Check that the metric names match your actual metrics
- Some panels may need adjustment based on your specific setup

## Cost Estimation

Typical costs per dashboard generation (using GPT-4-turbo):
- Small metrics set (10-20 metrics): ~$0.10-0.20
- Medium metrics set (50-100 metrics): ~$0.30-0.50
- Large metrics set (200+ metrics): ~$0.80-1.50

## 📚 Documentation

- **Deployment**
  - [Deployment Overview](docs/DEPLOYMENT.md) - Compare all deployment options
  - [Docker Guide](docs/DOCKER.md) - Complete Docker deployment guide
  - [Cloudflare Pages](docs/CLOUDFLARE.md) - Serverless deployment guide
  - [Umami Analytics](docs/UMAMI.md) - Setup usage tracking

- **Development**
  - [GitHub Setup](docs/GITHUB_SETUP.md) - CI/CD configuration
  - [Release Process](docs/RELEASE.md) - How to release new versions
  - [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
  - [Security Policy](SECURITY.md) - Report vulnerabilities

- **Reference**
  - [Changelog](CHANGELOG.md) - Version history
  - [API Endpoints](docs/DEPLOYMENT.md#environment-variables) - API documentation
  - [PromQL Rules](PromQL语法规则.md) - PromQL syntax guide (中文)

## 🌟 Features

- ✅ **AI-Powered**: Leverages GPT-4 for intelligent dashboard generation
- ✅ **Two-Stage Process**: Analyze → Select → Generate
- ✅ **Panel Selection**: Choose which panels to generate
- ✅ **Multi-LLM Support**: OpenAI, MiniMax, and compatible APIs
- ✅ **Multi-language UI**: English, 中文, हिन्दी, Español, العربية
- ✅ **Docker Ready**: Pre-built images on Docker Hub
- ✅ **Cloudflare Compatible**: Deploy to Cloudflare Pages
- ✅ **Privacy-Focused**: Optional Umami analytics
- ✅ **Production Ready**: Health checks, retry logic, error handling

## 🎯 Use Cases

- **DevOps Teams**: Quickly create monitoring dashboards for new services
- **SRE**: Standardize dashboard creation across teams
- **Developers**: Visualize application metrics without learning PromQL
- **Consultants**: Generate client dashboards efficiently

## 🛠 Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express
- **LLM**: OpenAI GPT-4 / Compatible APIs
- **Deployment**: Docker, Cloudflare Pages
- **Analytics**: Umami (optional)

## 📊 Stats & Analytics

Want to track how many people use your deployment? See the [Umami Analytics Guide](docs/UMAMI.md) for privacy-friendly analytics setup.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Quick Contribution Steps

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Grafana for the amazing visualization platform
- Prometheus for metrics collection
- All contributors and users

## 📬 Support

- **Issues**: [GitHub Issues](https://github.com/yunpiao/grafana-dashboard-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yunpiao/grafana-dashboard-generator/discussions)
- **Security**: See [SECURITY.md](SECURITY.md)

## ⭐ Star History

If you find this project useful, please consider giving it a star!

[![Star History Chart](https://api.star-history.com/svg?repos=yunpiao/grafana-dashboard-generator&type=Date)](https://star-history.com/#yunpiao/grafana-dashboard-generator&Date)

---

Made with ❤️ by the community


