# Task Management Application - DevOps & CI/CD Guide

## 🚀 Quick Start

### Start Docker Deployment

```bash
# 1. Start all services in detached mode
docker compose up -d --build

# 2. Wait for containers to start (check with)
docker compose ps

# 3. Access the application:
# - Frontend: http://localhost:3001
# - Backend API: http://localhost:5001
# - Mongo Express: http://localhost:8082

# 4. Stop all services when done
docker compose down
```

### Verify Services Are Running

```bash
# Check container status
docker compose ps

# Check frontend logs
docker compose logs frontend

# Check backend logs
docker compose logs backend

# Test API connection
curl http://localhost:3001/api/
```

## 📋 Common Commands

### Development Workflow

```bash
# Rebuild specific service
docker compose up -d --build frontend
docker compose up -d --build backend

# Restart services
docker compose restart

# View logs in real-time
docker compose logs -f

# Access container shell
docker exec -it project-frontend-1 sh
docker exec -it project-backend-1 sh

# Clean up unused containers
docker system prune -f
```

## 🎯 Port Mapping Reference

| Service | Container Port | Host Port | URL |
|---------|----------------|-----------|-----|
| Frontend | 80 | 3001 | http://localhost:3001 |
| Backend | 5000 | 5001 | http://localhost:5001 |
| MongoDB | 27017 | 27018 | - |
| Redis | 6379 | 6380 | - |
| Mongo Express | 8081 | 8082 | http://localhost:8082 |

## 🚀 Quick Start

### Local Development Setup

1. **Prerequisites**:
   ```bash
   # Install Docker and Docker Compose
   # For Linux:
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

2. **Start Development Environment**:
   ```bash
   # Build and start all services
   docker compose up -d --build

   # Access services:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5001
   - MongoDB: http://localhost:27018
   - Redis: http://localhost:6380
   - Mongo Express (UI): http://localhost:8082
   ```

3. **Stop Services**:
   ```bash
   docker compose down
   ```

4. **Restart Services**:
   ```bash
   docker compose restart
   ```

5. **Rebuild Specific Service**:
   ```bash
   # Rebuild only frontend
   docker compose up -d --build frontend

   # Rebuild only backend
   docker compose up -d --build backend
   ```

3. **Stop Services**:
   ```bash
   docker-compose down
   ```

## 📦 Docker Configuration

### Frontend Dockerfile
- Multi-stage build for optimized production image
- Uses Node 20 for building, Nginx Alpine for serving
- Automatic caching for faster rebuilds

### Backend Dockerfile
- Multi-stage build with production-optimized final image
- Includes uploads directory for file storage
- Environment variables for configuration

## 🐳 Docker Compose Services

### Development (`docker-compose.yml`)
- **Frontend**: Vite development server with hot reload
- **Backend**: Node.js with TypeScript support
- **MongoDB**: Persistent database with Mongo Express UI
- **Redis**: In-memory cache for Socket.IO scaling
- **Network**: Isolated app network for secure communication

### Production (`docker-compose.prod.yml`)
- **Frontend**: Nginx serving static files
- **Backend**: Optimized Node.js production server
- **Nginx Reverse Proxy**: HTTPS termination and load balancing
- **Environment Variables**: Secure configuration via `.env`

## 🤖 CI/CD Pipeline

### GitHub Actions Workflow
1. **Lint**: Code quality checks
2. **Test**: Run unit and integration tests
3. **Build**: Create production-ready artifacts
4. **Push Containers**: Publish to GitHub Container Registry

### Pipeline Triggers
- Runs on pushes to `main` branch
- Runs on pull requests to `main` branch
- Automatic container tagging with Git commit SHA

## 🌐 Nginx Configuration

### Key Features
- Reverse proxy to backend API
- WebSocket support for Socket.IO
- Static file caching with 1-year TTL
- Security headers (X-Frame-Options, X-XSS-Protection)
- API proxy with proper headers

### HTTPS Setup
1. Generate SSL certificates:
   ```bash
   mkdir -p ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/selfsigned.key -out ssl/selfsigned.crt
   ```

2. Update Nginx config to use SSL:
   ```nginx
   server {
     listen 443 ssl;
     server_name yourdomain.com;

     ssl_certificate /etc/nginx/ssl/selfsigned.crt;
     ssl_certificate_key /etc/nginx/ssl/selfsigned.key;

     # ... rest of config
   }
   ```

## ☁️ Production Deployment

### Managed Services Setup

#### MongoDB Atlas
1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Configure network access (whitelist your server IP)
3. Create database user with readWrite permissions
4. Use connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority
   ```

#### Redis Cloud
1. Create Redis instance on preferred provider
2. Configure with TLS for secure connections
3. Use connection string:
   ```
   redis://username:password@host:port
   ```

### Environment Variables
Create `.env.production` file:
```env
# Backend
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanagement
REDIS_URL=redis://username:password@host:port
JWT_SECRET=your_secure_jwt_secret_here
JWT_REFRESH_SECRET=your_secure_jwt_refresh_secret_here
CLIENT_URL=https://yourdomain.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/123456
SENTRY_ENVIRONMENT=production
```

## 🔍 Monitoring Setup

### Sentry Integration
1. Sign up at [Sentry.io](https://sentry.io/)
2. Create project for both frontend and backend
3. Add DSN to environment variables
4. Install SDKs as documented in `monitoring-config.md`

### Optional: Grafana + Prometheus
1. **Prometheus**: Metrics collection and alerting
2. **Grafana**: Visualization dashboards
3. Configuration files provided in `monitoring-config.md`

## 📈 Scaling Considerations

### Horizontal Scaling
```yaml
# Example for scaling backend services
backend:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '0.5'
        memory: '512M'
```

### Database Optimization
- MongoDB: Enable sharding for large datasets
- Redis: Configure persistence and memory limits
- Connection pooling for both databases

## 🚨 Troubleshooting

### Common Issues

1. **Docker Build Failures**:
   ```bash
   docker compose build --no-cache
   ```

2. **Database Connection Issues**:
   ```bash
   docker compose logs mongo
   docker compose logs redis
   ```

3. **Network Connectivity**:
   ```bash
   docker network inspect project_app-network
   ```

4. **Environment Variables**:
   ```bash
   docker compose config
   ```

5. **Backend Connection Issues**:
   - If you get 405 errors when frontend tries to connect to backend:
   ```bash
   # Check if backend is running
   curl -I http://localhost:5001

   # Check if frontend can reach backend
   curl -I http://localhost:3001/api/
   ```

6. **Static File Loading Issues**:
   - If you get 404 errors for JS/CSS files:
   ```bash
   # Check if files exist in container
   docker exec project-frontend-1 ls -la /usr/share/nginx/html/assets/

   # Test if nginx is serving assets
   curl -I http://localhost:3001/assets/index-BYq9RQQP.js
   ```

7. **Missing Icon Files**:
   - If you see "Download error or resource isn't a valid image":
   ```bash
   # Check which icon is missing
   docker exec project-frontend-1 ls -la /usr/share/nginx/html/icons/

   # Add missing icon files to public/icons/ and rebuild
   cp public/icons/icon-192x192.png public/icons/icon-144x144.png
   docker compose up -d --build frontend
   ```

8. **Redis Connection Issues**:
   - If backend fails to start due to Redis:
   ```bash
   # Temporarily disable Redis in backend/src/server.ts
   # Comment out the Redis adapter section
   # Then rebuild backend
   docker compose up -d --build backend
   ```

## 🔄 Update Process

1. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

2. **Rebuild containers**:
   ```bash
   docker-compose build
   ```

3. **Restart services**:
   ```bash
   docker-compose up -d
   ```

4. **Cleanup old images**:
   ```bash
   docker system prune -f
   ```

## 📋 Checklist for Production Deployment

- [ ] Set up managed MongoDB and Redis services
- [ ] Configure domain and SSL certificates
- [ ] Set up monitoring (Sentry + optional Grafana)
- [ ] Configure CI/CD secrets in GitHub
- [ ] Test backup and restore procedures
- [ ] Implement logging and alerting
- [ ] Configure health checks and auto-scaling
- [ ] Set up DNS and load balancing
- [ ] Configure firewall and security groups
- [ ] Test disaster recovery plan


# Build containers (SUCCESSFUL)
docker compose build

# Start development environment
docker compose up -d

# Access services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: http://localhost:27017
- Redis: http://localhost:6379
- Mongo Express: http://localhost:8081
