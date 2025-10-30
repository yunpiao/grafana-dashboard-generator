# 🚀 Deployment Setup Checklist

Quick guide to configure your deployment before publishing.

## ⚠️ Before You Start

Replace these placeholders throughout the codebase:

### 1. Replace Docker Hub Username

Find and replace `yourusername` with your actual Docker Hub username in:

- [ ] `README.md` (badges and examples)
- [ ] `.github/workflows/docker-publish.yml`
- [ ] `docs/DEPLOYMENT.md`
- [ ] `docs/DOCKER.md`
- [ ] `docs/GITHUB_SETUP.md`
- [ ] `docs/CLOUDFLARE.md`
- [ ] `docs/README.md`

**Quick find/replace**:
```bash
# macOS/Linux
find . -type f \( -name "*.md" -o -name "*.yml" \) -exec sed -i '' 's/yourusername/YOUR_DOCKER_HUB_USERNAME/g' {} +

# Or use your IDE's global find/replace
```

### 2. Replace GitHub Repository

Find and replace GitHub URLs with your repository:

- [ ] All documentation files
- [ ] `README.md`
- [ ] `SECURITY.md`

Replace:
- `github.com/yourusername/grafana-dashboard-generator`

With:
- `github.com/YOUR_USERNAME/YOUR_REPO_NAME`

### 3. Update Security Contact

In `SECURITY.md`:
- [ ] Replace `[YOUR-EMAIL]` with your security contact email

## 📋 GitHub Secrets Setup

Configure these in: **Repository → Settings → Secrets and variables → Actions**

### Required Secrets

| Secret Name | How to Get | Priority |
|------------|------------|----------|
| `DOCKER_USERNAME` | Your Docker Hub username | High |
| `DOCKER_TOKEN` | [Docker Hub Tokens](https://hub.docker.com/settings/security) | High |
| `CLOUDFLARE_API_TOKEN` | [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) | Medium |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Account ID | Medium |

**Detailed instructions**: [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md)

## 🐳 Docker Hub Setup

1. **Create account** at [Docker Hub](https://hub.docker.com)
2. **Create repositories** (or let GitHub Actions create them):
   - `grafana-dashboard-backend`
   - `grafana-dashboard-frontend`
3. **Generate access token**: Settings → Security → New Access Token
4. **Add to GitHub Secrets** as `DOCKER_TOKEN`

## ☁️ Cloudflare Pages Setup (Optional)

Only if deploying to Cloudflare Pages:

1. **Login** to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Get Account ID**: Dashboard → Account ID (right sidebar)
3. **Create API Token**:
   - Go to API Tokens
   - Create Token with "Cloudflare Pages" permissions
4. **Add to GitHub Secrets**:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

## 🎯 First Deployment

### Option 1: Docker (Recommended)

```bash
# 1. Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Create .env file
cat > .env << EOF
OPENAI_API_KEY=sk-your-actual-key
OPENAI_MODEL=gpt-4-turbo-preview
EOF

# 3. Start services
docker-compose up -d

# 4. Verify
curl http://localhost/api/health
```

### Option 2: Publish Docker Images

```bash
# 1. Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# 2. GitHub Actions will automatically:
#    - Build Docker images
#    - Push to Docker Hub
#    - Tag as v1.0.0 and latest

# 3. Wait for Actions to complete (check Actions tab)

# 4. Verify on Docker Hub
#    https://hub.docker.com/r/YOUR_USERNAME/grafana-dashboard-backend
```

## 📊 Analytics Setup (Optional)

To track usage with Umami:

### Option 1: Umami Cloud
1. Sign up at [Umami Cloud](https://cloud.umami.is)
2. Create website
3. Get Website ID
4. Add to frontend configuration

### Option 2: Self-hosted
1. Uncomment Umami services in `docker-compose.yml`
2. Generate secret: `openssl rand -base64 32`
3. Add to `.env`: `UMAMI_APP_SECRET=your-secret`
4. Start: `docker-compose up -d umami umami-db`
5. Access at `http://localhost:3001`

**Full guide**: [docs/UMAMI.md](docs/UMAMI.md)

## ✅ Pre-Launch Checklist

### Code & Documentation

- [ ] Replace all placeholder usernames/URLs
- [ ] Update `SECURITY.md` with your contact email
- [ ] Review and update `README.md`
- [ ] Test all documentation links
- [ ] Update version in `backend/package.json`

### GitHub Configuration

- [ ] Enable GitHub Actions (Settings → Actions)
- [ ] Add required secrets (Docker Hub, Cloudflare)
- [ ] Configure GitHub Pages (optional, for docs)
- [ ] Enable Dependabot (Security → Dependabot)
- [ ] Create initial release (v1.0.0)

### Docker Hub

- [ ] Docker Hub account created
- [ ] Access token generated
- [ ] Repository descriptions added
- [ ] README updated on Docker Hub

### Deployment Testing

- [ ] Test local Docker deployment
- [ ] Test Docker Compose
- [ ] Verify environment variables work
- [ ] Test dashboard generation
- [ ] Verify Grafana import works

### CI/CD Testing

- [ ] Push test tag: `git tag v0.1.0-test && git push origin v0.1.0-test`
- [ ] Verify GitHub Actions run successfully
- [ ] Check Docker images are pushed
- [ ] Pull and test published images
- [ ] Delete test tag after verification

### Documentation

- [ ] All links working
- [ ] Screenshots updated (if any)
- [ ] Examples tested
- [ ] Badges showing correct information

### Security

- [ ] No secrets in code
- [ ] `.env` in `.gitignore`
- [ ] Security policy reviewed
- [ ] Dependencies up to date: `npm audit`

## 📱 After Launch

1. **Monitor** GitHub Actions for any failures
2. **Watch** Docker Hub for pull statistics
3. **Check** Issues/Discussions for user feedback
4. **Update** documentation based on common questions
5. **Promote** on social media, Reddit, etc.

## 🐛 Troubleshooting

### GitHub Actions Failing

1. Check Actions logs for specific errors
2. Verify secrets are correctly set
3. Ensure token permissions are sufficient
4. See [docs/GITHUB_SETUP.md#troubleshooting](docs/GITHUB_SETUP.md#troubleshooting)

### Docker Build Fails

1. Test locally: `docker-compose build`
2. Check Dockerfile syntax
3. Verify base images are accessible
4. See [docs/DOCKER.md#troubleshooting](docs/DOCKER.md#troubleshooting)

### Cannot Pull Images

1. Verify images were pushed successfully
2. Check Docker Hub repository settings
3. Ensure repository is public (or login to pull private)

## 📚 Next Steps

- Read the [Release Process](docs/RELEASE.md)
- Setup [Umami Analytics](docs/UMAMI.md)
- Review [Security Best Practices](SECURITY.md)
- Join [GitHub Discussions](https://github.com/YOUR_USERNAME/YOUR_REPO/discussions)

## 🆘 Need Help?

- Check [Documentation Index](docs/README.md)
- Search [GitHub Issues](https://github.com/YOUR_USERNAME/YOUR_REPO/issues)
- Ask in [Discussions](https://github.com/YOUR_USERNAME/YOUR_REPO/discussions)

---

Good luck with your launch! 🎉

