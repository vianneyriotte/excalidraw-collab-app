import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getDrawing, createDrawing, updateDrawing } from "@/actions/drawings"
import { getDrawingForShare, togglePublic } from "@/actions/share"
import { DrawEditor } from "./DrawEditor"

interface DrawPageProps {
  params: Promise<{ id: string }>
}

export default async function DrawPage({ params }: DrawPageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect("/")
  }

  let drawing

  if (id === "new") {
    const result = await createDrawing()
    if (!result.success || !result.data) {
      throw new Error("Impossible de créer le dessin")
    }
    redirect(`/draw/${result.data.id}`)
  } else {
    const result = await getDrawing(id)
    if (!result.success) {
      notFound()
    }
    drawing = result.data!

    if (drawing.userId !== session.user.id) {
      redirect("/dashboard")
    }
  }

  const shareInfo = await getDrawingForShare(drawing.id)
  const shareData = shareInfo.success ? shareInfo.data : null

  return (
    <DrawEditor
      drawing={drawing}
      shareId={shareData?.shareId || null}
      isPublic={shareData?.isPublic || false}
      onSave={async (content: string, thumbnail?: string) => {
        "use server"
        const result = await updateDrawing(drawing.id, { content, thumbnail })
        if (!result.success) {
          throw new Error(result.error)
        }
      }}
      onUpdateTitle={async (title: string) => {
        "use server"
        await updateDrawing(drawing.id, { title })
      }}
      onTogglePublic={async (isPublic: boolean) => {
        "use server"
        const result = await togglePublic(drawing.id, isPublic)
        if (!result.success) {
          throw new Error(result.error)
        }
        return { shareId: result.data?.shareId || null }
      }}
    />
  )
}
