"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Check, Copy, Globe, Lock, Share2 } from "lucide-react"

interface ShareButtonProps {
  drawingId: string
  shareId: string | null
  isPublic: boolean
  onTogglePublic: (isPublic: boolean) => Promise<{ shareId: string | null }>
}

export function ShareButton({
  drawingId,
  shareId,
  isPublic,
  onTogglePublic,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentIsPublic, setCurrentIsPublic] = useState(isPublic)
  const [currentShareId, setCurrentShareId] = useState(shareId)
  const [copied, setCopied] = useState(false)

  const shareUrl = currentShareId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/view/${currentShareId}`
    : ""

  const handleTogglePublic = async () => {
    setLoading(true)
    try {
      const result = await onTogglePublic(!currentIsPublic)
      setCurrentIsPublic(!currentIsPublic)
      setCurrentShareId(result.shareId)
      if (!currentIsPublic) {
        toast.success("Lien de partage créé")
      } else {
        toast.success("Partage désactivé")
      }
    } catch {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Lien copié !")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager le dessin</DialogTitle>
          <DialogDescription>
            Permettez à d&apos;autres personnes de voir votre dessin via un lien
            public.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentIsPublic ? (
                <Globe className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-zinc-500" />
              )}
              <span className="text-sm font-medium">
                {currentIsPublic ? "Public" : "Privé"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublic}
              disabled={loading}
            >
              {currentIsPublic ? "Désactiver" : "Activer le partage"}
            </Button>
          </div>
          {currentIsPublic && currentShareId && (
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button size="icon" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
