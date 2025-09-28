'use client'

import * as React from 'react'
import { z } from 'zod'
import { AdminForm, FormFieldInput, FormFieldTextarea, FormFieldSelect } from './AdminForm'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, MapPin, Link as LinkIcon } from 'lucide-react'
import { format } from 'date-fns'
import { af } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Validation schema
const eventSchema = z.object({
  title: z.string().min(1, "Titel is verplig").max(200, "Titel mag nie langer as 200 karakters wees nie"),
  description: z.string().min(10, "Beskrywing moet ten minste 10 karakters wees").max(2000, "Beskrywing mag nie langer as 2000 karakters wees nie"),
  startDate: z.date({ required_error: "Begin datum is verplig" }),
  startTime: z.string().min(1, "Begin tyd is verplig"),
  endDate: z.date().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().min(1, "Kategorie is verplig"),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  sermonUrl: z.string().url("Ongeldige URL").optional().or(z.literal("")),
})

type EventFormData = z.infer<typeof eventSchema>

interface EventCategory {
  id: string
  name: string
  color: string
  description?: string
}

interface EventFormProps {
  initialData?: Partial<EventFormData & { id: string }>
  eventId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function EventForm({
  initialData,
  eventId,
  onSuccess,
  onCancel
}: EventFormProps) {
  const [categories, setCategories] = React.useState<EventCategory[]>([])
  const [loadingCategories, setLoadingCategories] = React.useState(true)

  // Convert initial data if editing
  const defaultValues: EventFormData = React.useMemo(() => {
    if (initialData) {
      const startDate = initialData.startDate ? new Date(initialData.startDate as any) : new Date()
      const endDate = initialData.endDate ? new Date(initialData.endDate as any) : undefined
      
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        startDate,
        startTime: startDate ? format(startDate, 'HH:mm') : '08:30',
        endDate,
        endTime: endDate ? format(endDate, 'HH:mm') : '',
        location: initialData.location || '',
        categoryId: initialData.categoryId || '',
        isRecurring: initialData.isRecurring || false,
        recurringPattern: initialData.recurringPattern as any,
        sermonUrl: initialData.sermonUrl || '',
      }
    }
    
    return {
      title: '',
      description: '',
      startDate: new Date(),
      startTime: '08:30',
      endDate: undefined,
      endTime: '',
      location: '',
      categoryId: '',
      isRecurring: false,
      recurringPattern: undefined,
      sermonUrl: '',
    }
  }, [initialData])

  // Fetch categories
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/events/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (data: EventFormData) => {
    // Combine date and time
    const [startHours, startMinutes] = data.startTime.split(':').map(Number)
    const startDateTime = new Date(data.startDate)
    startDateTime.setHours(startHours, startMinutes)

    let endDateTime: Date | undefined
    if (data.endDate && data.endTime) {
      const [endHours, endMinutes] = data.endTime.split(':').map(Number)
      endDateTime = new Date(data.endDate)
      endDateTime.setHours(endHours, endMinutes)
    }

    const submitData = {
      title: data.title,
      description: data.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime?.toISOString(),
      location: data.location,
      categoryId: data.categoryId,
      isRecurring: data.isRecurring,
      recurringPattern: data.isRecurring ? data.recurringPattern : undefined,
      sermonUrl: data.sermonUrl,
    }

    const url = eventId 
      ? `/api/events/${eventId}`
      : '/api/events'
    
    const method = eventId ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Kon nie gebeurtenis stoor nie')
    }

    const result = await response.json()
    
    if (onSuccess) {
      onSuccess()
    }
    
    return result
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }))

  const recurringOptions = [
    { value: 'WEEKLY', label: 'Weekliks' },
    { value: 'MONTHLY', label: 'Maandeliks' },
    { value: 'YEARLY', label: 'Jaarliks' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminForm
        title={eventId ? "Redigeer Gebeurtenis" : "Nuwe Gebeurtenis"}
        description={eventId ? "Wysig gebeurtenis besonderhede" : "Skep 'n nuwe kalendar gebeurtenis"}
        schema={eventSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitText={eventId ? "Stoor Veranderinge" : "Skep Gebeurtenis"}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gebeurtenis Besonderhede</CardTitle>
                <CardDescription>
                  Basiese inligting oor die gebeurtenis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormFieldInput
                  name="title"
                  label="Gebeurtenis Titel"
                  placeholder="bv. Sondag Erediens, Jeugkamp, Biduur"
                />

                <FormFieldTextarea
                  name="description"
                  label="Beskrywing"
                  placeholder="Beskryf wat sal gebeur, wie kan kom, wat om te verwag..."
                  rows={4}
                />

                <FormFieldInput
                  name="location"
                  label="Lokasie (Opsioneel)"
                  placeholder="bv. Kerk Saal, Jeug Sentrum, Online"
                />

                <FormFieldSelect
                  name="categoryId"
                  label="Kategorie"
                  placeholder="Kies 'n kategorie"
                  options={categoryOptions}
                  disabled={loadingCategories}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datum en Tyd</CardTitle>
                <CardDescription>
                  Stel die datum en tyd vir die gebeurtenis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Start Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Begin Datum *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd MMMM yyyy", { locale: af })
                                ) : (
                                  <span>Kies datum</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Begin Tyd *</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* End Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Eind Datum (Opsioneel)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd MMMM yyyy", { locale: af })
                                ) : (
                                  <span>Kies eind datum</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Laat leeg as dit 'n enkele dag gebeurtenis is
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eind Tyd (Opsioneel)</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Laat leeg as daar geen spesifieke eind tyd is nie
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recurring Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Herhalende Gebeurtenis</CardTitle>
                <CardDescription>
                  Stel op as hierdie gebeurtenis herhaal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Herhalende Gebeurtenis
                        </FormLabel>
                        <FormDescription>
                          Hierdie gebeurtenis herhaal volgens 'n patroon
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="recurringPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Herhalende Patroon</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={!field.value || loadingCategories}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Kies patroon</option>
                          {recurringOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        Slegs beskikbaar vir herhalende gebeure
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle>Bykomende Opsies</CardTitle>
                <CardDescription>
                  Ekstra inligting en skakels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  name="sermonUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preek Opname URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="url"
                            placeholder="https://example.com/preek"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Skakel na preek opname (YouTube, SoundCloud, ens.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Category Preview */}
            {categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kategorieë</CardTitle>
                  <CardDescription>
                    Beskikbare gebeurtenis kategorieë
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AdminForm>
    </div>
  )
}
