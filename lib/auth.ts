import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"
import { env } from "./env"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "EDITOR",
        input: false, // Don't allow setting role through registration
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  trustedOrigins: [env.server.NEXT_PUBLIC_APP_URL],
  secret: env.server.BETTER_AUTH_SECRET,
  baseURL: env.server.BETTER_AUTH_URL,
  plugins: [],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User
