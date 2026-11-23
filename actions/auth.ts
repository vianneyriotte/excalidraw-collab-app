"use server"

import bcrypt from "bcryptjs"
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
