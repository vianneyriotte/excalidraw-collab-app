import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PenTool } from "lucide-react"
import { LoginForm } from "@/components/LoginForm"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  const { error } = await searchParams

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <PenTool className="h-6 w-6" />
        Excalidraw Collab
      </Link>
      <div className="w-full max-w-sm">
        <LoginForm initialError={error} />
      </div>
    </main>
  )
}
