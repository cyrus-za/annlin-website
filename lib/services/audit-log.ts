import { prisma } from '../db'
import type { AuditLog } from '../db'

export interface AuditLogEntry {
  userId: string
  action: string
  entityType: string
  entityId: string
  changes: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface AuditLogWithUser extends AuditLog {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export interface AuditLogFilters {
  userId?: string
  entityType?: string
  entityId?: string
  action?: string
  dateFrom?: Date
  dateTo?: Date
}

/**
 * Create an audit log entry
 */
export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  changes,
  metadata
}: AuditLogEntry): Promise<AuditLog | null> {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes: {
          ...changes,
          ...(metadata && { metadata })
        }
      }
    })

    console.log(`Audit log created: ${action} on ${entityType}:${entityId} by user:${userId}`)
    return auditLog
  } catch (error) {
    console.error('Error creating audit log:', error)
    return null
  }
}

/**
 * Get audit logs with pagination and filtering
 */
export async function getAuditLogs(
  page: number = 1,
  limit: number = 50,
  filters: AuditLogFilters = {}
): Promise<{ logs: AuditLogWithUser[]; total: number; totalPages: number }> {
  try {
    const offset = (page - 1) * limit
    
    const where: Record<string, unknown> = {}
    
    if (filters.userId) where.userId = filters.userId
    if (filters.entityType) where.entityType = filters.entityType
    if (filters.entityId) where.entityId = filters.entityId
    if (filters.action) where.action = filters.action
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = filters.dateFrom
      if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = filters.dateTo
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ])

    return {
      logs,
      total,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Error getting audit logs:', error)
    return { logs: [], total: 0, totalPages: 0 }
  }
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 20
): Promise<AuditLogWithUser[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return logs
  } catch (error) {
    console.error('Error getting entity audit logs:', error)
    return []
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  totalLogs: number
  logsByAction: Array<{ action: string; count: number }>
  logsByEntityType: Array<{ entityType: string; count: number }>
  logsByUser: Array<{ user: { name: string; email: string }; count: number }>
  recentActivity: AuditLogWithUser[]
}> {
  try {
    const where: Record<string, unknown> = {}
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = dateFrom
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = dateTo
    }

    const [
      totalLogs,
      logsByAction,
      logsByEntityType,
      logsByUser,
      recentActivity
    ] = await Promise.all([
      // Total logs count
      prisma.auditLog.count({ where }),
      
      // Logs by action
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10
      }),
      
      // Logs by entity type
      prisma.auditLog.groupBy({
        by: ['entityType'],
        where,
        _count: { entityType: true },
        orderBy: { _count: { entityType: 'desc' } },
        take: 10
      }),
      
      // Logs by user
      prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      }),
      
      // Recent activity
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      })
    ])

    // Fetch user details for logsByUser
    const userIds = logsByUser.map(log => log.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    })

    const logsByUserWithDetails = logsByUser.map(log => ({
      user: users.find(user => user.id === log.userId) || { name: 'Unknown', email: 'unknown@example.com' },
      count: log._count.userId
    }))

    return {
      totalLogs,
      logsByAction: logsByAction.map(log => ({
        action: log.action,
        count: log._count.action
      })),
      logsByEntityType: logsByEntityType.map(log => ({
        entityType: log.entityType,
        count: log._count.entityType
      })),
      logsByUser: logsByUserWithDetails,
      recentActivity
    }
  } catch (error) {
    console.error('Error getting audit statistics:', error)
    return {
      totalLogs: 0,
      logsByAction: [],
      logsByEntityType: [],
      logsByUser: [],
      recentActivity: []
    }
  }
}

// Predefined audit actions for consistency
export const AUDIT_ACTIONS = {
  // User Management
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  ACTIVATE_USER: 'ACTIVATE_USER',
  DEACTIVATE_USER: 'DEACTIVATE_USER',
  DELETE_USER: 'DELETE_USER',
  
  // Invitation Management
  CREATE_INVITATION: 'CREATE_INVITATION',
  REVOKE_INVITATION: 'REVOKE_INVITATION',
  RESEND_INVITATION: 'RESEND_INVITATION',
  ACCEPT_INVITATION: 'ACCEPT_INVITATION',
  
  // Content Management
  CREATE_ARTICLE: 'CREATE_ARTICLE',
  UPDATE_ARTICLE: 'UPDATE_ARTICLE',
  PUBLISH_ARTICLE: 'PUBLISH_ARTICLE',
  DELETE_ARTICLE: 'DELETE_ARTICLE',
  
  CREATE_EVENT: 'CREATE_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  
  CREATE_SERVICE_GROUP: 'CREATE_SERVICE_GROUP',
  UPDATE_SERVICE_GROUP: 'UPDATE_SERVICE_GROUP',
  DELETE_SERVICE_GROUP: 'DELETE_SERVICE_GROUP',
  
  CREATE_READING_MATERIAL: 'CREATE_READING_MATERIAL',
  UPDATE_READING_MATERIAL: 'UPDATE_READING_MATERIAL',
  DELETE_READING_MATERIAL: 'DELETE_READING_MATERIAL',
  
  // Contact Management
  VIEW_CONTACT_SUBMISSION: 'VIEW_CONTACT_SUBMISSION',
  UPDATE_CONTACT_SUBMISSION: 'UPDATE_CONTACT_SUBMISSION',
  DELETE_CONTACT_SUBMISSION: 'DELETE_CONTACT_SUBMISSION',
  
  // System Actions
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  
  // File Management
  UPLOAD_FILE: 'UPLOAD_FILE',
  DELETE_FILE: 'DELETE_FILE',
} as const

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]

// Entity types for consistency
export const ENTITY_TYPES = {
  USER: 'User',
  INVITATION: 'UserInvitation',
  ARTICLE: 'Article',
  EVENT: 'Event',
  SERVICE_GROUP: 'ServiceGroup',
  READING_MATERIAL: 'ReadingMaterial',
  CONTACT_SUBMISSION: 'ContactSubmission',
  FILE: 'File',
} as const

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES]
