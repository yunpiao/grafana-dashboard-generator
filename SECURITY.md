# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Open a Public Issue

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send an email to: **[YOUR-EMAIL]** (replace with your security contact email)

Or use GitHub Security Advisories:
- Go to repository → Security tab → Report a vulnerability

### 3. Include Details

Please provide:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 4. Response Timeline

- **24 hours**: Initial response acknowledging receipt
- **72 hours**: Assessment of severity and impact
- **7 days**: Action plan and timeline
- **30 days**: Fix released (for high severity issues)

## Security Best Practices

### For Users

#### API Key Security

1. **Never commit API keys** to version control:
   ```bash
   # Use .env file (already in .gitignore)
   echo "OPENAI_API_KEY=sk-xxx" > .env
   ```

2. **Rotate keys regularly**:
   - Change OpenAI API keys every 90 days
   - Use separate keys for dev/prod

3. **Limit key permissions**:
   - Create API keys with minimal required permissions
   - Monitor key usage in OpenAI dashboard

#### Deployment Security

1. **Use HTTPS in production**:
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
   }
   ```

2. **Restrict CORS**:
   ```bash
   # .env
   CORS_ORIGIN=https://your-domain.com  # Not *
   ```

3. **Use strong secrets**:
   ```bash
   # Generate random secrets
   openssl rand -base64 32
   ```

4. **Keep Docker images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### For Developers

#### Input Validation

All user inputs are validated:

```javascript
// backend/src/server.js
if (!metricsText || typeof metricsText !== 'string') {
  return res.status(400).json({ error: 'Invalid input' });
}
```

#### Environment Variables

Never log or expose secrets:

```javascript
// ✅ Good
console.log('API key configured:', !!process.env.OPENAI_API_KEY);

// ❌ Bad
console.log('API key:', process.env.OPENAI_API_KEY);
```

#### Dependencies

Keep dependencies updated:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# For breaking changes
npm audit fix --force
```

## Known Security Considerations

### 1. LLM API Keys

**Risk**: API keys are sensitive credentials.

**Mitigation**:
- Keys stored in environment variables (not in code)
- Not logged or exposed in responses
- Can be provided per-request (for user-managed keys)

### 2. Metrics Data Privacy

**Risk**: Metrics may contain sensitive business information.

**Mitigation**:
- No metrics data stored on server
- Requests processed in-memory only
- No logging of metrics content in production

### 3. Generated Dashboard Content

**Risk**: LLM could generate malicious content.

**Mitigation**:
- Dashboard JSON validated before returning
- No script execution during generation
- Users should review before importing to Grafana

### 4. Rate Limiting

**Risk**: API abuse and cost overruns.

**Mitigation** (Recommended):

```javascript
// Add to backend/src/server.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### 5. CORS Configuration

**Risk**: Unauthorized cross-origin requests.

**Current**: CORS set to `*` (allow all origins) by default.

**Recommendation for Production**:

```bash
# .env
CORS_ORIGIN=https://your-frontend-domain.com
```

## Security Headers

The frontend nginx configuration includes security headers:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## Container Security

### Non-Root User

Containers run as non-root user:

```dockerfile
# backend/Dockerfile
USER nodejs  # UID 1001
```

### Image Scanning

Scan Docker images for vulnerabilities:

```bash
# Install Trivy
brew install aquasecurity/trivy/trivy

# Scan images
trivy image grafana-dashboard-backend:latest
trivy image grafana-dashboard-frontend:latest
```

### Minimal Base Images

Using Alpine Linux for smaller attack surface:

```dockerfile
FROM node:18-alpine
FROM nginx:alpine
```

## Compliance

### Data Privacy

- **GDPR**: No personal data collected by default
- **Analytics**: Optional Umami analytics (privacy-friendly, GDPR compliant)
- **API Keys**: User-managed or server-side environment variables

### Logging

- No sensitive data logged in production
- API keys never logged
- Metrics content not logged (only metadata)

## Incident Response

If a security incident occurs:

1. **Assess impact**: Determine scope and affected users
2. **Contain**: Disable vulnerable services if needed
3. **Fix**: Develop and test fix
4. **Release**: Deploy hotfix (see [RELEASE.md](docs/RELEASE.md))
5. **Communicate**: Notify affected users
6. **Post-mortem**: Document and prevent recurrence

## Security Checklist for Deployment

- [ ] HTTPS enabled
- [ ] API keys in environment variables (not code)
- [ ] CORS restricted to specific origins
- [ ] Rate limiting enabled
- [ ] Docker images up to date
- [ ] Dependencies vulnerability-free (`npm audit`)
- [ ] Secrets not logged
- [ ] Strong passwords for Umami/databases
- [ ] Regular backups configured
- [ ] Monitoring and alerting set up

## Disclosure Policy

- Security vulnerabilities are fixed privately
- Public disclosure after fix is released
- Credit given to reporter (with permission)
- CVE assigned for significant vulnerabilities

## Security Tools

### Recommended Tools

1. **Dependency Scanning**:
   ```bash
   npm audit
   ```

2. **Docker Image Scanning**:
   ```bash
   trivy image your-image:tag
   ```

3. **Secret Scanning**:
   ```bash
   git-secrets --scan
   ```

4. **Static Analysis**:
   ```bash
   npm install -g eslint
   eslint backend/src/
   ```

### GitHub Security Features

Enable in repository settings:

- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Code scanning (CodeQL)
- ✅ Secret scanning

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [OpenAI API Security](https://platform.openai.com/docs/guides/safety-best-practices)

## Contact

For security concerns:
- Email: **[YOUR-EMAIL]**
- GitHub Security Advisories: [Report a vulnerability](../../security/advisories/new)

---

**Last Updated**: 2024-01-15  
**Next Review**: 2024-04-15

