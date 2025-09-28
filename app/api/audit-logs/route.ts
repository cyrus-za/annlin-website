import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdmin } from '@/lib/auth-config'
import { getAuditLogs, getAuditStatistics } from '@/lib/services/audit-log'

/**
 * GET /api/audit-logs - Get audit logs with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    // Only admins can view audit logs
    if (!isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Filters
    const filters = {
      userId: searchParams.get('userId') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      action: searchParams.get('action') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    }

    // Check if requesting statistics
    const includeStats = searchParams.get('stats') === 'true'

    const [logsResult, stats] = await Promise.all([
      getAuditLogs(page, limit, filters),
      includeStats ? getAuditStatistics(filters.dateFrom, filters.dateTo) : Promise.resolve(null)
    ])

    const response = {
      ...logsResult,
      ...(stats && { statistics: stats })
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
