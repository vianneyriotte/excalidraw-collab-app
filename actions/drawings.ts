"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { Drawing, DrawingRow } from "@/lib/db/types"
import { rowToDrawing } from "@/lib/db/types"

export async function createDrawing() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const id = crypto.randomUUID()
    const now = Date.now()

    const stmt = db.prepare(`
      INSERT INTO drawings (id, userId, title, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(id, session.user.id, "Sans titre", now, now)

    const getStmt = db.prepare("SELECT * FROM drawings WHERE id = ?")
    const row = getStmt.get(id) as DrawingRow

    return { success: true, data: rowToDrawing(row) }
  } catch (error) {
    console.error("createDrawing error:", error)
    return { success: false, error: "Erreur lors de la création" }
  }
}

export async function getDrawing(id: string) {
  const session = await auth()

  try {
    const stmt = db.prepare("SELECT * FROM drawings WHERE id = ?")
    const row = stmt.get(id) as DrawingRow | undefined

    if (!row) {
      return { success: false, error: "Dessin non trouvé" }
    }

    const drawing = rowToDrawing(row)

    if (drawing.userId !== session?.user?.id && !drawing.isPublic) {
      return { success: false, error: "Accès non autorisé" }
    }

    return { success: true, data: drawing }
  } catch {
    return { success: false, error: "Erreur lors de la récupération" }
  }
}

export async function updateDrawing(
  id: string,
  data: { title?: string; content?: string; thumbnail?: string }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const getStmt = db.prepare("SELECT * FROM drawings WHERE id = ?")
    const existing = getStmt.get(id) as DrawingRow | undefined

    if (!existing) {
      return { success: false, error: "Dessin non trouvé" }
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Accès non autorisé" }
    }

    const updates: string[] = []
    const values: (string | number)[] = []

    if (data.title !== undefined) {
      updates.push("title = ?")
      values.push(data.title)
    }
    if (data.content !== undefined) {
      updates.push("content = ?")
      values.push(data.content)
    }
    if (data.thumbnail !== undefined) {
      updates.push("thumbnail = ?")
      values.push(data.thumbnail)
    }

    updates.push("updatedAt = ?")
    values.push(Date.now())
    values.push(id)

    const updateStmt = db.prepare(`
      UPDATE drawings SET ${updates.join(", ")} WHERE id = ?
    `)
    updateStmt.run(...values)

    const updatedRow = getStmt.get(id) as DrawingRow
    return { success: true, data: rowToDrawing(updatedRow) }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteDrawing(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const getStmt = db.prepare("SELECT * FROM drawings WHERE id = ?")
    const existing = getStmt.get(id) as DrawingRow | undefined

    if (!existing) {
      return { success: false, error: "Dessin non trouvé" }
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Accès non autorisé" }
    }

    const deleteStmt = db.prepare("DELETE FROM drawings WHERE id = ?")
    deleteStmt.run(id)
    revalidatePath("/dashboard")

    return { success: true }
  } catch {
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

export async function getUserDrawings() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const stmt = db.prepare(`
      SELECT * FROM drawings WHERE userId = ? ORDER BY updatedAt DESC
    `)
    const rows = stmt.all(session.user.id) as DrawingRow[]

    return { success: true, data: rows.map(rowToDrawing) }
  } catch {
    return { success: false, error: "Erreur lors de la récupération" }
  }
}
