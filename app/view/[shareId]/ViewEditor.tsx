"use client"

import dynamic from "next/dynamic"

const ExcalidrawWrapper = dynamic(
  () =>
    import("@/components/ExcalidrawWrapper").then((mod) => mod.ExcalidrawWrapper),
  { ssr: false, loading: () => <div className="h-full w-full bg-zinc-100" /> }
)

interface ViewEditorProps {
  content: string | null
}

export function ViewEditor({ content }: ViewEditorProps) {
  const initialData = content ? JSON.parse(content) : undefined

  return (
    <ExcalidrawWrapper
      initialData={initialData}
      viewModeEnabled={true}
    />
  )
}
