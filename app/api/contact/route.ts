import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, safeDatabaseOperation } from '@/lib/db'

// Validation schema
const contactSubmissionSchema = z.object({
  name: z.string().min(1, "Naam is verplig").max(100, "Naam mag nie langer as 100 karakters wees nie"),
  email: z.string().email("Ongeldige e-pos adres"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Onderwerp is verplig").max(200, "Onderwerp mag nie langer as 200 karakters wees nie"),
  message: z.string().min(10, "Boodskap moet ten minste 10 karakters wees").max(2000, "Boodskap mag nie langer as 2000 karakters wees nie"),
  type: z.enum(['GENERAL', 'SERVICE_GROUP', 'SPECIFIC']),
  serviceGroupId: z.string().optional(),
})

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = contactSubmissionSchema.parse(body)
    
    const result = await safeDatabaseOperation(async () => {
      // If it's a service group inquiry, verify the service group exists
      if (validatedData.type === 'SERVICE_GROUP' && validatedData.serviceGroupId) {
        const serviceGroup = await prisma.serviceGroup.findUnique({
          where: { id: validatedData.serviceGroupId },
        })
        
        if (!serviceGroup) {
          throw new Error('Diensgroep nie gevind nie')
        }
        
        if (!serviceGroup.isActive) {
          throw new Error('Hierdie diensgroep is tans nie aktief nie')
        }
      }
      
      // Create contact submission
      const submission = await prisma.contactSubmission.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          subject: validatedData.subject,
          message: validatedData.message,
          type: validatedData.type,
          serviceGroupId: validatedData.serviceGroupId,
          status: 'NEW',
        },
        include: {
          serviceGroup: {
            select: {
              name: true,
              contactPerson: true,
              contactEmail: true,
            },
          },
        },
      })
      
      // TODO: Send email notification to admin and service group contact
      // This would integrate with the email service
      
      return submission
    }, 'Create contact submission')
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Jou boodskap is suksesvol gestuur!',
        id: result.data.id 
      },
      { status: 201 }
    )
    
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
    
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { error: 'Kon nie boodskap stuur nie' },
      { status: 500 }
    )
  }
}

// GET /api/contact - List contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // This would require authentication for admin access
    // For now, return empty array
    return NextResponse.json({ submissions: [] })
  } catch (error) {
    console.error('Contact submissions GET error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
