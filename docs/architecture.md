# Architecture - excalidraw-collab-app

> Generated: 2026-01-08 | Scan Level: Quick

## Executive Summary

**excalidraw-collab-app** est une application de dessin collaboratif basée sur Excalidraw. Elle permet aux utilisateurs de créer, sauvegarder et partager des dessins de type tableau blanc.

| Attribut | Valeur |
|----------|--------|
| **Type** | Application Web Full-Stack |
| **Architecture** | Monolith avec Server Actions |
| **Framework** | Next.js 16.1.1 (App Router) |
| **Langage** | TypeScript |
| **Database** | SQLite |
| **Auth** | Next-Auth v5 (OAuth) |

## Technology Stack

### Core Technologies

| Catégorie | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| Framework | Next.js | 16.1.1 | Full-stack avec App Router |
| Runtime | Node.js | 20+ | JavaScript runtime |
| Language | TypeScript | ^5 | Type safety |
| React | React | 19.2.3 | UI library |

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Tailwind CSS | ^4 | Utility-first styling |
| Radix UI | Various | Accessible primitives |
| shadcn/ui | Latest | Component library |
| lucide-react | ^0.562.0 | Icons |
| next-themes | ^0.4.6 | Theme switching |

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| better-sqlite3 | ^12.5.0 | SQLite database |
| Next-Auth | ^5.0.0-beta.30 | Authentication |
| nanoid | ^5.1.6 | ID generation |

### Drawing

| Technologie | Version | Rôle |
|-------------|---------|------|
| @excalidraw/excalidraw | ^0.18.0 | Canvas drawing library |

## Architecture Pattern

### Full-Stack Monolith avec Server Actions

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    React Components                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │ │
│  │  │ DrawEditor  │  │ ShareButton │  │  DrawingCard    │ │ │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │ │
│  │         │                │                   │          │ │
│  │         └────────────────┼───────────────────┘          │ │
│  │                          │                              │ │
│  │                    Server Actions                       │ │
│  └──────────────────────────┼──────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER (Node.js)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Server Actions                       │ │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐ │ │
│  │  │ actions/        │    │ lib/                        │ │ │
│  │  │ - drawings.ts   │───▶│ - db/index.ts (SQLite)      │ │ │
│  │  │ - share.ts      │    │ - auth.ts (Next-Auth)       │ │ │
│  │  └─────────────────┘    └─────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                       Database                          │ │
│  │  ┌─────────────────────────────────────────────────────│ │
│  │  │              SQLite (data/sqlite.db)                │ │ │
│  │  │  - users, accounts, sessions (Next-Auth)            │ │ │
│  │  │  - drawings (Application data)                      │ │ │
│  │  └─────────────────────────────────────────────────────│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Pourquoi Server Actions?

| Avantage | Description |
|----------|-------------|
| Simplicité | Pas de couche API REST à maintenir |
| Type Safety | Types partagés entre client et serveur |
| Sécurité | Validation côté serveur automatique |
| Performance | Moins de latence réseau |

## Data Architecture

### Database Schema

```
┌──────────────────────────────────────────────────────────────┐
│                        SQLite Database                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐         ┌─────────────┐                     │
│  │   users     │◄────────│  accounts   │                     │
│  ├─────────────┤   FK    ├─────────────┤                     │
│  │ id (PK)     │         │ userId      │                     │
│  │ name        │         │ provider    │                     │
│  │ email       │         │ type        │                     │
│  │ image       │         │ access_token│                     │
│  └──────┬──────┘         └─────────────┘                     │
│         │                                                     │
│         │                ┌─────────────┐                     │
│         │       FK       │  sessions   │                     │
│         ├───────────────▶├─────────────┤                     │
│         │                │ sessionToken│                     │
│         │                │ userId      │                     │
│         │                │ expires     │                     │
│         │                └─────────────┘                     │
│         │                                                     │
│         │                ┌─────────────┐                     │
│         │       FK       │  drawings   │                     │
│         └───────────────▶├─────────────┤                     │
│                          │ id (PK)     │                     │
│                          │ userId      │                     │
│                          │ title       │                     │
│                          │ content     │   (JSON Excalidraw) │
│                          │ thumbnail   │                     │
│                          │ shareId     │                     │
│                          │ isPublic    │                     │
│                          │ timestamps  │                     │
│                          └─────────────┘                     │
│                                                               │
│  ┌─────────────────────────┐                                 │
│  │  verificationTokens     │                                 │
│  ├─────────────────────────┤                                 │
│  │ identifier, token       │                                 │
│  └─────────────────────────┘                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Data Access Layer

```
lib/db/
├── index.ts      # Connection singleton with lazy init
├── adapter.ts    # Next-Auth SQLite adapter
├── types.ts      # TypeScript types
└── schema.ts     # Type exports

actions/
├── drawings.ts   # CRUD for drawings
└── share.ts      # Sharing functionality
```

## Authentication

### Flow

```
User ──▶ Sign In ──▶ OAuth Provider ──▶ Callback ──▶ JWT Session
                         │
                    (GitHub/Google)
```

### Protected Routes

```typescript
// middleware.ts
const isProtectedRoute =
  nextUrl.pathname.startsWith("/dashboard") ||
  nextUrl.pathname.startsWith("/draw")
```

| Route Pattern | Protection |
|---------------|------------|
| `/` | Public |
| `/dashboard` | Authenticated |
| `/draw/[id]` | Authenticated + Owner |
| `/view/[shareId]` | Public (if shared) |

## Component Architecture

### Component Hierarchy

```
app/layout.tsx (Root Layout)
├── SessionProvider (Next-Auth)
├── ThemeProvider (next-themes)
└── Toaster (sonner)
    │
    ├── app/page.tsx (Landing)
    │   └── AuthButtons
    │
    ├── app/dashboard/page.tsx
    │   ├── DrawingCard[]
    │   └── EmptyState
    │
    ├── app/draw/[id]/page.tsx
    │   └── DrawEditor
    │       ├── ExcalidrawWrapper
    │       ├── SaveIndicator
    │       └── ShareButton
    │
    └── app/view/[shareId]/page.tsx
        └── ViewEditor
            └── ExcalidrawWrapper (read-only)
```

### Component Categories

| Category | Components | Purpose |
|----------|------------|---------|
| UI Primitives | button, card, dialog, etc. | shadcn/ui base |
| Feature | AuthButtons, ShareButton, etc. | Business logic |
| Wrapper | ExcalidrawWrapper | Library integration |

## API Design

### Server Actions

Ce projet utilise des Server Actions au lieu d'une API REST traditionnelle.

#### drawings.ts

| Action | Input | Output | Auth |
|--------|-------|--------|------|
| `createDrawing` | - | `Drawing` | Required |
| `getDrawing` | `id` | `Drawing` | Owner or Public |
| `updateDrawing` | `id, data` | `Drawing` | Owner only |
| `deleteDrawing` | `id` | `void` | Owner only |
| `getUserDrawings` | - | `Drawing[]` | Required |

#### share.ts

| Action | Input | Output | Auth |
|--------|-------|--------|------|
| `togglePublic` | `drawingId, isPublic` | `shareId` | Owner only |
| `getPublicDrawing` | `shareId` | `Drawing` | None |
| `getDrawingByShareId` | `shareId` | `Drawing + userName` | None |

## Security

### Authentication

- OAuth providers only (no password storage)
- JWT sessions (stateless)
- CSRF protection via Next-Auth

### Authorization

- Row-level security in Server Actions
- Owner checks before mutations
- Public flag for sharing

### Data Protection

- SQLite on local filesystem (not network exposed)
- No sensitive data in client bundle
- Environment variables for secrets

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│             Docker Container            │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │        Next.js Standalone        │  │
│  │           (node:20-alpine)       │  │
│  │                                  │  │
│  │  ┌────────────────────────────┐ │  │
│  │  │        SQLite              │ │  │
│  │  │   /app/data/sqlite.db      │ │  │
│  │  └────────────────────────────┘ │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Port: 3000                            │
└─────────────────────────────────────────┘
         │
         ▼ Volume
    ┌──────────┐
    │ sqlite_  │
    │  data    │
    └──────────┘
```

## Performance Considerations

### Current Optimizations

| Feature | Implementation |
|---------|----------------|
| Lazy DB init | Proxy pattern delays connection |
| Standalone build | Reduced Docker image size |
| React 19 | Latest optimizations |
| Server Actions | No REST overhead |

### Potential Improvements

| Area | Recommendation |
|------|----------------|
| Database | PostgreSQL for concurrent writes |
| Caching | Redis for session storage |
| Images | CDN for thumbnails |
| Drawing | Incremental sync instead of full content |

## Future Considerations

### Scaling Path

1. Replace SQLite with PostgreSQL
2. Add Redis for caching/sessions
3. Implement WebSocket for real-time collaboration
4. Add CDN for static assets

### Feature Ideas

- Real-time collaboration (WebSocket)
- Export to PNG/SVG
- Team workspaces
- Template library
