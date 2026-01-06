"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { drawings, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function togglePublic(drawingId: string, isPublic: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const [existing] = await db
      .select()
      .from(drawings)
      .where(eq(drawings.id, drawingId))
      .limit(1)

    if (!existing) {
      return { success: false, error: "Dessin non trouvé" }
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Accès non autorisé" }
    }

    const shareId = isPublic ? nanoid(10) : null

    const [updated] = await db
      .update(drawings)
      .set({
        isPublic,
        shareId,
        updatedAt: new Date(),
      })
      .where(eq(drawings.id, drawingId))
      .returning()

    return { success: true, data: { shareId: updated.shareId } }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function getPublicDrawing(shareId: string) {
  try {
    const [drawing] = await db
      .select()
      .from(drawings)
      .where(eq(drawings.shareId, shareId))
      .limit(1)

    if (!drawing) {
      return { success: false, error: "Dessin non trouvé" }
    }

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
    const [drawing] = await db
      .select({
        shareId: drawings.shareId,
        isPublic: drawings.isPublic,
      })
      .from(drawings)
      .where(eq(drawings.id, drawingId))
      .limit(1)

    if (!drawing) {
      return { success: false, error: "Dessin non trouvé" }
    }

    return { success: true, data: drawing }
  } catch {
    return { success: false, error: "Erreur lors de la récupération" }
  }
}

export async function getDrawingByShareId(shareId: string) {
  try {
    const [result] = await db
      .select({
        drawing: drawings,
        userName: users.name,
      })
      .from(drawings)
      .leftJoin(users, eq(drawings.userId, users.id))
      .where(eq(drawings.shareId, shareId))
      .limit(1)

    if (!result) {
      return { success: false, error: "Dessin non trouvé" }
    }

    if (!result.drawing.isPublic) {
      return { success: false, error: "Ce dessin n'est pas public" }
    }

    return {
      success: true,
      data: {
        drawing: result.drawing,
        userName: result.userName || "Utilisateur anonyme",
      },
    }
  } catch {
    return { success: false, error: "Erreur lors de la récupération" }
  }
}
