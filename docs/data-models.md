# Data Models - excalidraw-collab-app

> Generated: 2026-01-08 | Scan Level: Quick

## Overview

| Table | Purpose | Row Count |
|-------|---------|-----------|
| `users` | User accounts | Variable |
| `accounts` | OAuth providers | Variable |
| `sessions` | Active sessions | Variable |
| `verificationTokens` | Email verification | Variable |
| `drawings` | User drawings | Variable |

## Database

- **Engine**: SQLite 3
- **Driver**: better-sqlite3 v12.5.0
- **Location**: `data/sqlite.db`
- **Initialization**: Lazy (on first access)

## Schema

### users

Stocke les informations des utilisateurs (géré par Next-Auth).

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  emailVerified INTEGER,
  image TEXT
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID unique |
| `name` | TEXT | - | Nom d'affichage |
| `email` | TEXT | NOT NULL | Email unique |
| `emailVerified` | INTEGER | - | Timestamp de vérification |
| `image` | TEXT | - | URL de l'avatar |

---

### accounts

Liens entre utilisateurs et providers OAuth (géré par Next-Auth).

```sql
CREATE TABLE IF NOT EXISTS accounts (
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, providerAccountId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `userId` | TEXT | FK → users.id | Référence utilisateur |
| `type` | TEXT | NOT NULL | Type de compte (oauth) |
| `provider` | TEXT | PK | Provider OAuth (github, google) |
| `providerAccountId` | TEXT | PK | ID chez le provider |
| `access_token` | TEXT | - | Token d'accès |
| `refresh_token` | TEXT | - | Token de rafraîchissement |
| `expires_at` | INTEGER | - | Expiration du token |

---

### sessions

Sessions utilisateur (géré par Next-Auth - non utilisé avec JWT).

```sql
CREATE TABLE IF NOT EXISTS sessions (
  sessionToken TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expires INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### verificationTokens

Tokens de vérification email (géré par Next-Auth).

```sql
CREATE TABLE IF NOT EXISTS verificationTokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires INTEGER NOT NULL,
  PRIMARY KEY (identifier, token)
);
```

---

### drawings

Table principale pour les dessins utilisateur.

```sql
CREATE TABLE IF NOT EXISTS drawings (
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

CREATE INDEX IF NOT EXISTS idx_drawings_userId ON drawings(userId);
CREATE INDEX IF NOT EXISTS idx_drawings_shareId ON drawings(shareId);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID unique |
| `userId` | TEXT | FK → users.id | Propriétaire |
| `title` | TEXT | NOT NULL, DEFAULT 'Sans titre' | Titre du dessin |
| `content` | TEXT | - | JSON Excalidraw (éléments) |
| `thumbnail` | TEXT | - | Base64 de la miniature |
| `shareId` | TEXT | UNIQUE | ID court pour partage |
| `isPublic` | INTEGER | DEFAULT 0 | 1=public, 0=privé |
| `createdAt` | INTEGER | - | Timestamp création |
| `updatedAt` | INTEGER | - | Timestamp mise à jour |

## TypeScript Types

```typescript
// lib/db/types.ts

export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
}

export interface Drawing {
  id: string
  userId: string
  title: string
  content: string | null
  thumbnail: string | null
  shareId: string | null
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

// Row type for SQLite (uses INTEGER for booleans/dates)
export interface DrawingRow {
  id: string
  userId: string
  title: string
  content: string | null
  thumbnail: string | null
  shareId: string | null
  isPublic: number  // 0 or 1
  createdAt: number // timestamp
  updatedAt: number // timestamp
}

// Converter function
export function rowToDrawing(row: DrawingRow): Drawing {
  return {
    ...row,
    isPublic: row.isPublic === 1,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}
```

## Entity Relationships

```
┌─────────────┐         ┌─────────────┐
│   users     │         │  accounts   │
├─────────────┤    1:N  ├─────────────┤
│ id (PK)     │◄────────│ userId (FK) │
│ email       │         │ provider    │
│ name        │         │ access_token│
└──────┬──────┘         └─────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐
│  drawings   │
├─────────────┤
│ id (PK)     │
│ userId (FK) │
│ title       │
│ content     │
│ shareId     │
│ isPublic    │
└─────────────┘
```

## Data Access Patterns

### Create Drawing

```typescript
// actions/drawings.ts
const stmt = db.prepare(`
  INSERT INTO drawings (id, userId, title, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?)
`)
stmt.run(id, session.user.id, "Sans titre", now, now)
```

### Get User Drawings

```typescript
const stmt = db.prepare(`
  SELECT * FROM drawings WHERE userId = ? ORDER BY updatedAt DESC
`)
const rows = stmt.all(session.user.id) as DrawingRow[]
```

### Update Drawing

```typescript
const updateStmt = db.prepare(`
  UPDATE drawings SET title = ?, content = ?, updatedAt = ? WHERE id = ?
`)
updateStmt.run(title, content, Date.now(), id)
```

### Get Public Drawing by ShareId

```typescript
const stmt = db.prepare(`
  SELECT d.*, u.name as userName
  FROM drawings d
  LEFT JOIN users u ON d.userId = u.id
  WHERE d.shareId = ?
`)
```

## Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `idx_drawings_userId` | drawings | userId | Fast user drawings lookup |
| `idx_drawings_shareId` | drawings | shareId | Fast share URL lookup |
| `idx_accounts_userId` | accounts | userId | Fast account lookup |

## Content Structure

### Excalidraw Content (drawings.content)

Le champ `content` contient le JSON sérialisé d'Excalidraw:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "strokeColor": "#000000",
      "backgroundColor": "#ffffff",
      ...
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    ...
  }
}
```

## Migration Strategy

Actuellement, le schéma est créé automatiquement au premier démarrage via `db.exec()` dans `lib/db/index.ts`.

Pour des migrations futures:
1. Backup de la DB existante
2. Scripts SQL de migration
3. Ou utilisation d'un outil comme `better-sqlite3-migrate`
