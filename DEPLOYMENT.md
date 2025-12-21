# Deployment Guide

This guide covers deploying the Vue + NestJS application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Node.js 20+ (for local development)

## Quick Start with Docker Compose

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vue-drizzle-sqlite-boilerplate
```

### 2. Set Up Environment Variables

#### Server Environment Variables

Create `server/.env` file:

```env
DATABASE_PATH=./db/data/sqlite.db
PORT=3000
NODE_ENV=production
CLIENT_URL=http://localhost:5173
```

#### Client Environment Variables

Create `client/.env.production` file:

```env
VITE_API_URL=http://localhost:3000
```

**Note:** For production deployments, update `CLIENT_URL` and `VITE_API_URL` to match your domain.

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Client (Frontend):** http://localhost:5173
- **Server (API):** http://localhost:3000

## Individual Docker Builds

### Building the Client

```bash
# Build the client image
docker build -f Dockerfile.client -t vue-drizzle-client .

# Run the client container
docker run -d -p 5173:80 --name vue-client vue-drizzle-client
```

### Building the Server

```bash
# Build the server image
docker build -f Dockerfile.server -t vue-drizzle-server .

# Run the server container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_PATH=./db/data/sqlite.db \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e CLIENT_URL=http://localhost:5173 \
  -v $(pwd)/server/db/data:/app/db/data \
  --name vue-server \
  vue-drizzle-server
```

## Production Deployment

### Environment Configuration

For production deployments, update the following:

1. **Update `docker-compose.yml` environment variables:**
   ```yaml
   environment:
     - CLIENT_URL=https://your-domain.com
     - NODE_ENV=production
   ```

2. **Update client build-time variables:**
   Create `client/.env.production`:
   ```env
   VITE_API_URL=https://api.your-domain.com
   ```

3. **Rebuild the client with production environment:**
   ```bash
   docker-compose build --build-arg NODE_ENV=production client
   ```

### Database Persistence

The SQLite database is persisted using Docker volumes. The database file is stored at:
- **Host:** `./server/db/data/sqlite.db`
- **Container:** `/app/db/data/sqlite.db`

**Important:** For production, consider:
- Regular database backups
- Using a managed database service (PostgreSQL, MySQL) instead of SQLite
- Setting up automated backup scripts

### Reverse Proxy Setup (Recommended)

For production, use a reverse proxy (nginx, Traefik, or Caddy) in front of your containers:

```nginx
# nginx.conf example
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### SSL/TLS Configuration

Use Let's Encrypt with Certbot or Traefik for automatic SSL certificate management:

```bash
# Example with Traefik labels in docker-compose.yml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.client.rule=Host(`your-domain.com`)"
  - "traefik.http.routers.client.tls.certresolver=letsencrypt"
```

## Database Migrations

### Running Migrations in Docker

```bash
# Enter the server container
docker exec -it vue-drizzle-server sh

# Run migrations
npm run db:migrate
```

### Manual Migration

```bash
# Copy migration files to container
docker cp server/db/migrations vue-drizzle-server:/app/db/migrations

# Run migrations
docker exec vue-drizzle-server npm run db:migrate
```

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
```

### Health Checks

Both services include health checks:
- **Server:** HTTP GET request to `/` endpoint
- **Client:** Nginx default health check

Check health status:
```bash
docker-compose ps
```

## Troubleshooting

### Database Permission Issues

If you encounter database permission errors:

```bash
# Fix permissions
sudo chown -R $USER:$USER server/db/data
chmod -R 755 server/db/data
```

### Port Conflicts

If ports 3000 or 5173 are already in use, update `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change host port
  - "5174:80"    # Change host port
```

### Build Cache Issues

Clear Docker build cache:

```bash
docker-compose build --no-cache
```

### Container Won't Start

Check container logs:

```bash
docker-compose logs server
docker-compose logs client
```

## Development vs Production

### Development

For local development, use:

```bash
# Client
cd client && npm run dev

# Server
cd server && npm run start:dev
```

### Production

Use Docker Compose or individual Docker builds as described above.

## Scaling

### Horizontal Scaling

For scaling the server:

```yaml
# docker-compose.yml
services:
  server:
    # ... existing config
    deploy:
      replicas: 3
```

**Note:** SQLite is not suitable for multiple concurrent writers. For horizontal scaling, migrate to PostgreSQL or MySQL.

## Backup and Recovery

### Database Backup

```bash
# Backup database
docker exec vue-drizzle-server sqlite3 /app/db/data/sqlite.db ".backup /app/db/data/backup.db"

# Copy backup to host
docker cp vue-drizzle-server:/app/db/data/backup.db ./backup-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup.db vue-drizzle-server:/app/db/data/restore.db

# Restore (inside container)
docker exec -it vue-drizzle-server sh
sqlite3 /app/db/data/sqlite.db < /app/db/data/restore.db
```

## Security Considerations

1. **Environment Variables:** Never commit `.env` files
2. **Database:** Use volume mounts for persistence, not bind mounts in production
3. **Network:** Use Docker networks to isolate services
4. **Secrets:** Use Docker secrets or external secret management
5. **Updates:** Regularly update base images and dependencies

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)
- [Vue.js Deployment](https://vuejs.org/guide/scaling-up/deployment.html)

