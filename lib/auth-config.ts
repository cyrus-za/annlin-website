import { auth } from "./auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { User, Session } from "./auth"

/**
 * Get the current session from the request
 */
export async function getSession(): Promise<{ user: User; session: Session } | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<{ user: User; session: Session }> {
  const session = await getSession()
  
  if (!session) {
    redirect("/auth/sign-in")
  }
  
  return session
}

/**
 * Require admin role - redirect if not admin
 */
export async function requireAdmin(): Promise<{ user: User; session: Session }> {
  const session = await requireAuth()
  
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized")
  }
  
  return session
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User, role: "ADMIN" | "EDITOR"): boolean {
  return user.role === role || (role === "EDITOR" && user.role === "ADMIN")
}

/**
 * Check if user can edit content
 */
export function canEdit(user: User): boolean {
  return hasRole(user, "EDITOR")
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return hasRole(user, "ADMIN")
}
