import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, "Titel is verplig").max(200, "Titel mag nie langer as 200 karakters wees nie"),
  description: z.string().min(1, "Beskrywing is verplig").max(2000, "Beskrywing mag nie langer as 2000 karakters wees nie"),
  startDate: z.string().datetime("Ongeldige begin datum"),
  endDate: z.string().datetime("Ongeldige eind datum").optional(),
  location: z.string().optional(),
  categoryId: z.string().min(1, "Kategorie is verplig"),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  sermonUrl: z.string().url("Ongeldige URL").optional().or(z.literal("")),
})

const updateEventSchema = createEventSchema.partial()

// GET /api/events - List events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'startDate'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) {
        where.startDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate)
      }
    }
    
    const result = await safeDatabaseOperation(async () => {
      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
      ])
      
      return {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }, 'Fetch events')
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kon nie gebeure laai nie' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result.data)
    
  } catch (error) {
    console.error('Events GET error:', error)
    return NextResponse.json(
      { error: 'Bediener fout' },
      { status: 500 }
    )
  }
}

// POST /api/events - Create event
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    
    // Only admins and editors can create events
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Onvoldoende regte om gebeure te skep' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = createEventSchema.parse(body)
    
    // Validate dates
    const startDate = new Date(validatedData.startDate)
    const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null
    
    if (endDate && endDate <= startDate) {
      return NextResponse.json(
        { error: 'Eind datum moet na begin datum wees' },
        { status: 400 }
      )
    }
    
    const result = await safeDatabaseOperation(async () => {
      // Verify category exists
      const category = await prisma.eventCategory.findUnique({
        where: { id: validatedData.categoryId },
      })
      
      if (!category) {
        throw new Error('Kategorie nie gevind nie')
      }
      
      const event = await prisma.event.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          startDate: new Date(validatedData.startDate),
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
          location: validatedData.location,
          categoryId: validatedData.categoryId,
          isRecurring: validatedData.isRecurring,
          recurringPattern: validatedData.recurringPattern,
          sermonUrl: validatedData.sermonUrl || null,
        },
        include: {
          category: true,
        },
      })
      
      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          entityType: 'Event',
          entityId: event.id,
          changes: validatedData,
        },
      })
      
      return event
    }, 'Create event')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data, { status: 201 })
    
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
    
    console.error('Events POST error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
