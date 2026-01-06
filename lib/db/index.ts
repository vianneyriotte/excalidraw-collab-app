import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

function getDatabasePath(): string {
  const dbUrl = process.env.DATABASE_URL || "file:./data/sqlite.db"
  const filePath = dbUrl.replace(/^file:/, "")

  if (path.isAbsolute(filePath)) {
    return filePath
  }

  return path.join(process.cwd(), filePath)
}

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db

  const dbPath = getDatabasePath()
  const dbDir = path.dirname(dbPath)

  // Create directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  _db = new Database(dbPath)

  // Initialize tables on first connection
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL,
      emailVerified INTEGER,
      image TEXT
    );

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

    CREATE TABLE IF NOT EXISTS sessions (
      sessionToken TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expires INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS verificationTokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );

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
    CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
  `)

  return _db
}

// Proxy that lazily initializes the database
export const db = new Proxy({} as Database.Database, {
  get(_, prop) {
    const database = getDb()
    const value = database[prop as keyof Database.Database]
    if (typeof value === "function") {
      return value.bind(database)
    }
    return value
  },
})
