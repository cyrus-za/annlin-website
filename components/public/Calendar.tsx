'use client'

import * as React from 'react'
import Link from 'next/link'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users,
  ExternalLink
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
} from 'date-fns'
import { af } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

function isInternalHref(href: string) {
  return href.startsWith('/')
}

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate?: string
  location?: string
  isRecurring: boolean
  recurringPattern?: string
  sermonUrl?: string
  category: {
    id: string
    name: string
    color: string
  }
}

function EventDetailDialog({
  event,
  open,
  onOpenChange,
}: {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: event?.category.color }}
            />
            <span>{event?.title}</span>
          </DialogTitle>
          <DialogDescription>
            {event && format(new Date(event.startDate), 'EEEE, dd MMMM yyyy', { locale: af })}
          </DialogDescription>
        </DialogHeader>

        {event && (
          <div className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground">{event.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-sm font-medium">Datum:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: af })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-sm font-medium">Tyd:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), 'HH:mm')}
                    {event.endDate && <> - {format(new Date(event.endDate), 'HH:mm')}</>}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground/50" />
                    <span className="text-sm font-medium">Lokasie:</span>
                    <span className="text-sm text-muted-foreground">{event.location}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-sm font-medium">Kategorie:</span>
                  <Badge
                    style={{ backgroundColor: event.category.color + '20', color: event.category.color }}
                    className="border-0"
                  >
                    {event.category.name}
                  </Badge>
                </div>

                {event.isRecurring && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground/50" />
                    <span className="text-sm font-medium">Herhalend:</span>
                    <Badge variant="outline" className="text-xs">
                      {event.recurringPattern === 'WEEKLY' && 'Weekliks'}
                      {event.recurringPattern === 'MONTHLY' && 'Maandeliks'}
                      {event.recurringPattern === 'YEARLY' && 'Jaarliks'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {event.sermonUrl && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="mb-3 font-medium text-foreground">Uitsending</h4>
                <Button asChild variant="outline">
                  {isInternalHref(event.sermonUrl) ? (
                    <Link href={event.sermonUrl}>Gaan na Uitsendings</Link>
                  ) : (
                    <a href={event.sermonUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Luister na Preek
                    </a>
                  )}
                </Button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Wil jy meer weet? Kontak ons vir meer besonderhede.
                </p>
                <Button asChild size="sm">
                  <Link href="/kontak">Kontak Ons</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maak Toe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PublicCalendarProps {
  compact?: boolean
  showUpcoming?: boolean
  limit?: number
}

export function PublicCalendar({ compact = false, showUpcoming = false, limit }: PublicCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
  const [events, setEvents] = React.useState<Event[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null)
  const [showEventDialog, setShowEventDialog] = React.useState(false)

  const fetchEvents = React.useCallback(async (date: Date) => {
    try {
      setLoading(true)
      const startDate = startOfMonth(date)
      const endDate = endOfMonth(date)
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        sortBy: 'startDate',
        sortOrder: 'asc',
        ...(limit && { limit: limit.toString() }),
      })
      
      const response = await fetch(`/api/events?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [limit])

  React.useEffect(() => {
    fetchEvents(currentDate)
  }, [currentDate, fetchEvents])

  React.useEffect(() => {
    if (loading || selectedDate || events.length === 0) return

    const now = new Date()
    const eventDatesInMonth = events
      .map((event) => new Date(event.startDate))
      .filter((date) => isSameMonth(date, currentDate))
      .sort((a, b) => a.getTime() - b.getTime())

    const firstUpcomingDate =
      eventDatesInMonth.find((date) => date >= now) || eventDatesInMonth[0]

    if (firstUpcomingDate) {
      setSelectedDate(firstUpcomingDate)
    }
  }, [currentDate, events, loading, selectedDate])

  const handlePreviousMonth = () => {
    setSelectedDate(undefined)
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(undefined)
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setShowEventDialog(true)
  }

  // Get events for selected date
  const selectedDateEvents = selectedDate ? events.filter(event => {
    const eventDate = new Date(event.startDate)
    return isSameDay(eventDate, selectedDate)
  }) : []

  // Get upcoming events
  const upcomingEvents = showUpcoming ? events
    .filter(event => new Date(event.startDate) >= new Date())
    .slice(0, limit || 5) : []

  // Get events that have dates (for calendar display)
  const eventDates = events.map(event => new Date(event.startDate))

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Komende Gebeure</CardTitle>
          <CardDescription>
            Kyk wat aankom in ons gemeente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 pl-4" style={{ borderColor: event.category.color }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm mb-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center text-xs text-muted-foreground mb-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(new Date(event.startDate), 'dd MMM', { locale: af })}
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        {format(new Date(event.startDate), 'HH:mm')}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEventClick(event)}
                    >
                      Bekyk
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <a href="/jaarprogram">
                    Bekyk Volledige Kalender →
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Geen komende gebeure nie</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,560px)_minmax(0,1fr)]">
        {/* Calendar */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>
                  {format(currentDate, 'MMMM yyyy', { locale: af })}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedDate(undefined)
                      setCurrentDate(new Date())
                    }}
                  >
                    Vandag
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center sm:justify-start">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  <span className="ml-3 text-muted-foreground">Laai kalender...</span>
                </div>
              ) : (
                <CalendarComponent
                  mode="single"
                  locale={af}
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentDate}
                  onMonthChange={(date) => {
                    setSelectedDate(undefined)
                    setCurrentDate(date)
                  }}
                  modifiers={{
                    event: eventDates,
                  }}
                  modifiersStyles={{
                    event: { 
                      backgroundColor: '#3B82F6', 
                      color: 'white',
                      fontWeight: 'bold',
                    },
                  }}
                  className="w-full rounded-md border p-4 sm:p-6"
                  classNames={{
                    root: 'w-full',
                    months: 'w-full',
                    month: 'w-full space-y-4',
                    month_grid: 'w-full border-collapse table-fixed',
                    weekdays: 'grid grid-cols-7',
                    weekday: 'flex h-9 items-center justify-center rounded-md text-muted-foreground font-normal text-sm',
                    week: 'mt-2 grid grid-cols-7',
                    day: 'relative flex h-11 items-center justify-center p-0 text-center text-sm focus-within:relative focus-within:z-20',
                    day_button: 'h-11 w-11 p-0 font-normal aria-selected:opacity-100',
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Details for Selected Date */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: af }) : 'Kies \'n Datum'}
              </CardTitle>
              <CardDescription>
                {selectedDateEvents.length > 0 
                  ? `${selectedDateEvents.length} gebeurtenis${selectedDateEvents.length !== 1 ? 'se' : ''}`
                  : 'Geen gebeure vir hierdie datum nie'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {selectedDateEvents.length > 0 ? (
                  <motion.div
                    key="events"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {selectedDateEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-l-4 pl-4 cursor-pointer hover:bg-gray-50 rounded-r-lg transition-colors p-2 -ml-2"
                        style={{ borderColor: event.category.color }}
                        onClick={() => handleEventClick(event)}
                      >
                        <h4 className="font-medium text-foreground text-sm mb-1">
                          {event.title}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(event.startDate), 'HH:mm')}
                          {event.endDate && (
                            <> - {format(new Date(event.endDate), 'HH:mm')}</>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                        <Badge 
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: event.category.color, color: event.category.color }}
                        >
                          {event.category.name}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-events"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Geen gebeure vir hierdie datum nie
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      <EventDetailDialog
        event={selectedEvent}
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
      />
    </div>
  )
}

// Upcoming events component for homepage
export function UpcomingEvents({ limit = 5 }: { limit?: number }) {
  const [events, setEvents] = React.useState<Event[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null)
  const [showEventDialog, setShowEventDialog] = React.useState(false)

  React.useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const params = new URLSearchParams({
          startDate: new Date().toISOString(),
          limit: limit.toString(),
          sortBy: 'startDate',
          sortOrder: 'asc',
        })
        
        const response = await fetch(`/api/events?${params}`)
        
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingEvents()
  }, [limit])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Komende Gebeure</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Komende Gebeure</h2>
            <p className="text-muted-foreground">Geen komende gebeure geskeduleer nie.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-amber-900">Komende Gebeure</h2>
          <p className="mt-4 text-lg text-amber-800">
            Sluit by ons aan vir hierdie spesiale geleenthede
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge 
                      style={{ backgroundColor: event.category.color + '20', color: event.category.color }}
                      className="border-0"
                    >
                      {event.category.name}
                    </Badge>
                    {event.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        Herhalend
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-amber-700 transition-colors">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground/50" />
                    {format(new Date(event.startDate), 'EEEE, dd MMMM yyyy', { locale: af })}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground/50" />
                    {format(new Date(event.startDate), 'HH:mm')}
                    {event.endDate && (
                      <> - {format(new Date(event.endDate), 'HH:mm')}</>
                    )}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground/50" />
                      {event.location}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event)
                          setShowEventDialog(true)
                        }}
                      >
                        Meer Info
                      </Button>
                      {event.sermonUrl && (
                        <Button asChild size="sm" variant="ghost">
                          {isInternalHref(event.sermonUrl) ? (
                            <Link href={event.sermonUrl} aria-label="Gaan na uitsending" title="Gaan na uitsending">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          ) : (
                            <a
                              href={event.sermonUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Maak uitsending oop"
                              title="Maak uitsending oop"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/jaarprogram">
              Bekyk Volledige Kalender
            </Link>
          </Button>
        </div>
        </div>
      </section>
      <EventDetailDialog
        event={selectedEvent}
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
      />
    </>
  )
}
