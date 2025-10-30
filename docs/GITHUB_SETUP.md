# GitHub Repository Setup Guide

Configure GitHub repository for automated CI/CD with Docker Hub and Cloudflare Pages.

## Table of Contents

- [Repository Secrets](#repository-secrets)
- [Docker Hub Setup](#docker-hub-setup)
- [Cloudflare Setup](#cloudflare-setup)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Testing Workflows](#testing-workflows)
- [Troubleshooting](#troubleshooting)

## Repository Secrets

GitHub Secrets are used to securely store sensitive information for CI/CD workflows.

### Required Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `DOCKER_USERNAME` | Docker Hub username | Your Docker Hub account name |
| `DOCKER_TOKEN` | Docker Hub access token | See [Docker Hub Setup](#docker-hub-setup) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | See [Cloudflare Setup](#cloudflare-setup) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | See [Cloudflare Setup](#cloudflare-setup) |

### Optional Secrets

| Secret Name | Description | When Needed |
|------------|-------------|-------------|
| `OPENAI_API_KEY` | OpenAI API key | If you want to run tests in CI |

## Docker Hub Setup

### 1. Create Docker Hub Account

If you don't have one:
1. Go to [Docker Hub](https://hub.docker.com)
2. Sign up for free account
3. Verify your email

### 2. Create Access Token

**⚠️ Don't use your password - use an access token!**

1. **Login to Docker Hub**
2. **Go to Account Settings**:
   - Click your username (top right)
   - Account Settings

3. **Create Access Token**:
   - Click "Security"
   - Click "New Access Token"
   - Description: `GitHub Actions - Grafana Dashboard`
   - Permissions: `Read, Write, Delete`
   - Click "Generate"

4. **Copy the token immediately** (you won't see it again!)

5. **Add to GitHub Secrets**:
   ```
   DOCKER_TOKEN = [paste token here]
   DOCKER_USERNAME = [your Docker Hub username]
   ```

### 3. Create Repositories (Optional)

Repositories will be created automatically on first push, but you can create them manually:

1. Go to [Docker Hub](https://hub.docker.com)
2. Click "Create Repository"
3. Create two repositories:
   - `grafana-dashboard-backend`
   - `grafana-dashboard-frontend`
4. Set visibility: **Public** (for free pulls) or **Private**

### 4. Update Workflow Files

If your Docker Hub username is different from repository name:

Edit `.github/workflows/docker-publish.yml`:

```yaml
env:
  DOCKER_USERNAME: your-dockerhub-username  # Replace here
```

Or use the secret:

```yaml
env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
```

## Cloudflare Setup

### 1. Get Account ID

1. **Login to Cloudflare**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)

2. **Find Account ID**:
   - Select any site (or go to Account Home)
   - Scroll down on right sidebar
   - Copy "Account ID"

3. **Add to GitHub Secrets**:
   ```
   CLOUDFLARE_ACCOUNT_ID = [paste account ID]
   ```

### 2. Create API Token

1. **Go to API Tokens**:
   - Dashboard → My Profile → API Tokens
   - Click "Create Token"

2. **Use Template**:
   - Find "Edit Cloudflare Workers" template
   - Click "Use template"

3. **Or Create Custom Token**:
   - Token name: `GitHub Actions - Pages Deploy`
   - Permissions:
     ```
     Account → Cloudflare Pages → Edit
     ```
   - Account Resources:
     ```
     Include → [Your Account]
     ```

4. **Create Token**:
   - Click "Continue to summary"
   - Click "Create Token"
   - **Copy the token** (shown only once!)

5. **Add to GitHub Secrets**:
   ```
   CLOUDFLARE_API_TOKEN = [paste token]
   ```

### 3. Create Pages Project (Optional)

The workflow will create it automatically, but you can do it manually:

1. **Go to Cloudflare Pages**:
   - Dashboard → Pages
   - Create a project

2. **Project Settings**:
   - Project name: `grafana-dashboard-generator`
   - Production branch: `main`

3. **Build Settings**:
   - Build command: (leave empty)
   - Build output directory: (leave empty)
   - The GitHub Action handles building

4. **Environment Variables**:
   - Add `OPENAI_API_KEY` (required)
   - Add other variables as needed

## GitHub Actions Workflows

The repository includes two workflows:

### 1. Docker Publish Workflow

**File**: `.github/workflows/docker-publish.yml`

**Triggers**:
- Push tags matching `v*` (e.g., `v1.0.0`)
- Manual workflow dispatch

**What it does**:
1. Builds backend and frontend Docker images
2. Pushes to Docker Hub with proper tags
3. Updates Docker Hub repository description

**Tag format**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

This creates images:
- `yourusername/grafana-dashboard-backend:latest`
- `yourusername/grafana-dashboard-backend:v1.0.0`
- `yourusername/grafana-dashboard-backend:v1.0`
- `yourusername/grafana-dashboard-backend:v1`

### 2. Cloudflare Pages Workflow

**File**: `.github/workflows/cloudflare-pages.yml`

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**What it does**:
1. Builds frontend and Functions
2. Deploys to Cloudflare Pages
3. Provides deployment URL

## Testing Workflows

### Test Docker Build Locally

Before pushing tags:

```bash
# Build backend
cd backend
docker build -t test-backend .

# Build frontend
cd ../frontend
docker build -t test-frontend .

# Test run
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-test test-backend
```

### Test Workflow Syntax

```bash
# Install act (GitHub Actions local runner)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Test workflow
act -l  # List workflows
act push  # Run push event
```

### Manual Workflow Trigger

Trigger workflows manually from GitHub UI:

1. Go to repository → **Actions**
2. Select workflow
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow"

### Check Workflow Status

```bash
# Using GitHub CLI
gh run list
gh run view [run-id]
gh run watch [run-id]
```

Or view in GitHub UI:
- Repository → Actions tab

## Workflow Permissions

Ensure workflows have necessary permissions:

**Settings** → **Actions** → **General** → **Workflow permissions**:

Select: **Read and write permissions**

## Branch Protection (Optional)

Protect `main` branch to ensure quality:

**Settings** → **Branches** → **Add rule**:

- Branch name pattern: `main`
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

## Environment Setup (Optional)

Create GitHub Environments for better control:

**Settings** → **Environments** → **New environment**:

1. **production**:
   - Required reviewers: [your team]
   - Deployment branches: `main` only

2. **staging**:
   - Deployment branches: `develop` or feature branches

Update workflows to use environments:

```yaml
jobs:
  deploy:
    environment: production
    # ... rest of job
```

## Troubleshooting

### Workflow Fails: "Resource not accessible by integration"

**Fix**: Enable workflow permissions:
- Settings → Actions → General
- Workflow permissions → Read and write

### Workflow Fails: "Invalid credentials"

**Fix**: Regenerate and update secrets:
```bash
# For Docker Hub
1. Create new token in Docker Hub
2. Update DOCKER_TOKEN in GitHub

# For Cloudflare
1. Create new API token
2. Update CLOUDFLARE_API_TOKEN in GitHub
```

### Workflow Fails: "No space left on device"

**Fix**: GitHub Actions runners have limited space. Optimize Dockerfiles:

```dockerfile
# Use multi-stage builds
# Clean up in same RUN command
RUN npm install && npm cache clean --force
```

### Docker Hub Rate Limits

**Error**: "Too many requests"

**Fix**:
1. Login to Docker Hub in workflow (already done)
2. Upgrade to Docker Hub Pro (increases limits)

### Cloudflare Deployment Fails

**Check**:
```bash
# Verify account ID
echo $CLOUDFLARE_ACCOUNT_ID

# Verify token permissions
# Go to Cloudflare → API Tokens → View your token
```

### Secrets Not Working

**Debug**:
```yaml
# Add to workflow (temporarily, don't commit!)
- name: Debug
  run: |
    echo "Docker user: ${{ secrets.DOCKER_USERNAME }}"
    echo "Has CF token: ${{ secrets.CLOUDFLARE_API_TOKEN != '' }}"
```

**⚠️ Never echo actual secret values!**

## Security Best Practices

1. **Rotate tokens regularly** (every 90 days)
2. **Use separate tokens** for each workflow
3. **Minimal permissions** - only what's needed
4. **Never commit secrets** to repository
5. **Use environment protection** for production

## Monitoring

### Workflow Notifications

Enable notifications:
- GitHub → Settings → Notifications
- ✅ Actions → Workflow runs

### Status Badges

Add to README.md:

```markdown
![Docker Build](https://github.com/yourusername/repo/actions/workflows/docker-publish.yml/badge.svg)
![Cloudflare](https://github.com/yourusername/repo/actions/workflows/cloudflare-pages.yml/badge.svg)
```

## Next Steps

- [Release Process](RELEASE.md)
- [Docker Deployment](DOCKER.md)
- [Cloudflare Deployment](CLOUDFLARE.md)
- [Main Deployment Guide](DEPLOYMENT.md)

