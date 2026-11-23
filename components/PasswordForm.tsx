"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { setPassword } from "@/actions/auth"

interface PasswordFormProps {
  hasPassword: boolean
}

export function PasswordForm({ hasPassword }: PasswordFormProps) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (newPassword !== confirmation) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    startTransition(async () => {
      const result = await setPassword(currentPassword, newPassword)
      if (result.error) {
        setError(result.error)
        return
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmation("")
      toast.success(hasPassword ? "Mot de passe modifié" : "Mot de passe défini")
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {hasPassword && (
        <Input
          type="password"
          placeholder="Mot de passe actuel"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      )}
      <Input
        type="password"
        placeholder="Nouveau mot de passe"
        autoComplete="new-password"
        minLength={8}
        required
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
      />
      <Input
        type="password"
        placeholder="Confirmer le mot de passe"
        autoComplete="new-password"
        minLength={8}
        required
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {hasPassword ? "Modifier le mot de passe" : "Définir le mot de passe"}
      </Button>
    </form>
  )
}
