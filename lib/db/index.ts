import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "./schema"
import path from "path"

function getDatabasePath(): string {
  const dbUrl = process.env.DATABASE_URL || "file:./data/sqlite.db"
  const filePath = dbUrl.replace(/^file:/, "")

  if (path.isAbsolute(filePath)) {
    return filePath
  }

  return path.join(process.cwd(), filePath)
}

const sqlite = new Database(getDatabasePath())
export const db = drizzle(sqlite, { schema })
