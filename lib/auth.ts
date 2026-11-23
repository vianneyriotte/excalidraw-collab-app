import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Nodemailer from "next-auth/providers/nodemailer"
import bcrypt from "bcryptjs"
import { createTransport } from "nodemailer"
import { BetterSqliteAdapter } from "@/lib/db/adapter"
import { db } from "@/lib/db"
import type { User } from "@/lib/db/types"
import { authConfig } from "./auth.config"

async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: {
  identifier: string
  url: string
  provider: { server?: unknown; from?: string }
}) {
  const server = provider.server as { host?: string; port?: number }
  console.log(
    `[auth] sending magic link to ${identifier} via ${server.host ?? "undefined"}:${server.port} from ${provider.from ?? "undefined"}`
  )

  try {
    const transport = createTransport(provider.server as Parameters<typeof createTransport>[0])
    const result = await transport.sendMail({
      to: identifier,
      from: provider.from,
      subject: "Connexion à Excalidraw Collab",
      text: `Connectez-vous avec ce lien :\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
      html: `<p>Connectez-vous avec ce lien :</p><p><a href="${url}">Se connecter</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
    })
    const failed = [...(result.rejected ?? []), ...(result.pending ?? [])]
    console.log(
      `[auth] magic link sent: messageId=${result.messageId} accepted=${JSON.stringify(result.accepted)} rejected=${JSON.stringify(result.rejected)} response=${result.response}`
    )
    if (failed.length > 0) {
      throw new Error(`Email rejected for ${failed.join(", ")}`)
    }
  } catch (error) {
    console.error("[auth] magic link failed:", error)
    throw error
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: BetterSqliteAdapter(),
  logger: {
    error(error) {
      console.error("[auth] error:", error.name, error.message, error.cause ?? "")
    },
    warn(code) {
      console.warn("[auth] warn:", code)
    },
  },
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim()
        const password = String(credentials?.password ?? "")
        if (!email || !password) return null

        const user = db
          .prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE")
          .get(email) as User | undefined
        if (!user?.passwordHash || !user.emailVerified) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
})
