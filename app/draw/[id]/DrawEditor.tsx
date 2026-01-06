"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { SaveIndicator, type SaveStatus } from "@/components/SaveIndicator"
import { ShareButton } from "@/components/ShareButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, Pencil } from "lucide-react"
import { useAutoSave } from "@/hooks/useAutoSave"
import type { Drawing } from "@/lib/db/schema"
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types"
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"

const ExcalidrawWrapper = dynamic(
  () =>
    import("@/components/ExcalidrawWrapper").then((mod) => mod.ExcalidrawWrapper),
  { ssr: false, loading: () => <div className="h-full w-full bg-zinc-100" /> }
)

interface DrawEditorProps {
  drawing: Drawing
  shareId: string | null
  isPublic: boolean
  onSave: (content: string, thumbnail?: string) => Promise<void>
  onUpdateTitle: (title: string) => Promise<void>
  onTogglePublic: (isPublic: boolean) => Promise<{ shareId: string | null }>
}

export function DrawEditor({
  drawing,
  shareId,
  isPublic,
  onSave,
  onUpdateTitle,
  onTogglePublic,
}: DrawEditorProps) {
  const [title, setTitle] = useState(drawing.title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const { status, debouncedSave, saveNow } = useAutoSave({
    onSave: async (data: string) => {
      await onSave(data)
    },
    debounceMs: 2000,
  })

  const handleChange = useCallback(
    (data: {
      elements: readonly ExcalidrawElement[]
      appState: AppState
      files: BinaryFiles
    }) => {
      const content = JSON.stringify({
        elements: data.elements,
        appState: {
          viewBackgroundColor: data.appState.viewBackgroundColor,
          currentItemFontFamily: data.appState.currentItemFontFamily,
        },
        files: data.files,
      })
      debouncedSave(content)
    },
    [debouncedSave]
  )

  const handleSaveTitle = async () => {
    setIsEditingTitle(false)
    if (title !== drawing.title) {
      await onUpdateTitle(title)
    }
  }

  useEffect(() => {
    const handleSaveNow = () => {
      saveNow()
    }
    window.addEventListener("excalidraw-save-now", handleSaveNow)
    return () => window.removeEventListener("excalidraw-save-now", handleSaveNow)
  }, [saveNow])

  const initialData = drawing.content
    ? JSON.parse(drawing.content)
    : undefined

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-white dark:bg-zinc-950 px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle()
                  if (e.key === "Escape") {
                    setTitle(drawing.title)
                    setIsEditingTitle(false)
                  }
                }}
                className="h-8 w-48"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleSaveTitle}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded"
            >
              <span className="font-medium">{title}</span>
              <Pencil className="h-3 w-3 text-zinc-400" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator status={status} />
          <ShareButton
            drawingId={drawing.id}
            shareId={shareId}
            isPublic={isPublic}
            onTogglePublic={onTogglePublic}
          />
        </div>
      </header>
      <main className="flex-1">
        <ExcalidrawWrapper initialData={initialData} onChange={handleChange} />
      </main>
    </div>
  )
}
