"use server"

import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export async function registerUser(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { error: "Adresse email invalide" }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères` }
  }

  const existing = db
    .prepare("SELECT id, emailVerified FROM users WHERE email = ? COLLATE NOCASE")
    .get(normalizedEmail) as { id: string; emailVerified: number | null } | undefined

  const passwordHash = await bcrypt.hash(password, 12)

  if (!existing) {
    db.prepare(
      "INSERT INTO users (id, email, emailVerified, passwordHash) VALUES (?, ?, NULL, ?)"
    ).run(crypto.randomUUID(), normalizedEmail, passwordHash)
    return {}
  }

  if (existing.emailVerified) {
    return { error: "Un compte existe déjà avec cet email. Connectez-vous ou utilisez le lien magique." }
  }

  db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(passwordHash, existing.id)
  return {}
}

export async function setPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Non authentifié" }
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères` }
  }

  const user = db
    .prepare("SELECT passwordHash FROM users WHERE id = ?")
    .get(session.user.id) as { passwordHash: string | null } | undefined
  if (!user) {
    return { error: "Utilisateur introuvable" }
  }

  if (user.passwordHash) {
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return { error: "Mot de passe actuel incorrect" }
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(passwordHash, session.user.id)
  return {}
}

export async function hasPassword(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false
  const user = db
    .prepare("SELECT passwordHash FROM users WHERE id = ?")
    .get(session.user.id) as { passwordHash: string | null } | undefined
  return !!user?.passwordHash
}
