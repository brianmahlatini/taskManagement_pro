# Monitoring Configuration Guide

## Sentry Setup

1. **Install Sentry SDK**:
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

2. **Backend Integration** (add to `backend/src/server.ts`):
   ```typescript
   import * as Sentry from '@sentry/node';
   import * as Tracing from '@sentry/tracing';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.SENTRY_ENVIRONMENT || 'development',
     tracesSampleRate: 1.0,
   });

   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.tracingHandler());
   ```

3. **Frontend Integration** (add to `src/main.tsx`):
   ```typescript
   import * as Sentry from '@sentry/react';
   import { BrowserTracing } from '@sentry/tracing';

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     integrations: [new BrowserTracing()],
     tracesSampleRate: 1.0,
   });
   ```

## Optional: Grafana + Prometheus Setup

### 1. Add Prometheus Metrics to Backend

Install dependencies:
```bash
npm install prom-client express-prom-bundle
```

Add to `backend/src/server.ts`:
```typescript
import expressPromBundle from 'express-prom-bundle';

const metricsMiddleware = expressPromBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUpstream: true,
  customLabels: { project_name: 'task_management' },
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
});

app.use(metricsMiddleware);
```

### 2. Docker Compose for Monitoring (add to production compose)

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - app-network

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-storage:/var/lib/grafana
    networks:
      - app-network

volumes:
  grafana-storage:
```

### 3. Prometheus Configuration (`prometheus.yml`)

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:5000']
```

## Health Check Endpoints

Add to backend routes:
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/metrics', async (req, res) => {
  try {
    const metrics = await client.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});
```

## Logging Configuration

For production logging, consider adding Winston or similar:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});
```

## Alerting Rules

Example Sentry alert rules:
- Error rate > 1% for 5 minutes
- Transaction duration > 2s for 5 minutes
- New issues in production environment