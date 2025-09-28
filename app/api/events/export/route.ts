import { NextRequest, NextResponse } from 'next/server'
import { prisma, safeDatabaseOperation } from '@/lib/db'
import { format } from 'date-fns'

// Generate iCal format
function generateICalEvent(event: any): string {
  const formatDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'")
  }

  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000) // Default 1 hour
  const now = new Date()

  let icalEvent = [
    'BEGIN:VEVENT',
    `UID:${event.id}@annlin-gemeente.co.za`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
  ]

  if (event.location) {
    icalEvent.push(`LOCATION:${event.location}`)
  }

  if (event.sermonUrl) {
    icalEvent.push(`URL:${event.sermonUrl}`)
  }

  // Add categories
  icalEvent.push(`CATEGORIES:${event.category.name}`)

  // Add recurring rule if applicable
  if (event.isRecurring && event.recurringPattern) {
    let rrule = 'RRULE:FREQ='
    switch (event.recurringPattern) {
      case 'WEEKLY':
        rrule += 'WEEKLY'
        break
      case 'MONTHLY':
        rrule += 'MONTHLY'
        break
      case 'YEARLY':
        rrule += 'YEARLY'
        break
    }
    icalEvent.push(rrule)
  }

  icalEvent.push('END:VEVENT')
  
  return icalEvent.join('\r\n')
}

// GET /api/events/export - Export events as iCal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')
    
    const result = await safeDatabaseOperation(async () => {
      const where: any = {}
      
      if (startDate || endDate) {
        where.startDate = {}
        if (startDate) {
          where.startDate.gte = new Date(startDate)
        }
        if (endDate) {
          where.startDate.lte = new Date(endDate)
        }
      }
      
      if (categoryId) {
        where.categoryId = categoryId
      }
      
      const events = await prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      })
      
      return events
    }, 'Fetch events for export')
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kon nie gebeure laai vir uitvoer nie' },
        { status: 500 }
      )
    }
    
    const events = result.data
    
    // Generate iCal content
    const icalHeader = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Annlin Gemeente//Calendar//AF',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Annlin Gemeente Jaarprogram',
      'X-WR-CALDESC:Eredienste en gebeure van Annlin Gemeente',
      'X-WR-TIMEZONE:Africa/Johannesburg',
    ].join('\r\n')
    
    const icalFooter = 'END:VCALENDAR'
    
    const icalEvents = events.map(generateICalEvent).join('\r\n')
    
    const icalContent = [icalHeader, icalEvents, icalFooter].join('\r\n')
    
    // Set appropriate headers for iCal download
    const headers = new Headers({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="annlin-gemeente-kalender-${format(new Date(), 'yyyy-MM-dd')}.ics"`,
    })
    
    return new Response(icalContent, { headers })
    
  } catch (error) {
    console.error('Events export error:', error)
    return NextResponse.json(
      { error: 'Kon nie kalender uitvoer nie' },
      { status: 500 }
    )
  }
}

// POST /api/events/export - Generate recurring events
export async function POST(request: NextRequest) {
  try {
    const { user } = await require('@/lib/auth-config').requireAuth()
    
    // Only admins and editors can generate recurring events
    if (!['ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Onvoldoende regte om herhalende gebeure te skep' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    const recurringEventData: RecurringEventData = {
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      location: body.location,
      categoryId: body.categoryId,
      recurringPattern: body.recurringPattern,
      sermonUrl: body.sermonUrl,
      endRecurrence: body.endRecurrence ? new Date(body.endRecurrence) : undefined,
      maxOccurrences: body.maxOccurrences,
    }
    
    const result = await EventsService.generateRecurringEvents(recurringEventData, user.id)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      message: `${result.eventsCreated} herhalende gebeure suksesvol geskep`,
      eventsCreated: result.eventsCreated,
    })
    
  } catch (error) {
    console.error('Recurring events generation error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
