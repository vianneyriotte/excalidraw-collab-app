# Project Overview - excalidraw-collab-app

> Generated: 2026-01-08 | Scan Level: Quick

## About

**excalidraw-collab-app** est une application de dessin collaboratif construite avec Excalidraw et Next.js. Elle permet aux utilisateurs de créer des dessins de type tableau blanc, de les sauvegarder et de les partager publiquement.

## Quick Facts

| Attribut | Valeur |
|----------|--------|
| **Nom** | excalidraw-collab-app |
| **Type** | Application Web Full-Stack |
| **Version** | 0.1.0 |
| **License** | Private |
| **Framework** | Next.js 16.1.1 |
| **Langage** | TypeScript |

## Purpose

Cette application permet de:

1. **Créer des dessins** - Interface Excalidraw complète avec tous les outils
2. **Sauvegarder automatiquement** - Sauvegarde en temps réel dans SQLite
3. **Gérer un dashboard** - Vue d'ensemble de tous les dessins
4. **Partager publiquement** - Liens de partage avec IDs uniques

## Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| **Backend** | Next.js App Router, Server Actions |
| **Database** | SQLite (better-sqlite3) |
| **Auth** | Next-Auth v5 (GitHub, Google OAuth) |
| **Drawing** | Excalidraw |

## Architecture Type

**Full-Stack Monolith avec Server Actions**

- Pas d'API REST traditionnelle
- Communication client-serveur via Server Actions
- Base de données SQLite locale
- Authentification OAuth uniquement

## Repository Structure

```
excalidraw-collab-app/       (Monolith)
├── app/                     Next.js pages
├── components/              React components
├── lib/                     Shared utilities
├── actions/                 Server Actions
├── hooks/                   Custom hooks
├── public/                  Static assets
└── data/                    SQLite database
```

## Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| Drawing Canvas | Active | Excalidraw integration |
| User Authentication | Active | GitHub + Google OAuth |
| Auto-save | Active | Real-time saving |
| Public Sharing | Active | Share links generation |
| Dashboard | Active | Drawing management |
| Thumbnails | Active | Preview generation |

## Entry Points

| URL | Description |
|-----|-------------|
| `/` | Landing page with sign-in |
| `/dashboard` | User's drawings list |
| `/draw/[id]` | Drawing editor |
| `/view/[shareId]` | Public view |

## Links to Documentation

- [Architecture](./architecture.md) - Technical architecture details
- [Development Guide](./development-guide.md) - Setup and development
- [Deployment Guide](./deployment-guide.md) - Deployment instructions
- [Source Tree](./source-tree-analysis.md) - Directory structure
- [Component Inventory](./component-inventory.md) - UI components
- [Data Models](./data-models.md) - Database schema
