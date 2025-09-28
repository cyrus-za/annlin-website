import { prisma } from '../db'
import type { User, UserRole } from '../db'
import { createAuditLog, AUDIT_ACTIONS, ENTITY_TYPES } from './audit-log'

export interface UpdateUserData {
  name?: string
  role?: UserRole
  image?: string
}

export interface UserWithStats extends User {
  _count: {
    articles: number
    auditLogs: number
    invitations: number
  }
}

/**
 * Get all users with pagination and stats
 */
export async function getUsers(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ users: UserWithStats[]; total: number; totalPages: number }> {
  try {
    const offset = (page - 1) * limit
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              articles: true,
              auditLogs: true,
              invitations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Error getting users:', error)
    return { users: [], total: 0, totalPages: 0 }
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserWithStats | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            auditLogs: true,
            invitations: true
          }
        }
      }
    })

    return user
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

/**
 * Update user
 */
export async function updateUser(id: string, data: UpdateUserData, updatedBy: string): Promise<User | null> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data
    })

    // Log the update (audit trail)
    await createAuditLog({
      userId: updatedBy,
      action: AUDIT_ACTIONS.UPDATE_USER,
      entityType: ENTITY_TYPES.USER,
      entityId: id,
      changes: {
        before: {}, // We'd need to fetch the old data first for a complete audit
        after: data
      }
    })

    return user
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

/**
 * Activate user (set emailVerified to true)
 */
export async function activateUser(id: string, activatedBy: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id },
      data: { emailVerified: true }
    })

    // Log the activation
    await createAuditLog({
      userId: activatedBy,
      action: AUDIT_ACTIONS.ACTIVATE_USER,
      entityType: ENTITY_TYPES.USER,
      entityId: id,
      changes: {
        emailVerified: true
      }
    })

    return true
  } catch (error) {
    console.error('Error activating user:', error)
    return false
  }
}

/**
 * Deactivate user (set emailVerified to false)
 */
export async function deactivateUser(id: string, deactivatedBy: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id },
      data: { emailVerified: false }
    })

    // Invalidate all user sessions
    await prisma.session.deleteMany({
      where: { userId: id }
    })

    // Log the deactivation
    await createAuditLog({
      userId: deactivatedBy,
      action: AUDIT_ACTIONS.DEACTIVATE_USER,
      entityType: ENTITY_TYPES.USER,
      entityId: id,
      changes: {
        emailVerified: false,
        sessionsCleared: true
      }
    })

    return true
  } catch (error) {
    console.error('Error deactivating user:', error)
    return false
  }
}

/**
 * Delete user (soft delete by deactivating and anonymizing)
 */
export async function deleteUser(id: string, deletedBy: string): Promise<boolean> {
  try {
    // Don't actually delete the user to preserve audit trail
    // Instead, deactivate and anonymize
    const anonymizedEmail = `deleted_${id}@deleted.local`
    const anonymizedName = `Deleted User ${id.slice(-8)}`

    await prisma.user.update({
      where: { id },
      data: {
        email: anonymizedEmail,
        name: anonymizedName,
        emailVerified: false,
        image: null
      }
    })

    // Clear all sessions
    await prisma.session.deleteMany({
      where: { userId: id }
    })

    // Clear all accounts
    await prisma.account.deleteMany({
      where: { userId: id }
    })

    // Log the deletion
    await createAuditLog({
      userId: deletedBy,
      action: AUDIT_ACTIONS.DELETE_USER,
      entityType: ENTITY_TYPES.USER,
      entityId: id,
      changes: {
        anonymized: true,
        email: anonymizedEmail,
        name: anonymizedName
      }
    })

    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivity(
  userId: string,
  limit: number = 20
): Promise<Array<{
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: Date
  changes: unknown
}>> {
  try {
    const activities = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        changes: true
      }
    })

    return activities
  } catch (error) {
    console.error('Error getting user activity:', error)
    return []
  }
}

/**
 * Check if user can be deleted (not the last admin)
 */
export async function canDeleteUser(userId: string): Promise<{ canDelete: boolean; reason?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
        return { canDelete: false, reason: 'Gebruiker nie gevind nie' }
    }

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          role: 'ADMIN',
          emailVerified: true
        }
      })

      if (adminCount <= 1) {
        return { canDelete: false, reason: 'Kan nie die laaste aktiewe admin gebruiker verwyder nie' }
      }
    }

    return { canDelete: true }
  } catch (error) {
    console.error('Error checking if user can be deleted:', error)
    return { canDelete: false, reason: 'Fout tydens kontrole van gebruiker verwydering geskiktheid' }
  }
}
