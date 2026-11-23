import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, PenTool } from "lucide-react"
import { AuthButtons } from "@/components/AuthButtons"
import { PasswordForm } from "@/components/PasswordForm"
import { hasPassword } from "@/actions/auth"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const passwordSet = await hasPassword()

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

      <main className="container mx-auto px-4 py-8 max-w-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Mes dessins
        </Link>
        <h1 className="text-2xl font-bold mb-2">Mot de passe</h1>
        <p className="text-zinc-500 mb-6">
          {passwordSet
            ? "Modifiez le mot de passe de votre compte."
            : "Définissez un mot de passe pour vous connecter sans lien magique."}
        </p>
        <PasswordForm hasPassword={passwordSet} />
      </main>
    </div>
  )
}
