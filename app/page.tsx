import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthButtons } from "@/components/AuthButtons"
import Link from "next/link"
import { PenTool, Share2, Save, Shield } from "lucide-react"

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <PenTool className="h-6 w-6" />
            Excalidraw Collab
          </Link>
          <AuthButtons session={session} />
        </div>
      </header>

      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Dessinez, sauvegardez, partagez
        </h1>
        <p className="text-xl text-zinc-500 mb-8 max-w-2xl mx-auto">
          Créez des dessins avec Excalidraw, sauvegardez-les automatiquement et
          partagez-les avec un simple lien.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <AuthButtons session={session} />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 w-fit mx-auto mb-4">
              <Save className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sauvegarde automatique</h3>
            <p className="text-zinc-500">
              Vos dessins sont sauvegardés automatiquement. Ne perdez plus jamais
              votre travail.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 w-fit mx-auto mb-4">
              <Share2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Partage facile</h3>
            <p className="text-zinc-500">
              Partagez vos dessins avec un simple lien. Pas besoin de compte pour
              les visiteurs.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 w-fit mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Vos données</h3>
            <p className="text-zinc-500">
              Application auto-hébergeable. Gardez le contrôle total sur vos
              dessins et vos données.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-zinc-500">
          <p>Propulsé par Excalidraw</p>
        </div>
      </footer>
    </main>
  )
}
