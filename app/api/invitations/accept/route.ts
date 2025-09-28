import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getInvitationByToken, acceptInvitation } from '@/lib/services/user-invitations'

// Validation schema for accepting invitations
const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
})

/**
 * GET /api/invitations/accept?token=... - Get invitation details by token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const invitation = await getInvitationByToken(token)

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if invitation is still valid
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invitation is no longer valid' },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Return safe invitation data (without sensitive info)
    return NextResponse.json({
      invitation: {
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        inviterName: invitation.inviter.name,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error('Error getting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to get invitation details' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invitations/accept - Accept an invitation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = acceptInvitationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { token, password } = validationResult.data

    const result = await acceptInvitation(token, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Invitation accepted successfully',
      redirectTo: '/auth/sign-in'
    })

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
