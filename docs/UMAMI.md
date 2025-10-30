# Umami Analytics Setup Guide

Set up privacy-friendly analytics for the Grafana Dashboard Generator using Umami.

## Why Umami?

- ✅ **Privacy-focused**: No cookies, GDPR compliant
- ✅ **Self-hosted**: Full data ownership
- ✅ **Lightweight**: ~2KB script size
- ✅ **Open source**: Free and customizable
- ✅ **Real-time**: Live visitor tracking

## Deployment Options

### Option 1: Umami Cloud (Easiest)

1. **Sign up** at [Umami Cloud](https://cloud.umami.is)
2. **Create website**:
   - Name: Grafana Dashboard Generator
   - Domain: your-domain.com
3. **Get tracking code**:
   - Copy Website ID
   - Note the script URL

### Option 2: Self-hosted with Docker Compose (Recommended)

Already included in the project's `docker-compose.yml`!

#### Quick Start

1. **Uncomment Umami services** in `docker-compose.yml`:

```yaml
services:
  # ... existing services ...
  
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    container_name: umami
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://umami:umami@umami-db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${UMAMI_APP_SECRET:-replace-me-with-random-string}
    ports:
      - "3001:3000"
    depends_on:
      umami-db:
        condition: service_healthy
    networks:
      - grafana-dashboard

  umami-db:
    image: postgres:15-alpine
    container_name: umami-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    volumes:
      - umami-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - grafana-dashboard

volumes:
  umami-db-data:
    driver: local
```

2. **Generate secure APP_SECRET**:

```bash
# Generate random string
openssl rand -base64 32

# Add to .env file
echo "UMAMI_APP_SECRET=your-generated-secret" >> .env
```

3. **Start Umami**:

```bash
docker-compose up -d umami umami-db
```

4. **Access Umami dashboard**:

Open `http://localhost:3001`

**Default credentials**:
- Username: `admin`
- Password: `umami`

**⚠️ Change the password immediately!**

5. **Create website tracking**:
   - Click "+ Add website"
   - Name: Grafana Dashboard Generator
   - Domain: localhost (or your domain)
   - Save and copy the Website ID

### Option 3: Hosted on Railway/Render

Deploy Umami separately on cloud platforms:

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy Umami
railway init
railway add postgresql
railway up
```

See [Umami Railway Guide](https://umami.is/docs/running-on-railway)

## Frontend Integration

### Configure Environment Variables

The frontend is already prepared for Umami. Just set these variables:

#### For Docker Deployment

Add to your `.env` file or `docker-compose.yml`:

```yaml
services:
  frontend:
    environment:
      - UMAMI_WEBSITE_ID=your-website-id
      - UMAMI_SRC=http://localhost:3001/script.js
```

Then inject via JavaScript (requires build step) or use nginx template.

#### For Cloudflare Pages

Set environment variables in Cloudflare Dashboard:
- `UMAMI_WEBSITE_ID`: Your website ID
- `UMAMI_SRC`: Your Umami script URL

#### Manual Configuration

Edit `frontend/index.html` directly:

```html
<script>
    window.UMAMI_WEBSITE_ID = 'your-website-id-here';
    window.UMAMI_SRC = 'https://your-umami-instance.com/script.js';
</script>
```

The existing analytics code will automatically load:

```javascript
// Already in frontend/index.html
(function() {
    const websiteId = window.UMAMI_WEBSITE_ID || '';
    const src = window.UMAMI_SRC || '';
    
    if (websiteId && src) {
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.setAttribute('data-website-id', websiteId);
        script.src = src;
        document.head.appendChild(script);
        console.log('Umami analytics enabled');
    }
})();
```

## Tracking Custom Events

Track specific user actions:

```javascript
// In frontend/app.js

// Track button clicks
document.getElementById('generateBtn').addEventListener('click', () => {
    umami.track('generate-dashboard-click');
    // ... rest of your code
});

// Track successful generations
function handleGenerationSuccess(result) {
    umami.track('dashboard-generated', {
        panels: result.metadata.panelsCount,
        model: result.metadata.model
    });
}

// Track errors
function handleError(error) {
    umami.track('generation-error', {
        error: error.message
    });
}
```

## What Umami Tracks

Default metrics (automatic):
- Page views
- Unique visitors
- Referrers
- Countries
- Browsers
- Operating systems
- Devices (desktop/mobile/tablet)

Custom events (you can add):
- Dashboard generations
- Panel selections
- API errors
- Download clicks

## Privacy Considerations

Umami is GDPR compliant:
- ✅ No cookies used
- ✅ No personal data collected
- ✅ No cross-site tracking
- ✅ Anonymous data only
- ✅ Data stays on your server

### Privacy Policy Text

You can add this to your site:

```
Analytics: We use Umami Analytics, a privacy-focused analytics tool 
that doesn't use cookies and doesn't collect any personal information. 
All data is anonymized and stored on our servers.
```

## Umami Dashboard

### Metrics Overview

Access your analytics at `http://localhost:3001` (or your Umami URL):

1. **Visitors**: Real-time and historical
2. **Page views**: Most popular pages
3. **Referrers**: Where visitors come from
4. **Countries**: Geographic distribution
5. **Events**: Custom event tracking

### Share Dashboard

Make analytics public:
1. Click website → Settings
2. Enable "Share URL"
3. Copy and share the public link

### API Access

Umami provides an API for programmatic access:

```bash
# Get stats
curl -X POST https://your-umami.com/api/websites/{id}/stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startAt":1234567890,"endAt":1234567890}'
```

See [Umami API Docs](https://umami.is/docs/api)

## Advanced Configuration

### Custom Domain for Umami

If self-hosting, use reverse proxy:

```nginx
# nginx config
server {
    listen 80;
    server_name analytics.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Backup

Backup Umami data:

```bash
# Backup PostgreSQL database
docker exec umami-db pg_dump -U umami umami > umami-backup.sql

# Restore
docker exec -i umami-db psql -U umami umami < umami-backup.sql
```

### Update Umami

```bash
# Pull latest image
docker-compose pull umami

# Restart
docker-compose up -d umami
```

## Troubleshooting

### Analytics Not Showing

1. **Check if script loads**:
   - Open browser DevTools → Network
   - Look for `script.js` request
   - Should return 200 OK

2. **Verify website ID**:
   ```javascript
   console.log(window.UMAMI_WEBSITE_ID);
   // Should output your website ID
   ```

3. **Check Umami server**:
   ```bash
   docker-compose logs umami
   ```

### Ad Blockers

Some ad blockers block analytics. To minimize:

1. **Use custom domain**: `analytics.yourdomain.com` instead of `umami.io`
2. **Rename script**: Proxy and rename `script.js` to something else
3. **Self-host**: Better success rate than cloud services

### CORS Issues

If Umami is on different domain:

```bash
# Add to Umami environment
CORS_MAX_AGE=86400
```

### Database Connection Failed

```bash
# Check database status
docker-compose ps umami-db

# Check logs
docker-compose logs umami-db

# Restart if needed
docker-compose restart umami-db umami
```

## Cost Comparison

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Umami Cloud** | $9-20/month | Easy setup, maintained | Recurring cost |
| **Self-hosted** | $5-10/month | Full control, one-time setup | Requires maintenance |
| **With existing infra** | $0 | Free with docker-compose | Uses server resources |

## Alternatives

If Umami doesn't fit:

- **Plausible**: Similar to Umami, paid cloud option
- **Matomo**: More features, heavier
- **GoatCounter**: Lightweight, simple
- **Simple Analytics**: Privacy-focused, paid

## Next Steps

- [Deployment Guide](DEPLOYMENT.md)
- [Docker Setup](DOCKER.md)
- [Cloudflare Deployment](CLOUDFLARE.md)

