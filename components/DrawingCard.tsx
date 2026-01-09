"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Check, Copy, Globe, Lock, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { deleteDrawing } from "@/actions/drawings"
import { togglePublic } from "@/actions/share"
import { toast } from "sonner"
import type { Drawing } from "@/lib/db/schema"

interface DrawingCardProps {
  drawing: Drawing
}

export function DrawingCard({ drawing }: DrawingCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [currentIsPublic, setCurrentIsPublic] = useState(drawing.isPublic)
  const [currentShareId, setCurrentShareId] = useState(drawing.shareId)
  const [copied, setCopied] = useState(false)

  const shareUrl = currentShareId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/view/${currentShareId}`
    : ""

  const handleTogglePublic = async () => {
    setShareLoading(true)
    try {
      const result = await togglePublic(drawing.id, !currentIsPublic)
      if (result.success && result.data) {
        setCurrentIsPublic(!currentIsPublic)
        setCurrentShareId(result.data.shareId)
        toast.success(!currentIsPublic ? "Lien de partage créé" : "Partage désactivé")
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour")
      }
    } catch {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Lien copié !")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${drawing.title}" ? Cette action est irréversible.`)) {
      return
    }
    await deleteDrawing(drawing.id)
    startTransition(() => {
      router.refresh()
    })
  }

  const formattedDate = drawing.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(drawing.updatedAt))
    : ""

  return (
    <>
      <Card className="group overflow-hidden">
        <Link href={`/draw/${drawing.id}`}>
          <CardHeader className="p-0">
            <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              {drawing.thumbnail ? (
                <img
                  src={drawing.thumbnail}
                  alt={drawing.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-400">
                  <Pencil className="h-12 w-12" />
                </div>
              )}
            </div>
          </CardHeader>
        </Link>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium truncate">{drawing.title}</h3>
              <p className="text-sm text-zinc-500">{formattedDate}</p>
            </div>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/draw/${drawing.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setDropdownOpen(false)
                    setShareDialogOpen(true)
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isPending ? "Suppression..." : "Supprimer"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Partager le dessin</DialogTitle>
            <DialogDescription>
              Permettez à d&apos;autres personnes de voir votre dessin via un lien public.
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
                disabled={shareLoading}
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
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
