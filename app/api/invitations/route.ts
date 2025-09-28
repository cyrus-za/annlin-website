import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, isAdmin } from '@/lib/auth-config'
import { createUserInvitation, getInvitations, cleanupExpiredInvitations } from '@/lib/services/user-invitations'

// Validation schema for creating invitations
const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['ADMIN', 'EDITOR'], {
    errorMap: () => ({ message: 'Role must be either ADMIN or EDITOR' })
  })
})

/**
 * GET /api/invitations - Get all invitations (paginated)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    // Only admins can view invitations
    if (!isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED' | undefined

    // Clean up expired invitations first
    await cleanupExpiredInvitations()

    const result = await getInvitations(page, limit, status)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invitations - Create a new invitation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    // Only admins can create invitations
    if (!isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validationResult = createInvitationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { email, name, role } = validationResult.data

    const invitation = await createUserInvitation({
      email,
      name,
      role,
      invitedBy: session.user.id
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating invitation:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}
