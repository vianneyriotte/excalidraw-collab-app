# excalidraw-collab-app - Documentation Index

> Generated: 2026-01-08 | Mode: initial_scan | Scan Level: quick

## Project Overview

| Attribut | Valeur |
|----------|--------|
| **Type** | Application Web Full-Stack (Monolith) |
| **Langage** | TypeScript |
| **Framework** | Next.js 16.1.1 (App Router) |
| **Architecture** | Server Actions Pattern |

## Quick Reference

| Catégorie | Détails |
|-----------|---------|
| **Tech Stack** | Next.js 16 + React 19 + Tailwind CSS 4 + SQLite |
| **Entry Point** | `app/layout.tsx` |
| **Architecture Pattern** | Full-stack monolith with Server Actions |
| **Database** | SQLite (better-sqlite3) |
| **Auth** | Next-Auth v5 (GitHub, Google OAuth) |

## Generated Documentation

### Core Documents

- [Project Overview](./project-overview.md) - Vue d'ensemble du projet
- [Architecture](./architecture.md) - Architecture technique détaillée
- [Source Tree Analysis](./source-tree-analysis.md) - Structure des fichiers

### Development & Deployment

- [Development Guide](./development-guide.md) - Guide de développement
- [Deployment Guide](./deployment-guide.md) - Guide de déploiement

### Technical Reference

- [Component Inventory](./component-inventory.md) - Inventaire des composants UI
- [Data Models](./data-models.md) - Schéma de base de données

## Existing Documentation

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | README par défaut de create-next-app |
| [Dockerfile](../Dockerfile) | Configuration Docker |
| [docker-compose.yml](../docker-compose.yml) | Services Docker Compose |
| [.env.example](../.env.example) | Template des variables d'environnement |

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Build and run
docker-compose up -d
```

## Project Structure

```
excalidraw-collab-app/
├── app/              # Next.js pages
├── components/       # React components
├── lib/              # Utilities
├── actions/          # Server Actions
├── hooks/            # Custom hooks
├── public/           # Static assets
└── data/             # SQLite database
```

## Key Features

| Feature | Status |
|---------|--------|
| Drawing Canvas (Excalidraw) | Active |
| User Authentication (OAuth) | Active |
| Auto-save | Active |
| Public Sharing | Active |
| Dashboard | Active |

## Routes

| URL | Description | Auth |
|-----|-------------|------|
| `/` | Landing page | Public |
| `/dashboard` | User drawings | Required |
| `/draw/[id]` | Drawing editor | Required |
| `/view/[shareId]` | Public view | Public |

---

*Cette documentation a été générée automatiquement par le workflow document-project.*
