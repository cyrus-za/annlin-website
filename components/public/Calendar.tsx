'use client'

import * as React from 'react'
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
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay } from 'date-fns'
import { af } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

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

interface PublicCalendarProps {
  compact?: boolean
  showUpcoming?: boolean
  limit?: number
}

export function PublicCalendar({ compact = false, showUpcoming = false, limit }: PublicCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
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

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
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
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(new Date(event.startDate), 'dd MMM', { locale: af })}
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        {format(new Date(event.startDate), 'HH:mm')}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-xs text-gray-500">
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
              <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Geen komende gebeure nie</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
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
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Vandag
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Laai kalender...</span>
                </div>
              ) : (
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
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
                  className="rounded-md border"
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
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {event.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(event.startDate), 'HH:mm')}
                          {event.endDate && (
                            <> - {format(new Date(event.endDate), 'HH:mm')}</>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-xs text-gray-500 mb-2">
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
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Geen gebeure vir hierdie datum nie
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div 
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: selectedEvent?.category.color }}
              ></div>
              <span>{selectedEvent?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && format(new Date(selectedEvent.startDate), 'EEEE, dd MMMM yyyy', { locale: af })}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Datum:</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(selectedEvent.startDate), 'dd MMMM yyyy', { locale: af })}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Tyd:</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(selectedEvent.startDate), 'HH:mm')}
                      {selectedEvent.endDate && (
                        <> - {format(new Date(selectedEvent.endDate), 'HH:mm')}</>
                      )}
                    </span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Lokasie:</span>
                      <span className="text-sm text-gray-600">
                        {selectedEvent.location}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Kategorie:</span>
                    <Badge 
                      style={{ backgroundColor: selectedEvent.category.color + '20', color: selectedEvent.category.color }}
                      className="border-0"
                    >
                      {selectedEvent.category.name}
                    </Badge>
                  </div>
                  
                  {selectedEvent.isRecurring && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Herhalend:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedEvent.recurringPattern === 'WEEKLY' && 'Weekliks'}
                        {selectedEvent.recurringPattern === 'MONTHLY' && 'Maandeliks'}
                        {selectedEvent.recurringPattern === 'YEARLY' && 'Jaarliks'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.sermonUrl && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Preek Opname</h4>
                  <Button asChild variant="outline">
                    <a 
                      href={selectedEvent.sermonUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Luister na Preek
                    </a>
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Wil jy meer weet? Kontak ons vir meer besonderhede.
                  </p>
                  <Button asChild size="sm">
                    <a href="/kontak">
                      Kontak Ons
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Maak Toe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Upcoming events component for homepage
export function UpcomingEvents({ limit = 5 }: { limit?: number }) {
  const [events, setEvents] = React.useState<Event[]>([])
  const [loading, setLoading] = React.useState(true)

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
            <h2 className="text-3xl font-bold text-gray-900">Komende Gebeure</h2>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Komende Gebeure</h2>
            <p className="text-gray-600">Geen komende gebeure geskeduleer nie.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {format(new Date(event.startDate), 'EEEE, dd MMMM yyyy', { locale: af })}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {format(new Date(event.startDate), 'HH:mm')}
                    {event.endDate && (
                      <> - {format(new Date(event.endDate), 'HH:mm')}</>
                    )}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
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
                          <a 
                            href={event.sermonUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
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
            <a href="/jaarprogram">
              Bekyk Volledige Kalender
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
