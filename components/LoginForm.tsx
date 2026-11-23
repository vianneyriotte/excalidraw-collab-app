"use client"

import { useState, useTransition } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { registerUser } from "@/actions/auth"

type Mode = "login" | "register"

interface LoginFormProps {
  initialError?: string
}

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Email ou mot de passe incorrect, ou email non vérifié.",
  Verification: "Ce lien n'est plus valide. Demandez-en un nouveau.",
}

export function LoginForm({ initialError }: LoginFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(
    initialError ? (ERROR_MESSAGES[initialError] ?? "Connexion impossible.") : null
  )
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const sendMagicLink = async (address: string) => {
    const result = await signIn("nodemailer", {
      email: address,
      redirect: false,
      callbackUrl: "/dashboard",
    })
    if (result?.error) {
      setError("Impossible d'envoyer l'email.")
      return
    }
    setSentTo(address)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      if (mode === "register") {
        const result = await registerUser(email, password)
        if (result.error) {
          setError(result.error)
          return
        }
        await sendMagicLink(email)
        return
      }

      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        setError(ERROR_MESSAGES.CredentialsSignin)
        return
      }
      router.push("/dashboard")
      router.refresh()
    })
  }

  const magicLink = () => {
    setError(null)
    if (!email) {
      setError("Saisissez votre email.")
      return
    }
    startTransition(() => sendMagicLink(email))
  }

  if (sentTo) {
    return (
      <div className="text-center space-y-3">
        <Mail className="h-10 w-10 mx-auto" />
        <h2 className="text-xl font-semibold">Vérifiez votre boîte mail</h2>
        <p className="text-zinc-500">
          Un lien de connexion a été envoyé à <strong>{sentTo}</strong>.
        </p>
        <Button variant="ghost" onClick={() => setSentTo(null)}>
          Retour
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-xl font-semibold text-center">
        {mode === "login" ? "Connexion" : "Créer un compte"}
      </h2>
      <Input
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        type="password"
        placeholder="Mot de passe"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        minLength={mode === "register" ? 8 : undefined}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required={mode === "register"}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending || !password}>
        {mode === "login" ? "Se connecter" : "Créer mon compte"}
      </Button>
      {mode === "login" && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={magicLink}
        >
          <Mail className="mr-2 h-4 w-4" />
          Recevoir un lien de connexion
        </Button>
      )}
      <button
        type="button"
        className="w-full text-sm text-zinc-500 hover:underline"
        onClick={() => {
          setError(null)
          setMode(mode === "login" ? "register" : "login")
        }}
      >
        {mode === "login" ? "Pas de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
      </button>
    </form>
  )
}
