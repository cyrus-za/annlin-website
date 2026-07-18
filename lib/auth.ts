import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"
import { env } from "./env"
import { sendPasswordResetEmail } from "./email"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      const sent = await sendPasswordResetEmail({
        recipientName: user.name,
        recipientEmail: user.email,
        resetUrl: url,
      })

      if (!sent) {
        throw new Error('Password reset email delivery failed')
      }
    },
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
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  plugins: [],
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
