import NextAuth from "next-auth"
import { BetterSqliteAdapter } from "@/lib/db/adapter"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: BetterSqliteAdapter(),
})
