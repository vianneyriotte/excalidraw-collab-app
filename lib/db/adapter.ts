import type { Adapter, AdapterUser, AdapterAccount, AdapterSession } from "next-auth/adapters"
import { db } from "./index"
import type { User, Account, Session, VerificationToken } from "./types"

export function BetterSqliteAdapter(): Adapter {
  return {
    createUser(user) {
      const id = crypto.randomUUID()
      const stmt = db.prepare(`
        INSERT INTO users (id, name, email, emailVerified, image)
        VALUES (?, ?, ?, ?, ?)
      `)
      stmt.run(
        id,
        user.name ?? null,
        user.email,
        user.emailVerified ? user.emailVerified.getTime() : null,
        user.image ?? null
      )
      return { ...user, id } as AdapterUser
    },

    getUser(id) {
      const stmt = db.prepare("SELECT * FROM users WHERE id = ?")
      const user = stmt.get(id) as User | undefined
      if (!user) return null
      return {
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      } as AdapterUser
    },

    getUserByEmail(email) {
      const stmt = db.prepare("SELECT * FROM users WHERE email = ?")
      const user = stmt.get(email) as User | undefined
      if (!user) return null
      return {
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      } as AdapterUser
    },

    getUserByAccount({ provider, providerAccountId }) {
      const stmt = db.prepare(`
        SELECT u.* FROM users u
        JOIN accounts a ON u.id = a.userId
        WHERE a.provider = ? AND a.providerAccountId = ?
      `)
      const user = stmt.get(provider, providerAccountId) as User | undefined
      if (!user) return null
      return {
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
      } as AdapterUser
    },

    updateUser(user) {
      const stmt = db.prepare(`
        UPDATE users SET name = ?, email = ?, emailVerified = ?, image = ?
        WHERE id = ?
      `)
      stmt.run(
        user.name ?? null,
        user.email,
        user.emailVerified ? user.emailVerified.getTime() : null,
        user.image ?? null,
        user.id
      )
      return this.getUser!(user.id!) as Promise<AdapterUser>
    },

    async deleteUser(id) {
      const stmt = db.prepare("DELETE FROM users WHERE id = ?")
      stmt.run(id)
      return
    },

    linkAccount(account) {
      const stmt = db.prepare(`
        INSERT INTO accounts (userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run(
        account.userId,
        account.type,
        account.provider,
        account.providerAccountId,
        account.refresh_token ?? null,
        account.access_token ?? null,
        account.expires_at ?? null,
        account.token_type ?? null,
        account.scope ?? null,
        account.id_token ?? null,
        account.session_state ?? null
      )
      return account as AdapterAccount
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const stmt = db.prepare("DELETE FROM accounts WHERE provider = ? AND providerAccountId = ?")
      stmt.run(provider, providerAccountId)
      return
    },

    createSession(session) {
      const stmt = db.prepare(`
        INSERT INTO sessions (sessionToken, userId, expires)
        VALUES (?, ?, ?)
      `)
      stmt.run(session.sessionToken, session.userId, session.expires.getTime())
      return session as AdapterSession
    },

    getSessionAndUser(sessionToken) {
      const stmt = db.prepare(`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.userId = u.id
        WHERE s.sessionToken = ?
      `)
      const row = stmt.get(sessionToken) as (Session & User) | undefined
      if (!row) return null
      return {
        session: {
          sessionToken: row.sessionToken,
          userId: row.userId,
          expires: new Date(row.expires),
        } as AdapterSession,
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          emailVerified: row.emailVerified ? new Date(row.emailVerified) : null,
          image: row.image,
        } as AdapterUser,
      }
    },

    updateSession(session) {
      const stmt = db.prepare(`
        UPDATE sessions SET expires = ? WHERE sessionToken = ?
      `)
      stmt.run(session.expires?.getTime(), session.sessionToken)
      const getStmt = db.prepare("SELECT * FROM sessions WHERE sessionToken = ?")
      const updated = getStmt.get(session.sessionToken) as Session | undefined
      if (!updated) return null
      return {
        ...updated,
        expires: new Date(updated.expires),
      } as AdapterSession
    },

    async deleteSession(sessionToken) {
      const stmt = db.prepare("DELETE FROM sessions WHERE sessionToken = ?")
      stmt.run(sessionToken)
      return
    },

    createVerificationToken(token) {
      const stmt = db.prepare(`
        INSERT INTO verificationTokens (identifier, token, expires)
        VALUES (?, ?, ?)
      `)
      stmt.run(token.identifier, token.token, token.expires.getTime())
      return token
    },

    useVerificationToken({ identifier, token }) {
      const getStmt = db.prepare("SELECT * FROM verificationTokens WHERE identifier = ? AND token = ?")
      const row = getStmt.get(identifier, token) as VerificationToken | undefined
      if (!row) return null
      const deleteStmt = db.prepare("DELETE FROM verificationTokens WHERE identifier = ? AND token = ?")
      deleteStmt.run(identifier, token)
      return {
        ...row,
        expires: new Date(row.expires),
      }
    },
  }
}
