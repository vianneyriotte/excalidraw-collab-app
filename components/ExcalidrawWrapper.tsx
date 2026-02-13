"use client"

import { useCallback, useEffect, useRef } from "react"
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
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="h-full w-full">
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
