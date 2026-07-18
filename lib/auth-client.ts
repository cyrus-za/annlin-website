import { createAuthClient } from "better-auth/react"

// Relative requests keep auth on the current deployment, including Vercel previews.
export const authClient = createAuthClient()

export const {
  signIn,
  signUp,
  signOut,
  changePassword,
  useSession,
  getSession,
} = authClient
