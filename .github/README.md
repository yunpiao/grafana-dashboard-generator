# GitHub Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### [docker-publish.yml](workflows/docker-publish.yml)

**Purpose**: Build and publish Docker images to Docker Hub

**Triggers**:
- Push tags matching `v*` (e.g., `v1.0.0`, `v1.2.3`)
- Manual workflow dispatch

**What it does**:
1. Builds backend and frontend Docker images
2. Pushes to Docker Hub with appropriate tags:
   - `latest` (for latest release)
   - `v1.2.3` (exact version)
   - `v1.2` (minor version)
   - `v1` (major version)
3. Supports multi-platform builds (amd64, arm64)
4. Updates Docker Hub repository description

**Required Secrets**:
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_TOKEN`: Docker Hub access token

**Example**:
```bash
# Create and push a release tag
git tag v1.0.0
git push origin v1.0.0

# Watch the workflow
gh run watch
```

### [cloudflare-pages.yml](workflows/cloudflare-pages.yml)

**Purpose**: Deploy to Cloudflare Pages

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**What it does**:
1. Builds frontend static files
2. Copies backend shared code for Functions
3. Deploys to Cloudflare Pages
4. Includes serverless Functions for API

**Required Secrets**:
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

**Environment Variables** (set in Cloudflare Pages UI):
- `OPENAI_API_KEY`: Required for Functions

**Example**:
```bash
# Deploy to Cloudflare
git push origin main

# Or trigger manually
gh workflow run cloudflare-pages.yml
```

## Setup Instructions

See [docs/GITHUB_SETUP.md](../docs/GITHUB_SETUP.md) for detailed setup instructions.

### Quick Setup

1. **Enable GitHub Actions**:
   - Settings → Actions → General
   - Allow all actions

2. **Add Secrets**:
   - Settings → Secrets and variables → Actions
   - Add required secrets (see above)

3. **Permissions**:
   - Settings → Actions → General → Workflow permissions
   - Select "Read and write permissions"

## Testing Workflows

### Test Locally with Act

```bash
# Install act
brew install act

# List workflows
act -l

# Run push event
act push

# Run specific workflow
act -j build-and-push
```

### Test with Test Tags

```bash
# Create test release
git tag v0.0.1-test
git push origin v0.0.1-test

# Watch the run
gh run watch

# Delete test tag after verification
git tag -d v0.0.1-test
git push origin :refs/tags/v0.0.1-test
```

## Workflow Status

View workflow status:

```bash
# Using GitHub CLI
gh run list
gh run view [run-id]
gh run watch

# Or visit
# https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

## Troubleshooting

### Workflow Fails: "Resource not accessible"

**Fix**: Enable workflow permissions
- Settings → Actions → General
- Workflow permissions → Read and write

### Workflow Fails: "Invalid credentials"

**Fix**: Regenerate and update secrets
1. Docker Hub: Create new access token
2. GitHub: Update `DOCKER_TOKEN` secret
3. Re-run workflow

### Docker Build Fails: "No space left on device"

**Fix**: The workflow includes cleanup steps, but if still failing:
```yaml
# Add to workflow before building
- name: Free disk space
  run: |
    docker system prune -af
    df -h
```

### Cloudflare Deployment Fails

**Check**:
1. Verify `CLOUDFLARE_API_TOKEN` has correct permissions
2. Ensure `CLOUDFLARE_ACCOUNT_ID` is correct
3. Check Cloudflare Pages project exists
4. Review Cloudflare logs

## Adding New Workflows

To add a new workflow:

1. Create `.github/workflows/your-workflow.yml`
2. Define triggers and jobs
3. Test with `act` or test tags
4. Document in this README

Example template:

```yaml
name: Your Workflow

on:
  push:
    branches: [ main ]

jobs:
  your-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Do something
        run: echo "Hello"
```

## Best Practices

1. **Use specific action versions**: `actions/checkout@v4` (not `@main`)
2. **Cache dependencies**: Use actions/cache for npm, Docker layers
3. **Secret management**: Never log secrets, use `${{ secrets.NAME }}`
4. **Test before merging**: Use pull request triggers for testing
5. **Matrix builds**: Test multiple Node.js versions if needed

## Status Badges

Add to README.md:

```markdown
![Docker Build](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/docker-publish.yml/badge.svg)
![Cloudflare](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/cloudflare-pages.yml/badge.svg)
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Cloudflare Pages Action](https://github.com/cloudflare/pages-action)
- [act - Local Testing](https://github.com/nektos/act)

## Support

For issues with workflows:
1. Check [docs/GITHUB_SETUP.md](../docs/GITHUB_SETUP.md)
2. Review workflow logs
3. Open an issue with workflow run ID

