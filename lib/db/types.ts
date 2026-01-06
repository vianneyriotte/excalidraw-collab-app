export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: number | null
  image: string | null
}

export interface Account {
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
}

export interface Session {
  sessionToken: string
  userId: string
  expires: number
}

export interface VerificationToken {
  identifier: string
  token: string
  expires: number
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

export interface DrawingRow {
  id: string
  userId: string
  title: string
  content: string | null
  thumbnail: string | null
  shareId: string | null
  isPublic: number
  createdAt: number
  updatedAt: number
}

export function rowToDrawing(row: DrawingRow): Drawing {
  return {
    ...row,
    isPublic: row.isPublic === 1,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}
