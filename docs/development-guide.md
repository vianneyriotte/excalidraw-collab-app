# Development Guide - excalidraw-collab-app

> Generated: 2026-01-08 | Scan Level: Quick

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20+ | LTS recommended |
| npm | 10+ | Included with Node.js |
| Git | Latest | Version control |

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd excalidraw-collab-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your values
```

#### Required Environment Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `AUTH_SECRET` | JWT signing secret | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID | [GitHub Developer Settings](https://github.com/settings/developers) |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret | GitHub Developer Settings |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | Google Cloud Console |
| `DATABASE_URL` | SQLite database path | Default: `file:./data/sqlite.db` |
| `NEXTAUTH_URL` | Application URL | Default: `http://localhost:3000` |

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Architecture

### Directory Structure

```
app/           → Next.js App Router pages
components/    → React components
lib/           → Shared utilities
actions/       → Server Actions
hooks/         → Custom React hooks
public/        → Static assets
data/          → SQLite database (runtime)
```

### Key Technologies

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Full-stack framework |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| SQLite | Database |
| Next-Auth | Authentication |
| Excalidraw | Drawing canvas |

## Database

The application uses SQLite with lazy initialization. The database is created automatically on first access at `data/sqlite.db`.

### Schema

```sql
-- Users table (Next-Auth)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  emailVerified INTEGER,
  image TEXT
);

-- Drawings table
CREATE TABLE drawings (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Sans titre',
  content TEXT,
  thumbnail TEXT,
  shareId TEXT UNIQUE,
  isPublic INTEGER DEFAULT 0,
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### Resetting the Database

```bash
# Delete the database file
rm data/sqlite.db

# Restart the application - tables will be recreated
npm run dev
```

## Authentication

Authentication is handled by Next-Auth v5 with JWT strategy.

### Supported Providers

- GitHub OAuth
- Google OAuth

### Protected Routes

| Route | Protection |
|-------|------------|
| `/dashboard` | Requires authentication |
| `/draw/[id]` | Requires authentication |
| `/view/[shareId]` | Public (for shared drawings) |
| `/` | Public |

## Code Style

### TypeScript

- Strict mode enabled
- Path aliases: `@/*` maps to project root

### Formatting

- ESLint for linting
- Tailwind CSS for styling

### Import Order

```typescript
// 1. React/Next imports
import { useState } from "react"
import { useRouter } from "next/navigation"

// 2. External libraries
import { nanoid } from "nanoid"

// 3. Internal imports (using @/ alias)
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"

// 4. Types
import type { Drawing } from "@/lib/db/types"
```

## Testing

> **Note**: No test framework is currently configured.

### Recommended Setup

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Troubleshooting

### Common Issues

#### SQLite build errors

```bash
# Install build tools (macOS)
xcode-select --install

# Install build tools (Ubuntu)
sudo apt-get install build-essential python3
```

#### Authentication not working

1. Verify OAuth credentials in `.env.local`
2. Check `NEXTAUTH_URL` matches your development URL
3. Ensure callback URLs are configured in OAuth provider settings

#### Database errors

```bash
# Check database exists
ls -la data/

# Reset database
rm data/sqlite.db && npm run dev
```
