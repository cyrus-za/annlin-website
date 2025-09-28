import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { requireAuth } from '@/lib/auth-config'

// Validation schema
const updateServiceGroupSchema = z.object({
  name: z.string().min(1, "Naam is verplig").optional(),
  description: z.string().min(1, "Beskrywing is verplig").optional(),
  contactPerson: z.string().min(1, "Kontak persoon is verplig").optional(),
  contactEmail: z.string().email("Ongeldige e-pos adres").optional(),
  contactPhone: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/diensgroepe/[id] - Get single service group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth()
    const { id } = params
    
    const result = await safeDatabaseOperation(async () => {
      const serviceGroup = await prisma.serviceGroup.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              contactSubmissions: true,
            },
          },
          contactSubmissions: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              email: true,
              subject: true,
              status: true,
              createdAt: true,
            },
          },
        },
      })
      
      if (!serviceGroup) {
        throw new Error('Diensgroep nie gevind nie')
      }
      
      return serviceGroup
    }, 'Fetch service group')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 500 }
      )
    }
    
    return NextResponse.json(result.data)
    
  } catch (error) {
    console.error('Service group GET error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}

// PUT /api/diensgroepe/[id] - Update service group
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth()
    const { id } = params
    
    // Only admins and editors can update service groups
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Onvoldoende regte om diensgroepe te wysig' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateServiceGroupSchema.parse(body)
    
    const result = await safeDatabaseOperation(async () => {
      // Get current service group for audit log
      const currentServiceGroup = await prisma.serviceGroup.findUnique({
        where: { id },
      })
      
      if (!currentServiceGroup) {
        throw new Error('Diensgroep nie gevind nie')
      }
      
      // Update service group
      const updatedServiceGroup = await prisma.serviceGroup.update({
        where: { id },
        data: validatedData,
      })
      
      // Log the changes
      const changes = Object.keys(validatedData).reduce((acc, key) => {
        const typedKey = key as keyof typeof validatedData
        if (validatedData[typedKey] !== undefined) {
          acc[key] = {
            from: currentServiceGroup[typedKey as keyof typeof currentServiceGroup],
            to: validatedData[typedKey],
          }
        }
        return acc
      }, {} as Record<string, any>)
      
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE',
          entityType: 'ServiceGroup',
          entityId: id,
          changes,
        },
      })
      
      return updatedServiceGroup
    }, 'Update service group')
    
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
    
    console.error('Service group PUT error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}

// DELETE /api/diensgroepe/[id] - Delete service group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth()
    const { id } = params
    
    // Only admins can delete service groups
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Slegs administrateurs kan diensgroepe verwyder' },
        { status: 403 }
      )
    }
    
    const result = await safeDatabaseOperation(async () => {
      // Get current service group for audit log
      const serviceGroup = await prisma.serviceGroup.findUnique({
        where: { id },
      })
      
      if (!serviceGroup) {
        throw new Error('Diensgroep nie gevind nie')
      }
      
      // Check if service group has contact submissions
      const submissionCount = await prisma.contactSubmission.count({
        where: { serviceGroupId: id },
      })
      
      if (submissionCount > 0) {
        throw new Error(`Kan nie diensgroep verwyder nie - ${submissionCount} kontak indienings is gekoppel`)
      }
      
      // Delete service group
      await prisma.serviceGroup.delete({
        where: { id },
      })
      
      // Log the deletion
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DELETE',
          entityType: 'ServiceGroup',
          entityId: id,
          changes: { deletedServiceGroup: serviceGroup },
        },
      })
      
      return { success: true }
    }, 'Delete service group')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('nie gevind nie') ? 404 : 400 }
      )
    }
    
    return NextResponse.json({ message: 'Diensgroep suksesvol verwyder' })
    
  } catch (error) {
    console.error('Service group DELETE error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
