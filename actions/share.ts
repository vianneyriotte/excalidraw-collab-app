"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"
import type { DrawingRow } from "@/lib/db/types"
import { rowToDrawing } from "@/lib/db/types"

export async function togglePublic(drawingId: string, isPublic: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const getStmt = db.prepare("SELECT * FROM drawings WHERE id = ?")
    const existing = getStmt.get(drawingId) as DrawingRow | undefined

    if (!existing) {
      return { success: false, error: "Dessin non trouvé" }
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Accès non autorisé" }
    }

    const shareId = isPublic ? nanoid(10) : null

    const updateStmt = db.prepare(`
      UPDATE drawings SET isPublic = ?, shareId = ?, updatedAt = ? WHERE id = ?
    `)
    updateStmt.run(isPublic ? 1 : 0, shareId, Date.now(), drawingId)

    return { success: true, data: { shareId } }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function getPublicDrawing(shareId: string) {
  try {
    const stmt = db.prepare("SELECT * FROM drawings WHERE shareId = ?")
    const row = stmt.get(shareId) as DrawingRow | undefined

    if (!row) {
      return { success: false, error: "Dessin non trouvé" }
    }

    const drawing = rowToDrawing(row)

    if (!drawing.isPublic) {
      return { success: false, error: "Ce dessin n'est pas public" }
    }

    return { success: true, data: drawing }
  } catch {
    return { success: false, error: "Erreur lors de la récupération" }
  }
}

export async function getDrawingForShare(drawingId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const stmt = db.prepare("SELECT shareId, isPublic FROM drawings WHERE id = ?")
    const row = stmt.get(drawingId) as { shareId: string | null; isPublic: number } | undefined

    if (!row) {
      return { success: false, error: "Dessin non trouvé" }
    }

    return {
      success: true,
      data: {
        shareId: row.shareId,
        isPublic: row.isPublic === 1,
      },
    }
  } catch {
    return { success: false, error: "Erreur lors de la récupération" }
  }
}

export async function getDrawingByShareId(shareId: string) {
  try {
    const stmt = db.prepare(`
      SELECT d.*, u.name as userName
      FROM drawings d
      LEFT JOIN users u ON d.userId = u.id
      WHERE d.shareId = ?
    `)
    const row = stmt.get(shareId) as (DrawingRow & { userName: string | null }) | undefined

    if (!row) {
      return { success: false, error: "Dessin non trouvé" }
    }

    if (row.isPublic !== 1) {
      return { success: false, error: "Ce dessin n'est pas public" }
    }

    const { userName, ...drawingRow } = row

    return {
      success: true,
      data: {
        drawing: rowToDrawing(drawingRow),
        userName: userName || "Utilisateur anonyme",
      },
    }
  } catch {
    return { success: false, error: "Erreur lors de la récupération" }
  }
}
