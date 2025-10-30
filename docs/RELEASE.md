# Release Process

Guide for releasing new versions of the Grafana Dashboard Generator.

## Versioning

We follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: v1.2.3
```

- **MAJOR**: Breaking changes (v1.0.0 → v2.0.0)
- **MINOR**: New features, backwards compatible (v1.0.0 → v1.1.0)
- **PATCH**: Bug fixes, backwards compatible (v1.0.0 → v1.0.1)

## Release Checklist

### Before Release

- [ ] All tests pass
- [ ] Code reviewed and merged to `main`
- [ ] CHANGELOG.md updated
- [ ] README.md updated (if needed)
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide created (if breaking changes)

### Release Steps

- [ ] Update version numbers
- [ ] Create git tag
- [ ] Push tag to GitHub
- [ ] Verify Docker images published
- [ ] Verify Cloudflare deployment
- [ ] Test deployed version
- [ ] Create GitHub release
- [ ] Announce release

### After Release

- [ ] Monitor for issues
- [ ] Update project roadmap
- [ ] Close related issues
- [ ] Update milestones

## Detailed Steps

### 1. Update Version Numbers

#### Backend

Edit `backend/package.json`:

```json
{
  "name": "metrics-to-grafana-backend",
  "version": "1.2.3",  // Update this
  // ...
}
```

#### Commit

```bash
git add backend/package.json
git commit -m "chore: bump version to 1.2.3"
```

### 2. Update CHANGELOG.md

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

## [1.2.3] - 2024-01-15

### Added
- New feature X
- Support for Y

### Fixed
- Bug Z fix
- Performance improvement for ABC

### Changed
- Updated dependency versions
- Improved error messages

### Deprecated
- Feature W (will be removed in v2.0.0)

## [1.2.2] - 2024-01-01
...
```

Categories:
- `Added`: New features
- `Changed`: Changes in existing functionality
- `Deprecated`: Soon-to-be removed features
- `Removed`: Removed features
- `Fixed`: Bug fixes
- `Security`: Security fixes

Commit:

```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.2.3"
```

### 3. Create Git Tag

```bash
# Create annotated tag
git tag -a v1.2.3 -m "Release v1.2.3

- Feature: New panel type support
- Fix: Dashboard import compatibility
- Improvement: Faster LLM response parsing
"

# Verify tag
git tag -l v1.2.3
git show v1.2.3
```

### 4. Push to GitHub

```bash
# Push commits
git push origin main

# Push tag
git push origin v1.2.3
```

This automatically triggers:
- ✅ Docker image build and push to Docker Hub
- ✅ Cloudflare Pages deployment (if on main branch)

### 5. Monitor CI/CD

Watch GitHub Actions:

```bash
# Using GitHub CLI
gh run watch

# Or visit:
# https://github.com/yourusername/repo/actions
```

Verify:
- [ ] Docker build succeeds
- [ ] Images pushed to Docker Hub
- [ ] Cloudflare deployment succeeds

### 6. Verify Docker Images

Check Docker Hub:

```bash
# Pull and test backend
docker pull yourusername/grafana-dashboard-backend:v1.2.3
docker run -e OPENAI_API_KEY=sk-test yourusername/grafana-dashboard-backend:v1.2.3

# Pull and test frontend
docker pull yourusername/grafana-dashboard-frontend:v1.2.3
```

Or visit Docker Hub:
- https://hub.docker.com/r/yourusername/grafana-dashboard-backend
- https://hub.docker.com/r/yourusername/grafana-dashboard-frontend

### 7. Test Deployment

#### Test Docker Compose

```bash
# Clone fresh copy
git clone https://github.com/yourusername/repo.git test-release
cd test-release
git checkout v1.2.3

# Test deployment
echo "OPENAI_API_KEY=sk-your-key" > .env
docker-compose up -d

# Test the application
curl http://localhost/api/health
# Try generating a dashboard
```

#### Test Cloudflare

Visit your Cloudflare Pages URL and test functionality.

### 8. Create GitHub Release

#### Via GitHub CLI

```bash
gh release create v1.2.3 \
  --title "v1.2.3 - Panel Type Support" \
  --notes "$(cat << EOF
## What's New

- Added support for custom panel types
- Fixed dashboard import compatibility issues
- Improved LLM response parsing performance

## Installation

### Docker Compose
\`\`\`bash
docker-compose up -d
\`\`\`

### Docker Hub
\`\`\`bash
docker pull yourusername/grafana-dashboard-backend:v1.2.3
docker pull yourusername/grafana-dashboard-frontend:v1.2.3
\`\`\`

## Full Changelog
See [CHANGELOG.md](https://github.com/yourusername/repo/blob/main/CHANGELOG.md)
EOF
)"
```

#### Via GitHub UI

1. Go to repository → **Releases**
2. Click **Draft a new release**
3. Choose tag: `v1.2.3`
4. Release title: `v1.2.3 - Panel Type Support`
5. Description: (from CHANGELOG)
6. Attach files (if any): None needed for Docker releases
7. Click **Publish release**

### 9. Announce Release

#### GitHub Discussions

Create post in Announcements:

```markdown
# 🎉 Version 1.2.3 Released!

We're excited to announce the release of v1.2.3!

## Highlights
- Custom panel type support
- Better Grafana compatibility
- Performance improvements

## Installation
See [Deployment Guide](docs/DEPLOYMENT.md)

## Feedback
Please report any issues on [GitHub Issues](https://github.com/yourusername/repo/issues)
```

#### Social Media (Optional)

- Twitter/X
- LinkedIn
- Reddit (r/grafana, r/devops)
- Dev.to
- Hacker News (for major releases)

Template:

```
🚀 Just released v1.2.3 of Grafana Dashboard Generator!

✨ Auto-generate Grafana dashboards from Prometheus metrics using AI
🐛 Fixed dashboard import issues
⚡ Faster response parsing

Try it: [link]
Docs: [link]

#grafana #prometheus #devops #monitoring
```

## Hotfix Process

For critical bugs in production:

### 1. Create Hotfix Branch

```bash
# From the release tag
git checkout v1.2.3
git checkout -b hotfix/v1.2.4
```

### 2. Fix the Bug

```bash
# Make fix
git add .
git commit -m "fix: critical bug in panel generation"
```

### 3. Update Version

```bash
# Update to 1.2.4
# Update CHANGELOG
```

### 4. Merge and Release

```bash
# Merge to main
git checkout main
git merge hotfix/v1.2.4

# Tag
git tag -a v1.2.4 -m "Hotfix: Critical bug fix"

# Push
git push origin main
git push origin v1.2.4

# Clean up
git branch -d hotfix/v1.2.4
```

## Beta/RC Releases

For pre-releases:

```bash
# Create beta release
git tag -a v1.3.0-beta.1 -m "Beta release"
git push origin v1.3.0-beta.1

# Create release candidate
git tag -a v1.3.0-rc.1 -m "Release candidate"
git push origin v1.3.0-rc.1
```

Mark as pre-release in GitHub:
- ✅ Set as a pre-release

## Version Branches (For Major Versions)

Maintain support for previous major versions:

```bash
# Create v1.x branch for v1 maintenance
git checkout v1.2.3
git checkout -b v1.x

# Push
git push origin v1.x
```

Then backport critical fixes to v1.x while developing v2.x on main.

## Release Notes Template

Use this template for GitHub releases:

```markdown
## 🎉 What's New

- Feature 1
- Feature 2

## 🐛 Bug Fixes

- Fix 1
- Fix 2

## 🔧 Improvements

- Improvement 1
- Improvement 2

## ⚠️ Breaking Changes

- Breaking change 1 (only for MAJOR versions)

## 📦 Installation

### Docker Compose
\`\`\`bash
docker-compose up -d
\`\`\`

### Docker Hub
\`\`\`bash
docker pull yourusername/grafana-dashboard-backend:vX.Y.Z
\`\`\`

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Full Changelog](CHANGELOG.md)

## 🙏 Contributors

Thanks to all contributors!

- @username1
- @username2
```

## Rollback Process

If a release has critical issues:

### 1. Revert Docker Tags

```bash
# Tag previous good version as latest
docker pull yourusername/grafana-dashboard-backend:v1.2.2
docker tag yourusername/grafana-dashboard-backend:v1.2.2 \
           yourusername/grafana-dashboard-backend:latest
docker push yourusername/grafana-dashboard-backend:latest
```

### 2. Revert Git Tag (if needed)

```bash
# Delete bad tag
git tag -d v1.2.3
git push origin :refs/tags/v1.2.3

# Mark GitHub release as yanked
# Edit release → ✅ Set as a pre-release or delete
```

### 3. Communicate

Post in GitHub Discussions and update release notes.

## Automation Improvements

### Future: Automated Releases

Consider using:
- [Release Drafter](https://github.com/release-drafter/release-drafter)
- [Semantic Release](https://github.com/semantic-release/semantic-release)

### Future: Changelog Generation

```bash
# Auto-generate from commits
npm install -g conventional-changelog-cli
conventional-changelog -p angular -i CHANGELOG.md -s
```

## Next Steps

- [GitHub Setup](GITHUB_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Docker Guide](DOCKER.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

