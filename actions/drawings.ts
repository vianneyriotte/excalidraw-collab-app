"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { drawings } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createDrawing() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const [drawing] = await db
      .insert(drawings)
      .values({
        userId: session.user.id,
        title: "Sans titre",
      })
      .returning()

    return { success: true, data: drawing }
  } catch (error) {
    console.error("createDrawing error:", error)
    return { success: false, error: "Erreur lors de la création" }
  }
}

export async function getDrawing(id: string) {
  const session = await auth()

  try {
    const [drawing] = await db
      .select()
      .from(drawings)
      .where(eq(drawings.id, id))
      .limit(1)

    if (!drawing) {
      return { success: false, error: "Dessin non trouvé" }
    }

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
    const [existing] = await db
      .select()
      .from(drawings)
      .where(eq(drawings.id, id))
      .limit(1)

    if (!existing) {
      return { success: false, error: "Dessin non trouvé" }
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Accès non autorisé" }
    }

    const [updated] = await db
      .update(drawings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(drawings.id, id))
      .returning()

    return { success: true, data: updated }
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
    const [existing] = await db
      .select()
      .from(drawings)
      .where(eq(drawings.id, id))
      .limit(1)

    if (!existing) {
      return { success: false, error: "Dessin non trouvé" }
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Accès non autorisé" }
    }

    await db.delete(drawings).where(eq(drawings.id, id))
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
    const userDrawings = await db
      .select()
      .from(drawings)
      .where(eq(drawings.userId, session.user.id))
      .orderBy(desc(drawings.updatedAt))

    return { success: true, data: userDrawings }
  } catch {
    return { success: false, error: "Erreur lors de la récupération" }
  }
}
