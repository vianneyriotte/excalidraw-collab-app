import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserDrawings } from "@/actions/drawings"
import { AuthButtons } from "@/components/AuthButtons"
import { DrawingCard } from "@/components/DrawingCard"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PenTool, Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  const result = await getUserDrawings()
  const drawings = result.success ? result.data || [] : []

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <PenTool className="h-6 w-6" />
            Excalidraw Collab
          </Link>
          <AuthButtons session={session} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Mes dessins</h1>
          <Button asChild>
            <Link href="/draw/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau dessin
            </Link>
          </Button>
        </div>

        {drawings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drawings.map((drawing) => (
              <DrawingCard key={drawing.id} drawing={drawing} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
