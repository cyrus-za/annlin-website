import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'

// Validation schema
const updateEventSchema = z.object({
  title: z.string().min(1, "Titel is verplig").max(200, "Titel mag nie langer as 200 karakters wees nie").optional(),
  description: z.string().min(10, "Beskrywing moet ten minste 10 karakters wees").max(2000, "Beskrywing mag nie langer as 2000 karakters wees nie").optional(),
  startDate: z.string().datetime("Ongeldige begin datum").optional(),
  endDate: z.string().datetime("Ongeldige eind datum").optional(),
  location: z.string().optional(),
  categoryId: z.string().min(1, "Kategorie is verplig").optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  sermonUrl: z.string().url("Ongeldige URL").optional().or(z.literal("")),
})

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const result = await safeDatabaseOperation(async () => {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            },
          },
        },
      })
      
      if (!event) {
        throw new Error('Gebeurtenis nie gevind nie')
      }
      
      return event
    }, 'Fetch event')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 500 }
      )
    }
    
    return NextResponse.json(result.data)
    
  } catch (error) {
    console.error('Event GET error:', error)
    return NextResponse.json(
      { error: 'Bediener fout' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth()
    const { id } = params
    
    // Only admins and editors can update events
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Onvoldoende regte om gebeure te wysig' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)
    
    // Validate dates if provided
    if (validatedData.startDate && validatedData.endDate) {
      const startDate = new Date(validatedData.startDate)
      const endDate = new Date(validatedData.endDate)
      
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'Eind datum moet na begin datum wees' },
          { status: 400 }
        )
      }
    }
    
    const result = await safeDatabaseOperation(async () => {
      // Get current event for audit log
      const currentEvent = await prisma.event.findUnique({
        where: { id },
      })
      
      if (!currentEvent) {
        throw new Error('Gebeurtenis nie gevind nie')
      }
      
      // If category is being updated, verify it exists
      if (validatedData.categoryId) {
        const category = await prisma.eventCategory.findUnique({
          where: { id: validatedData.categoryId },
        })
        
        if (!category) {
          throw new Error('Kategorie nie gevind nie')
        }
      }
      
      // Prepare update data
      const updateData: any = {}
      Object.keys(validatedData).forEach(key => {
        const typedKey = key as keyof typeof validatedData
        if (validatedData[typedKey] !== undefined) {
          if (key === 'startDate' || key === 'endDate') {
            updateData[key] = validatedData[typedKey] ? new Date(validatedData[typedKey] as string) : null
          } else {
            updateData[key] = validatedData[typedKey]
          }
        }
      })
      
      // Update event
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
        },
      })
      
      // Log the changes
      const changes = Object.keys(validatedData).reduce((acc, key) => {
        const typedKey = key as keyof typeof validatedData
        if (validatedData[typedKey] !== undefined) {
          acc[key] = {
            from: currentEvent[typedKey as keyof typeof currentEvent],
            to: validatedData[typedKey],
          }
        }
        return acc
      }, {} as Record<string, any>)
      
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          entityType: 'Event',
          entityId: id,
          changes,
        },
      })
      
      return updatedEvent
    }, 'Update event')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 500 }
      )
    }
    
    return NextResponse.json(result.data)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validasie fout',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }
    
    console.error('Event PUT error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth()
    const { id } = params
    
    // Only admins can delete events
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Slegs administrateurs kan gebeure verwyder' },
        { status: 403 }
      )
    }
    
    const result = await safeDatabaseOperation(async () => {
      // Get current event for audit log
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          category: true,
        },
      })
      
      if (!event) {
        throw new Error('Gebeurtenis nie gevind nie')
      }
      
      // Delete event
      await prisma.event.delete({
        where: { id },
      })
      
      // Log the deletion
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE',
          entityType: 'Event',
          entityId: id,
          changes: { deletedEvent: event },
        },
      })
      
      return { success: true }
    }, 'Delete event')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 400 }
      )
    }
    
    return NextResponse.json({ message: 'Gebeurtenis suksesvol verwyder' })
    
  } catch (error) {
    console.error('Event DELETE error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
