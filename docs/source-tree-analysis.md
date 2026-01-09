# Source Tree Analysis - excalidraw-collab-app

> Generated: 2026-01-08 | Scan Level: Quick

## Project Structure

```
excalidraw-collab-app/
├── app/                          # Next.js App Router (Pages & API)
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page (/)
│   ├── globals.css              # Global styles (Tailwind)
│   ├── favicon.ico              # App favicon
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts     # Next-Auth API handler
│   ├── dashboard/
│   │   └── page.tsx             # User dashboard (/dashboard)
│   ├── draw/
│   │   └── [id]/
│   │       ├── page.tsx         # Drawing page (/draw/[id])
│   │       └── DrawEditor.tsx   # Excalidraw editor component
│   └── view/
│       └── [shareId]/
│           ├── page.tsx         # Public view (/view/[shareId])
│           └── ViewEditor.tsx   # Read-only Excalidraw viewer
│
├── components/                   # React Components
│   ├── ui/                      # shadcn/ui primitives
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   └── sonner.tsx           # Toast notifications
│   ├── AuthButtons.tsx          # OAuth sign-in/out buttons
│   ├── DrawingCard.tsx          # Drawing preview card
│   ├── EmptyState.tsx           # Empty dashboard state
│   ├── ExcalidrawWrapper.tsx    # Excalidraw integration
│   ├── SaveIndicator.tsx        # Auto-save status
│   └── ShareButton.tsx          # Share functionality
│
├── lib/                          # Shared Utilities
│   ├── auth.ts                  # Next-Auth exports
│   ├── auth.config.ts           # Auth configuration
│   ├── utils.ts                 # Utility functions (cn)
│   └── db/                      # Database Layer
│       ├── index.ts             # SQLite connection (lazy init)
│       ├── adapter.ts           # Next-Auth SQLite adapter
│       ├── schema.ts            # Type exports
│       └── types.ts             # TypeScript types
│
├── actions/                      # Server Actions
│   ├── drawings.ts              # CRUD operations for drawings
│   └── share.ts                 # Sharing functionality
│
├── hooks/                        # Custom React Hooks
│   └── useAutoSave.ts           # Auto-save hook for editor
│
├── public/                       # Static Assets
│   └── fonts/                   # Excalidraw fonts
│       ├── Assistant/
│       ├── Cascadia/
│       ├── ComicShanns/
│       ├── Excalifont/
│       ├── Liberation/
│       ├── Lilita/
│       ├── Nunito/
│       ├── Virgil/
│       └── Xiaolai/
│
├── data/                         # Runtime Data
│   └── sqlite.db                # SQLite database
│
├── middleware.ts                 # Auth middleware
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── components.json               # shadcn/ui config
├── Dockerfile                    # Docker image
├── docker-compose.yml            # Docker services
├── .env.example                  # Environment template
└── .env.local                    # Local environment
```

## Critical Directories

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `app/` | Next.js pages and API routes | layout.tsx, page.tsx |
| `app/api/auth/` | Authentication API | [...nextauth]/route.ts |
| `app/dashboard/` | User dashboard page | page.tsx |
| `app/draw/[id]/` | Drawing editor | page.tsx, DrawEditor.tsx |
| `app/view/[shareId]/` | Public view | page.tsx, ViewEditor.tsx |
| `components/` | React components | All .tsx files |
| `components/ui/` | UI primitives | shadcn components |
| `lib/` | Shared utilities | auth.ts, utils.ts |
| `lib/db/` | Database layer | index.ts, adapter.ts |
| `actions/` | Server Actions | drawings.ts, share.ts |
| `hooks/` | Custom hooks | useAutoSave.ts |

## Entry Points

| Entry Point | File | Purpose |
|-------------|------|---------|
| App Layout | `app/layout.tsx` | Root layout with providers |
| Home Page | `app/page.tsx` | Landing page |
| Auth Handler | `app/api/auth/[...nextauth]/route.ts` | OAuth callbacks |
| Middleware | `middleware.ts` | Route protection |

## Data Flow

```
User Request
    │
    ▼
middleware.ts (Auth check)
    │
    ▼
app/[route]/page.tsx (Server Component)
    │
    ├──▶ actions/*.ts (Server Actions)
    │        │
    │        ▼
    │    lib/db/index.ts (SQLite)
    │        │
    │        ▼
    │    data/sqlite.db
    │
    ▼
components/*.tsx (Client Components)
    │
    ▼
Response
```

## File Statistics

| Category | Count |
|----------|-------|
| TypeScript Files (.ts/.tsx) | 28 |
| Pages | 4 |
| Components | 14 |
| Server Actions | 9 |
| Hooks | 1 |
| Database Tables | 5 |
