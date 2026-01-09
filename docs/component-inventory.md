# Component Inventory - excalidraw-collab-app

> Generated: 2026-01-08 | Scan Level: Quick

## Overview

| Category | Count |
|----------|-------|
| UI Primitives (shadcn/ui) | 8 |
| Feature Components | 6 |
| **Total** | **14** |

## UI Primitives (shadcn/ui)

Ces composants sont basés sur Radix UI et stylisés avec Tailwind CSS.

| Component | File | Radix Base | Description |
|-----------|------|------------|-------------|
| AlertDialog | `components/ui/alert-dialog.tsx` | `@radix-ui/react-alert-dialog` | Modal de confirmation |
| Avatar | `components/ui/avatar.tsx` | `@radix-ui/react-avatar` | Image utilisateur |
| Button | `components/ui/button.tsx` | `@radix-ui/react-slot` | Bouton avec variantes |
| Card | `components/ui/card.tsx` | - | Container avec style |
| Dialog | `components/ui/dialog.tsx` | `@radix-ui/react-dialog` | Modal générique |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | `@radix-ui/react-dropdown-menu` | Menu déroulant |
| Input | `components/ui/input.tsx` | - | Champ de saisie |
| Sonner | `components/ui/sonner.tsx` | `sonner` | Toast notifications |

### Button Variants

```typescript
// Variantes disponibles
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        destructive: "bg-destructive text-destructive-foreground...",
        outline: "border border-input...",
        secondary: "bg-secondary text-secondary-foreground...",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4...",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
  }
)
```

## Feature Components

### AuthButtons

**File**: `components/AuthButtons.tsx`

**Purpose**: Boutons d'authentification OAuth

**Usage**:
```tsx
<AuthButtons />
```

**Props**: None (utilise les sessions Next-Auth)

---

### DrawingCard

**File**: `components/DrawingCard.tsx`

**Purpose**: Carte de prévisualisation d'un dessin

**Usage**:
```tsx
<DrawingCard
  drawing={drawing}
  onDelete={handleDelete}
/>
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `drawing` | `Drawing` | Données du dessin |
| `onDelete` | `(id: string) => void` | Callback de suppression |

---

### EmptyState

**File**: `components/EmptyState.tsx`

**Purpose**: État vide du dashboard

**Usage**:
```tsx
<EmptyState onCreateNew={handleCreate} />
```

---

### ExcalidrawWrapper

**File**: `components/ExcalidrawWrapper.tsx`

**Purpose**: Wrapper pour la bibliothèque Excalidraw

**Usage**:
```tsx
<ExcalidrawWrapper
  initialData={drawingContent}
  onChange={handleChange}
  readOnly={false}
/>
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `initialData` | `string` | JSON Excalidraw initial |
| `onChange` | `(data: string) => void` | Callback de modification |
| `readOnly` | `boolean` | Mode lecture seule |

---

### SaveIndicator

**File**: `components/SaveIndicator.tsx`

**Purpose**: Indicateur de statut de sauvegarde

**Usage**:
```tsx
<SaveIndicator status="saving" />
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `status` | `'saved' \| 'saving' \| 'error'` | État actuel |

---

### ShareButton

**File**: `components/ShareButton.tsx`

**Purpose**: Bouton de partage avec dialogue

**Usage**:
```tsx
<ShareButton
  drawingId={id}
  isPublic={drawing.isPublic}
  shareId={drawing.shareId}
/>
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `drawingId` | `string` | ID du dessin |
| `isPublic` | `boolean` | État de partage |
| `shareId` | `string \| null` | ID de partage |

## Component Dependencies

```
AuthButtons
└── @/lib/auth (signIn, signOut)

DrawingCard
├── @/components/ui/card
├── @/components/ui/button
├── @/components/ui/alert-dialog
└── next/link

EmptyState
└── @/components/ui/button

ExcalidrawWrapper
└── @excalidraw/excalidraw

SaveIndicator
└── (React only)

ShareButton
├── @/components/ui/button
├── @/components/ui/dialog
├── @/components/ui/input
├── @/actions/share
└── sonner (toast)
```

## Design System

### Colors (Tailwind)

Ce projet utilise le système de couleurs de shadcn/ui avec CSS variables.

### Typography

- Font: System fonts (Tailwind defaults)
- Excalidraw: Custom fonts in `public/fonts/`

### Spacing

Standard Tailwind spacing scale (0.25rem increments)

## Component Usage Patterns

### Server Components vs Client Components

| Type | Components |
|------|------------|
| Server | Pages (app/**/page.tsx) |
| Client | ExcalidrawWrapper, DrawEditor, ViewEditor |

### Import Pattern

```typescript
// UI components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Feature components
import { AuthButtons } from "@/components/AuthButtons"
import { ExcalidrawWrapper } from "@/components/ExcalidrawWrapper"
```
