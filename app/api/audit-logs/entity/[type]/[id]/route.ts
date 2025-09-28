import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdmin } from '@/lib/auth-config'
import { getEntityAuditLogs } from '@/lib/services/audit-log'

interface RouteParams {
  params: {
    type: string
    id: string
  }
}

/**
 * GET /api/audit-logs/entity/[type]/[id] - Get audit logs for a specific entity
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    
    // Only admins can view audit logs, or users can view their own audit logs
    const isViewingOwnLogs = params.type === 'User' && params.id === session.user.id
    
    if (!isAdmin(session.user) && !isViewingOwnLogs) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const logs = await getEntityAuditLogs(params.type, params.id, limit)

    return NextResponse.json({ logs })

  } catch (error) {
    console.error('Error fetching entity audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entity audit logs' },
      { status: 500 }
    )
  }
}
