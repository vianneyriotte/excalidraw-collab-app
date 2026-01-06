import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenTool, Plus } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-6 mb-6">
        <PenTool className="h-12 w-12 text-zinc-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Aucun dessin</h2>
      <p className="text-zinc-500 mb-6 max-w-sm">
        Vous n&apos;avez pas encore créé de dessin. Commencez à dessiner dès
        maintenant !
      </p>
      <Button asChild>
        <Link href="/draw/new">
          <Plus className="mr-2 h-4 w-4" />
          Créer mon premier dessin
        </Link>
      </Button>
    </div>
  )
}
