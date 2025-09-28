import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAdmin } from '@/lib/auth-config'
import { revokeInvitation, resendInvitation } from '@/lib/services/user-invitations'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * PATCH /api/invitations/[id] - Update invitation (revoke or resend)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    
    // Only admins can manage invitations
    if (!isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { action } = body

    if (!action || !['revoke', 'resend'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be either "revoke" or "resend"' },
        { status: 400 }
      )
    }

    let success = false
    let message = ''

    if (action === 'revoke') {
      success = await revokeInvitation(id, session.user.id)
      message = success ? 'Invitation revoked successfully' : 'Failed to revoke invitation'
    } else if (action === 'resend') {
      success = await resendInvitation(id)
      message = success ? 'Invitation resent successfully' : 'Failed to resend invitation'
    }

    if (!success) {
      return NextResponse.json(
        { error: message },
        { status: 400 }
      )
    }

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error updating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to update invitation' },
      { status: 500 }
    )
  }
}
