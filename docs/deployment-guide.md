# Deployment Guide - excalidraw-collab-app

> Generated: 2026-01-08 | Scan Level: Quick

## Deployment Options

| Option | Best For | Complexity |
|--------|----------|------------|
| Docker | Self-hosted, VPS | Low |
| Vercel | Quick deployment | Very Low |
| Node.js | Custom infrastructure | Medium |

## Docker Deployment (Recommended)

### Prerequisites

- Docker 20+
- Docker Compose 2+

### Quick Start

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Configuration

Create a `.env` file in the project root:

```bash
AUTH_SECRET=your-secret-key-generated-with-openssl-rand-base64-32
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
NEXTAUTH_URL=https://your-domain.com
```

### Docker Architecture

```
┌─────────────────────────────────────────┐
│             Docker Container            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        Node.js (node:20-alpine)  │   │
│  │                                  │   │
│  │    Next.js Standalone Server     │   │
│  │         (port 3000)              │   │
│  │                                  │   │
│  │  ┌────────────────────────────┐ │   │
│  │  │   SQLite (better-sqlite3)  │ │   │
│  │  │   /app/data/sqlite.db      │ │   │
│  │  └────────────────────────────┘ │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
        │
        ▼ Volume: sqlite_data
   ┌─────────────┐
   │  Persistent │
   │   Storage   │
   └─────────────┘
```

### Build Stages

| Stage | Purpose | Image Size |
|-------|---------|------------|
| `deps` | Install npm dependencies | ~200MB |
| `builder` | Build Next.js application | ~500MB |
| `runner` | Production runtime | ~150MB |

### Data Persistence

The SQLite database is persisted using a Docker volume:

```yaml
volumes:
  sqlite_data:
```

To backup the database:

```bash
# Copy from container
docker cp $(docker-compose ps -q app):/app/data/sqlite.db ./backup.db

# Restore to container
docker cp ./backup.db $(docker-compose ps -q app):/app/data/sqlite.db
```

## Vercel Deployment

### Prerequisites

- Vercel account
- GitHub repository

### Steps

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Environment Variables (Vercel)

| Variable | Required |
|----------|----------|
| `AUTH_SECRET` | Yes |
| `AUTH_GITHUB_ID` | Yes |
| `AUTH_GITHUB_SECRET` | Yes |
| `AUTH_GOOGLE_ID` | Optional |
| `AUTH_GOOGLE_SECRET` | Optional |

> **Note**: SQLite is not recommended for Vercel deployment due to ephemeral file system. Consider using a managed database like PlanetScale, Neon, or Turso.

## Node.js Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "excalidraw-collab" -- start

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

## Security Considerations

### Environment Variables

- Never commit `.env.local` or `.env` files
- Use secrets management in production
- Rotate `AUTH_SECRET` periodically

### OAuth Configuration

Ensure callback URLs are configured correctly:

| Provider | Callback URL |
|----------|--------------|
| GitHub | `https://your-domain.com/api/auth/callback/github` |
| Google | `https://your-domain.com/api/auth/callback/google` |

### HTTPS

Always use HTTPS in production:

```bash
# Update NEXTAUTH_URL
NEXTAUTH_URL=https://your-domain.com
```

## Monitoring

### Health Check

```bash
curl http://localhost:3000
```

### Logs (Docker)

```bash
# Follow logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

## Scaling

### Current Limitations

- SQLite does not support concurrent writes
- Single-node deployment only

### Future Scaling Options

1. Replace SQLite with PostgreSQL/MySQL
2. Use serverless database (PlanetScale, Neon)
3. Implement connection pooling
4. Add Redis for session storage
