"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Share2, Trash2 } from "lucide-react"
import { useTransition } from "react"
import { deleteDrawing } from "@/actions/drawings"
import type { Drawing } from "@/lib/db/schema"

interface DrawingCardProps {
  drawing: Drawing
}

export function DrawingCard({ drawing }: DrawingCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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
            <DropdownMenu>
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
                <DropdownMenuItem asChild>
                  <Link href={`/draw/${drawing.id}`}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </Link>
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
  )
}
