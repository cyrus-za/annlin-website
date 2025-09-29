import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

// Get environment variables with fallbacks for development
const getEnvVar = (key: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    // Client-side: return fallback
    return fallback
  }
  // Server-side: try to get from process.env
  return process.env[key] || fallback
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for development
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
    sendOnSignUp: false, // Disable for development
    autoSignInAfterVerification: true,
  },
  trustedOrigins: [getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')],
  secret: getEnvVar('BETTER_AUTH_SECRET', 'dev-secret-key-that-is-at-least-32-characters-long-for-development'),
  baseURL: getEnvVar('BETTER_AUTH_URL', 'http://localhost:3000'),
  plugins: [],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User
