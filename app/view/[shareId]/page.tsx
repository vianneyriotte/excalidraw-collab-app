import { notFound } from "next/navigation"
import { getDrawingByShareId } from "@/actions/share"
import { ViewEditor } from "./ViewEditor"
import Link from "next/link"
import { PenTool } from "lucide-react"

interface ViewPageProps {
  params: Promise<{ shareId: string }>
}

export default async function ViewPage({ params }: ViewPageProps) {
  const { shareId } = await params

  const result = await getDrawingByShareId(shareId)

  if (!result.success || !result.data) {
    notFound()
  }

  const { drawing, userName } = result.data

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-white dark:bg-zinc-950 px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <PenTool className="h-5 w-5" />
            Excalidraw Collab
          </Link>
          <span className="text-zinc-400">|</span>
          <span className="font-medium">{drawing.title}</span>
        </div>
        <div className="text-sm text-zinc-500">
          Partagé par {userName}
        </div>
      </header>
      <main className="flex-1">
        <ViewEditor content={drawing.content} />
      </main>
    </div>
  )
}
