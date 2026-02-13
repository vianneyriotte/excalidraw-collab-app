"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import type {
  ExcalidrawImperativeAPI,
  AppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types"
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"

interface ExcalidrawWrapperProps {
  initialData?: {
    elements?: readonly ExcalidrawElement[]
    appState?: Partial<AppState>
    files?: BinaryFiles
  }
  onChange?: (data: {
    elements: readonly ExcalidrawElement[]
    appState: AppState
    files: BinaryFiles
  }) => void
  viewModeEnabled?: boolean
}

export function ExcalidrawWrapper({
  initialData,
  onChange,
  viewModeEnabled = false,
}: ExcalidrawWrapperProps) {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const [activeTool, setActiveTool] = useState<"hand" | "laser">("hand")

  const switchTool = useCallback((tool: "hand" | "laser") => {
    setActiveTool(tool)
    excalidrawRef.current?.setActiveTool({ type: tool })
  }, [])

  const handleChange = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles
    ) => {
      if (onChange && !viewModeEnabled) {
        onChange({ elements, appState, files })
      }
    },
    [onChange, viewModeEnabled]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent("excalidraw-save-now"))
      }
      if (viewModeEnabled && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "h" || e.key === "H") switchTool("hand")
        if (e.key === "k" || e.key === "K") switchTool("laser")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [viewModeEnabled, switchTool])

  return (
    <div className="h-full w-full relative">
      {viewModeEnabled && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 p-1">
          <button
            onClick={() => switchTool("hand")}
            className={`p-2 rounded-md transition-colors ${
              activeTool === "hand"
                ? "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
            title="Main (H)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </button>
          <button
            onClick={() => switchTool("laser")}
            className={`p-2 rounded-md transition-colors ${
              activeTool === "laser"
                ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
            title="Pointeur laser (K)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 22 L12 12" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <path d="M12 2v4" />
              <path d="M22 12h-4" />
              <path d="M19.07 4.93l-2.83 2.83" />
            </svg>
          </button>
        </div>
      )}
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawRef.current = api
          if (initialData?.elements?.length) {
            setTimeout(() => {
              api.scrollToContent(undefined, { fitToViewport: true, animate: false })
            }, 0)
          }
        }}
        initialData={initialData}
        onChange={handleChange}
        viewModeEnabled={viewModeEnabled}
        UIOptions={{
          canvasActions: {
            loadScene: !viewModeEnabled,
            saveAsImage: true,
            export: viewModeEnabled ? false : {},
            toggleTheme: true,
          },
        }}
      />
    </div>
  )
}
