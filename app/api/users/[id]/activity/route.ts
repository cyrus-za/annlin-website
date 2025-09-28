import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdmin } from '@/lib/auth-config'
import { getUserActivity } from '@/lib/services/user-management'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/users/[id]/activity - Get user activity log
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    
    // Only admins can view user activity, or users can view their own activity
    if (!isAdmin(session.user) && session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const activities = await getUserActivity(params.id, limit)

    return NextResponse.json({ activities })

  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    )
  }
}
