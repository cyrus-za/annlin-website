import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'

// Validation schema
const createCategorySchema = z.object({
  name: z.string().min(1, "Naam is verplig").max(100, "Naam mag nie langer as 100 karakters wees nie"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Ongeldige kleur kode"),
  description: z.string().optional(),
})

// GET /api/events/categories - List event categories
export async function GET() {
  try {
    const result = await safeDatabaseOperation(async () => {
      const categories = await prisma.eventCategory.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      })
      
      return categories
    }, 'Fetch event categories')
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kon nie kategorieë laai nie' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ categories: result.data })
    
  } catch (error) {
    console.error('Event categories GET error:', error)
    return NextResponse.json(
      { error: 'Bediener fout' },
      { status: 500 }
    )
  }
}

// POST /api/events/categories - Create event category
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    
    // Only admins can create categories
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Slegs administrateurs kan kategorieë skep' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)
    
    const result = await safeDatabaseOperation(async () => {
      // Check if category name already exists
      const existingCategory = await prisma.eventCategory.findUnique({
        where: { name: validatedData.name },
      })
      
      if (existingCategory) {
        throw new Error('Kategorie naam bestaan reeds')
      }
      
      const category = await prisma.eventCategory.create({
        data: validatedData,
      })
      
      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          entityType: 'EventCategory',
          entityId: category.id,
          changes: validatedData,
        },
      })
      
      return category
    }, 'Create event category')
    
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
    
    console.error('Event categories POST error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
