import { prisma } from '../db'
import { sendInvitationEmail } from '../email'
import type { User, UserInvitation, UserRole, UserInvitationStatus } from '../db'

export interface CreateInvitationData {
  email: string
  name: string
  role: UserRole
  invitedBy: string
}

export interface InvitationWithInviter extends UserInvitation {
  inviter: User
}

/**
 * Create a new user invitation
 */
export async function createUserInvitation(data: CreateInvitationData): Promise<UserInvitation | null> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.userInvitation.findFirst({
      where: {
        email: data.email,
        status: 'PENDING'
      }
    })

    if (existingInvitation) {
      throw new Error('Pending invitation already exists for this email')
    }

    // Create the invitation
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const invitation = await prisma.userInvitation.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        invitedBy: data.invitedBy,
        expiresAt,
      },
      include: {
        inviter: true
      }
    })

    // Send invitation email
    const emailSent = await sendInvitationEmail({
      recipientName: data.name,
      recipientEmail: data.email,
      inviterName: invitation.inviter.name,
      inviteToken: invitation.token,
      role: data.role,
    })

    if (!emailSent) {
      console.error('Failed to send invitation email')
      // Don't fail the invitation creation, just log the error
    }

    return invitation

  } catch (error) {
    console.error('Error creating user invitation:', error)
    return null
  }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<InvitationWithInviter | null> {
  try {
    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
      include: {
        inviter: true
      }
    })

    return invitation
  } catch (error) {
    console.error('Error getting invitation by token:', error)
    return null
  }
}

/**
 * Accept an invitation and create the user
 */
export async function acceptInvitation(token: string, _password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Get the invitation
    const invitation = await getInvitationByToken(token)

    if (!invitation) {
      return { success: false, error: 'Invalid invitation token' }
    }

    if (invitation.status !== 'PENDING') {
      return { success: false, error: 'Invitation is no longer valid' }
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await prisma.userInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      return { success: false, error: 'Invitation has expired' }
    }

    // Check if user already exists (race condition check)
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return { success: false, error: 'User already exists' }
    }

    // Create the user (this will be handled by better-auth registration)
    // We'll mark the invitation as accepted but let better-auth handle user creation
    await prisma.userInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    })

    return { success: true }

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return { success: false, error: 'Failed to accept invitation' }
  }
}

/**
 * Get all invitations (with pagination)
 */
export async function getInvitations(
  page: number = 1,
  limit: number = 10,
  status?: UserInvitationStatus
): Promise<{ invitations: InvitationWithInviter[]; total: number; totalPages: number }> {
  try {
    const offset = (page - 1) * limit
    const where = status ? { status } : {}

    const [invitations, total] = await Promise.all([
      prisma.userInvitation.findMany({
        where,
        include: {
          inviter: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.userInvitation.count({ where })
    ])

    return {
      invitations,
      total,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Error getting invitations:', error)
    return { invitations: [], total: 0, totalPages: 0 }
  }
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(invitationId: string, _revokedBy: string): Promise<boolean> {
  try {
    const invitation = await prisma.userInvitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation || invitation.status !== 'PENDING') {
      return false
    }

    await prisma.userInvitation.update({
      where: { id: invitationId },
      data: { status: 'REVOKED' }
    })

    return true
  } catch (error) {
    console.error('Error revoking invitation:', error)
    return false
  }
}

/**
 * Resend an invitation
 */
export async function resendInvitation(invitationId: string): Promise<boolean> {
  try {
    const invitation = await prisma.userInvitation.findUnique({
      where: { id: invitationId },
      include: {
        inviter: true
      }
    })

    if (!invitation || invitation.status !== 'PENDING') {
      return false
    }

    // Extend expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.userInvitation.update({
      where: { id: invitationId },
      data: { expiresAt }
    })

    // Resend email
    const emailSent = await sendInvitationEmail({
      recipientName: invitation.name,
      recipientEmail: invitation.email,
      inviterName: invitation.inviter.name,
      inviteToken: invitation.token,
      role: invitation.role,
    })

    return emailSent
  } catch (error) {
    console.error('Error resending invitation:', error)
    return false
  }
}

/**
 * Clean up expired invitations
 */
export async function cleanupExpiredInvitations(): Promise<number> {
  try {
    const result = await prisma.userInvitation.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: new Date()
        }
      },
      data: {
        status: 'EXPIRED'
      }
    })

    console.log(`Marked ${result.count} invitations as expired`)
    return result.count
  } catch (error) {
    console.error('Error cleaning up expired invitations:', error)
    return 0
  }
}
