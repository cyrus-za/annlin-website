import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdmin } from '@/lib/auth-config'
import { getUsers } from '@/lib/services/user-management'

/**
 * GET /api/users - Get all users (paginated)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    // Only admins can view users
    if (!isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined

    const result = await getUsers(page, limit, search)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
