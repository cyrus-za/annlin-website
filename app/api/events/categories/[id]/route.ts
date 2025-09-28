import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'

// Validation schema
const updateCategorySchema = z.object({
  name: z.string().min(1, "Naam is verplig").max(100, "Naam mag nie langer as 100 karakters wees nie").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Ongeldige kleur kode").optional(),
  description: z.string().optional(),
})

// GET /api/events/categories/[id] - Get single event category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const result = await safeDatabaseOperation(async () => {
      const category = await prisma.eventCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
          events: {
            take: 5,
            orderBy: { startDate: 'desc' },
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
            },
          },
        },
      })
      
      if (!category) {
        throw new Error('Kategorie nie gevind nie')
      }
      
      return category
    }, 'Fetch event category')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 500 }
      )
    }
    
    return NextResponse.json(result.data)
    
  } catch (error) {
    console.error('Event category GET error:', error)
    return NextResponse.json(
      { error: 'Bediener fout' },
      { status: 500 }
    )
  }
}

// PUT /api/events/categories/[id] - Update event category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth()
    const { id } = params
    
    // Only admins can update categories
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Slegs administrateurs kan kategorieë wysig' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)
    
    const result = await safeDatabaseOperation(async () => {
      // Get current category for audit log
      const currentCategory = await prisma.eventCategory.findUnique({
        where: { id },
      })
      
      if (!currentCategory) {
        throw new Error('Kategorie nie gevind nie')
      }
      
      // Check if name already exists (if updating name)
      if (validatedData.name && validatedData.name !== currentCategory.name) {
        const existingCategory = await prisma.eventCategory.findUnique({
          where: { name: validatedData.name },
        })
        
        if (existingCategory) {
          throw new Error('Kategorie naam bestaan reeds')
        }
      }
      
      // Update category
      const updatedCategory = await prisma.eventCategory.update({
        where: { id },
        data: validatedData,
      })
      
      // Log the changes
      const changes = Object.keys(validatedData).reduce((acc, key) => {
        const typedKey = key as keyof typeof validatedData
        if (validatedData[typedKey] !== undefined) {
          acc[key] = {
            from: currentCategory[typedKey as keyof typeof currentCategory],
            to: validatedData[typedKey],
          }
        }
        return acc
      }, {} as Record<string, any>)
      
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          entityType: 'EventCategory',
          entityId: id,
          changes,
        },
      })
      
      return updatedCategory
    }, 'Update event category')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 400 }
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
    
    console.error('Event category PUT error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}

// DELETE /api/events/categories/[id] - Delete event category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth()
    const { id } = params
    
    // Only admins can delete categories
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Slegs administrateurs kan kategorieë verwyder' },
        { status: 403 }
      )
    }
    
    const result = await safeDatabaseOperation(async () => {
      // Get current category for audit log
      const category = await prisma.eventCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      })
      
      if (!category) {
        throw new Error('Kategorie nie gevind nie')
      }
      
      // Check if category has events
      if (category._count.events > 0) {
        throw new Error(`Kan nie kategorie verwyder nie - ${category._count.events} gebeure is gekoppel`)
      }
      
      // Delete category
      await prisma.eventCategory.delete({
        where: { id },
      })
      
      // Log the deletion
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE',
          entityType: 'EventCategory',
          entityId: id,
          changes: { deletedCategory: category },
        },
      })
      
      return { success: true }
    }, 'Delete event category')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 400 }
      )
    }
    
    return NextResponse.json({ message: 'Kategorie suksesvol verwyder' })
    
  } catch (error) {
    console.error('Event category DELETE error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
