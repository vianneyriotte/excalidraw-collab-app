"use client"

import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react"

export type SaveStatus = "idle" | "saving" | "unsaved" | "error"

interface SaveIndicatorProps {
  status: SaveStatus
  className?: string
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm px-3 py-1.5 rounded-full",
        {
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400":
            status === "idle",
          "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400":
            status === "saving",
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400":
            status === "unsaved",
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400":
            status === "error",
        },
        className
      )}
    >
      {status === "idle" && (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>Sauvegardé</span>
        </>
      )}
      {status === "saving" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Sauvegarde...</span>
        </>
      )}
      {status === "unsaved" && (
        <>
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span>Non sauvegardé</span>
        </>
      )}
      {status === "error" && (
        <>
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>Erreur</span>
        </>
      )}
    </div>
  )
}
