import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, isAdmin } from '@/lib/auth-config'
import { 
  getUserById, 
  updateUser, 
  activateUser, 
  deactivateUser, 
  deleteUser,
  canDeleteUser 
} from '@/lib/services/user-management'

interface RouteParams {
  params: {
    id: string
  }
}

// Validation schema for updating users
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  role: z.enum(['ADMIN', 'EDITOR'], {
    errorMap: () => ({ message: 'Role must be either ADMIN or EDITOR' })
  }).optional(),
  image: z.string().url('Invalid image URL').optional(),
})

// Validation schema for user actions
const userActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete'], {
    errorMap: () => ({ message: 'Action must be activate, deactivate, or delete' })
  })
})

/**
 * GET /api/users/[id] - Get user by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    
    // Only admins can view user details, or users can view their own details
    if (!isAdmin(session.user) && session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const user = await getUserById(params.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[id] - Update user or perform user actions
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    
    // Only admins can update users, or users can update their own profile (limited fields)
    const isUpdatingSelf = session.user.id === params.id
    const canUpdate = isAdmin(session.user) || isUpdatingSelf

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Check if this is an action request
    if (body.action) {
      // Only admins can perform actions
      if (!isAdmin(session.user)) {
        return NextResponse.json(
          { error: 'Insufficient permissions for user actions' },
          { status: 403 }
        )
      }

      const actionValidation = userActionSchema.safeParse(body)
      if (!actionValidation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: actionValidation.error.issues },
          { status: 400 }
        )
      }

      const { action } = actionValidation.data
      let success = false
      let message = ''

      switch (action) {
        case 'activate':
          success = await activateUser(params.id, session.user.id)
          message = success ? 'User activated successfully' : 'Failed to activate user'
          break

        case 'deactivate':
          success = await deactivateUser(params.id, session.user.id)
          message = success ? 'User deactivated successfully' : 'Failed to deactivate user'
          break

        case 'delete':
          const canDelete = await canDeleteUser(params.id)
          if (!canDelete.canDelete) {
            return NextResponse.json(
              { error: canDelete.reason },
              { status: 400 }
            )
          }
          success = await deleteUser(params.id, session.user.id)
          message = success ? 'User deleted successfully' : 'Failed to delete user'
          break
      }

      if (!success) {
        return NextResponse.json(
          { error: message },
          { status: 400 }
        )
      }

      return NextResponse.json({ message })
    }

    // Regular update request
    const validationResult = updateUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // If user is updating themselves, restrict role changes
    if (isUpdatingSelf && updateData.role) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    const updatedUser = await updateUser(params.id, updateData, session.user.id)

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
