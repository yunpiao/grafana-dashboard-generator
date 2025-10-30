# Documentation Index

Complete documentation for the Grafana Dashboard Generator.

## 🚀 Getting Started

New to the project? Start here:

1. **[Deployment Overview](DEPLOYMENT.md)** - Compare deployment options and choose the best fit
2. **Quick Starts**:
   - [Docker Deployment](DOCKER.md#quick-start) - Fastest way to deploy
   - [Cloudflare Pages](CLOUDFLARE.md#quick-start) - Serverless deployment
3. **[Setup Analytics](UMAMI.md)** - Optional usage tracking

## 📖 Deployment Guides

### [Deployment Overview](DEPLOYMENT.md)
Complete guide comparing all deployment methods with architecture diagrams, environment variables, and troubleshooting.

**Contents**:
- Deployment options comparison
- Architecture overview
- Environment variables reference
- Security considerations
- Troubleshooting common issues

### [Docker Guide](DOCKER.md)
Comprehensive Docker deployment documentation.

**Contents**:
- Quick start with Docker Compose
- Using pre-built Docker Hub images
- Building images locally
- Configuration and customization
- Resource limits and optimization
- Troubleshooting Docker issues

### [Cloudflare Pages Guide](CLOUDFLARE.md)
Deploy to Cloudflare's global edge network.

**Contents**:
- Cloudflare Pages + Functions setup
- GitHub Actions integration
- Wrangler CLI deployment
- Environment configuration
- Limitations and workarounds
- Hybrid deployment strategies

### [Umami Analytics Setup](UMAMI.md)
Privacy-friendly analytics configuration.

**Contents**:
- Umami Cloud vs self-hosted
- Docker Compose integration
- Frontend tracking setup
- Custom event tracking
- Privacy compliance (GDPR)
- Cost comparison

## 🛠 Development & CI/CD

### [GitHub Setup Guide](GITHUB_SETUP.md)
Configure GitHub repository for automated workflows.

**Contents**:
- Repository secrets configuration
- Docker Hub integration
- Cloudflare API token setup
- Workflow testing
- Troubleshooting CI/CD

### [Release Process](RELEASE.md)
How to release new versions.

**Contents**:
- Semantic versioning
- Release checklist
- Tag creation and publishing
- Docker image releases
- Hotfix process
- Rollback procedures

## 🔒 Security

### [Security Policy](../SECURITY.md)
Security guidelines and vulnerability reporting.

**Contents**:
- Supported versions
- Vulnerability reporting
- Security best practices
- Known security considerations
- Container security
- Compliance information

## 📚 Additional Resources

### Project Documentation

- [README](../README.md) - Main project documentation
- [CHANGELOG](../CHANGELOG.md) - Version history
- [CONTRIBUTING](../CONTRIBUTING.md) - How to contribute
- [LICENSE](../LICENSE) - MIT License

### Chinese Documentation

- [README-zh](../README-zh.md) - 中文文档
- [PromQL规则](../PromQL语法规则.md) - PromQL语法规则
- [最新改进总结](../最新改进总结.md) - 更新总结
- [常见错误修复](../常见Grafana错误修复.md) - 错误修复指南
- [快速开始-MiniMax版](../快速开始-MiniMax版.md) - MiniMax快速开始

### Marketing & Launch

- [Launch Plan](../LAUNCH_PLAN.md) - Product launch strategy
- [Marketing Assets](../MARKETING_ASSETS.md) - Promotional materials
- [Monetization Strategies](../MONETIZATION_STRATEGIES.md) - Revenue options
- [Promotion Index](../PROMOTION_INDEX.md) - Marketing resources

## 🎯 Quick Links by Task

### I want to deploy the application

- **Easiest**: [Docker Compose Quick Start](DOCKER.md#quick-start)
- **No server**: [Cloudflare Pages](CLOUDFLARE.md)
- **Custom setup**: [From Source](DEPLOYMENT.md#option-4-from-source)

### I want to configure CI/CD

- [GitHub Secrets Setup](GITHUB_SETUP.md#repository-secrets)
- [Docker Hub Configuration](GITHUB_SETUP.md#docker-hub-setup)
- [Cloudflare Integration](GITHUB_SETUP.md#cloudflare-setup)

### I want to add analytics

- [Umami Cloud Setup](UMAMI.md#option-1-umami-cloud-easiest)
- [Self-hosted Umami](UMAMI.md#option-2-self-hosted-with-docker-compose-recommended)
- [Frontend Integration](UMAMI.md#frontend-integration)

### I want to release a new version

- [Release Checklist](RELEASE.md#release-checklist)
- [Versioning Guide](RELEASE.md#versioning)
- [Docker Image Publishing](RELEASE.md#6-verify-docker-images)

### I want to report a security issue

- [Security Policy](../SECURITY.md#reporting-a-vulnerability)
- Private reporting via GitHub Security Advisories

### I want to contribute

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Development Setup](DEPLOYMENT.md#option-4-from-source)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/grafana-dashboard-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/grafana-dashboard-generator/discussions)
- **Security**: See [SECURITY.md](../SECURITY.md)

## 🔄 Documentation Updates

This documentation is maintained alongside the codebase. If you find errors or have suggestions:

1. Open an [issue](https://github.com/yourusername/grafana-dashboard-generator/issues)
2. Submit a [pull request](https://github.com/yourusername/grafana-dashboard-generator/pulls)
3. Start a [discussion](https://github.com/yourusername/grafana-dashboard-generator/discussions)

---

**Last Updated**: 2024-01-15

Made with ❤️ by the community

