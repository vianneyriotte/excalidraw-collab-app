"use client"

import { useCallback, useRef, useState } from "react"
import type { SaveStatus } from "@/components/SaveIndicator"

interface UseAutoSaveOptions {
  onSave: (data: string) => Promise<void>
  debounceMs?: number
}

export function useAutoSave({ onSave, debounceMs = 2000 }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingDataRef = useRef<string | null>(null)
  const lastSavedDataRef = useRef<string | null>(null)
  const isInitializedRef = useRef(false)

  const save = useCallback(
    async (data: string) => {
      setStatus("saving")
      try {
        await onSave(data)
        lastSavedDataRef.current = data
        setStatus("idle")
      } catch {
        setStatus("error")
      }
    },
    [onSave]
  )

  const debouncedSave = useCallback(
    (data: string) => {
      // Ignorer le premier appel (initialisation d'Excalidraw)
      if (!isInitializedRef.current) {
        isInitializedRef.current = true
        lastSavedDataRef.current = data
        return
      }

      // Ne rien faire si le contenu n'a pas changé
      if (data === lastSavedDataRef.current) {
        return
      }

      pendingDataRef.current = data
      setStatus("unsaved")

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (pendingDataRef.current) {
          save(pendingDataRef.current)
          pendingDataRef.current = null
        }
      }, debounceMs)
    },
    [save, debounceMs]
  )

  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (pendingDataRef.current) {
      save(pendingDataRef.current)
      pendingDataRef.current = null
    }
  }, [save])

  return {
    status,
    debouncedSave,
    saveNow,
  }
}
