'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { showSuccessToast, showErrorToast } from '@/lib/toast-helpers'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Naam is verplig").max(100, "Naam mag nie langer as 100 karakters wees nie"),
  email: z.string().email("Ongeldige e-pos adres"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Onderwerp is verplig").max(200, "Onderwerp mag nie langer as 200 karakters wees nie"),
  message: z.string().min(10, "Boodskap moet ten minste 10 karakters wees").max(2000, "Boodskap mag nie langer as 2000 karakters wees nie"),
  type: z.enum(['GENERAL', 'SERVICE_GROUP', 'SPECIFIC']),
  serviceGroupId: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactFormSchema>

interface ServiceGroup {
  id: string
  name: string
  contactPerson: string
}

export default function ContactPage() {
  const searchParams = useSearchParams()
  const preselectedServiceGroup = searchParams.get('diensgroep')
  
  const [serviceGroups, setServiceGroups] = React.useState<ServiceGroup[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      type: preselectedServiceGroup ? 'SERVICE_GROUP' : 'GENERAL',
      serviceGroupId: preselectedServiceGroup || '',
    },
  })

  const contactType = form.watch('type')

  // Fetch service groups for the dropdown
  React.useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        const response = await fetch('/api/diensgroepe?isActive=true&limit=100')
        if (response.ok) {
          const data = await response.json()
          setServiceGroups(data.serviceGroups || [])
        }
      } catch (error) {
        console.error('Error fetching service groups:', error)
      }
    }

    fetchServiceGroups()
  }, [])

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kon nie boodskap stuur nie')
      }

      setIsSuccess(true)
      showSuccessToast('Boodskap gestuur!', 'Ons sal jou binnekort kontak.')
      form.reset()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie boodskap stuur nie')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Boodskap Gestuur!</CardTitle>
            <CardDescription>
              Dankie vir jou boodskap. Ons sal jou binnekort kontak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Jou navraag is suksesvol gestuur. Ons span sal jou binne 24-48 uur kontak 
                  om jou te help met jou versoek.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <Button 
                  onClick={() => {
                    setIsSuccess(false)
                    form.reset()
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Stuur Nog 'n Boodskap
                </Button>
                
                <Button asChild className="w-full">
                  <a href="/">Terug na Tuisblad</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Kontak Ons</h1>
            <p className="mt-4 text-xl text-gray-600">
              Ons is hier om jou te help. Stuur vir ons 'n boodskap of gebruik ons kontak besonderhede.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Stuur vir Ons 'n Boodskap</CardTitle>
                <CardDescription>
                  Vul die vorm in en ons sal jou so gou as moontlik kontak.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volledige Naam *</FormLabel>
                            <FormControl>
                              <Input placeholder="Jou naam" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-pos Adres *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="jou@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefoon Nommer</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="012 345 6789" {...field} />
                          </FormControl>
                          <FormDescription>
                            Opsioneel - vir vinniger kontak
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Navraag Tipe *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Kies navraag tipe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GENERAL">Algemene Navraag</SelectItem>
                              <SelectItem value="SERVICE_GROUP">Diensgroep Belangstelling</SelectItem>
                              <SelectItem value="SPECIFIC">Spesifieke Versoek</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {contactType === 'SERVICE_GROUP' && (
                      <FormField
                        control={form.control}
                        name="serviceGroupId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diensgroep *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Kies 'n diensgroep" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {serviceGroups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Kies die diensgroep waarin jy belangstel
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Onderwerp *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={
                                contactType === 'SERVICE_GROUP' 
                                  ? "Belangstelling in diensgroep" 
                                  : "Onderwerp van jou boodskap"
                              } 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Boodskap *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={
                                contactType === 'SERVICE_GROUP'
                                  ? "Vertel ons waarom jy in hierdie diensgroep belangstel en hoe jy wil help..."
                                  : "Skryf jou boodskap hier..."
                              }
                              rows={6}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 10 karakters, maksimum 2000 karakters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Stuur tans...</>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Stuur Boodskap
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontak Besonderhede</CardTitle>
                <CardDescription>
                  Ander maniere om ons te kontak
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">E-pos</h4>
                    <a 
                      href="mailto:info@annlin-gemeente.co.za"
                      className="text-amber-600 hover:text-amber-800"
                    >
                      info@annlin-gemeente.co.za
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Telefoon</h4>
                    <a 
                      href="tel:012-345-6789"
                      className="text-amber-600 hover:text-amber-800"
                    >
                      012 345 6789
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Adres</h4>
                    <p className="text-gray-600">
                      Annlin Gemeente<br />
                      [Kerk Adres]<br />
                      Pretoria, 0181
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Kantoor Ure</h4>
                    <p className="text-gray-600">
                      Maandag - Vrydag: 08:00 - 16:00<br />
                      Saterdag: 08:00 - 12:00<br />
                      Sondag: Na eredienste
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eredienste</CardTitle>
                <CardDescription>
                  Sluit by ons aan vir aanbidding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-amber-600 pl-4">
                    <h4 className="font-medium text-gray-900">Sondag Oggend</h4>
                    <p className="text-gray-600">09:00 - Hooferediens</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-600 pl-4">
                    <h4 className="font-medium text-gray-900">Sondag Aand</h4>
                    <p className="text-gray-600">18:00 - Aanderediens</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-600 pl-4">
                    <h4 className="font-medium text-gray-900">Woensdag</h4>
                    <p className="text-gray-600">19:00 - Biduur & Bybelstudie</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Noodkontak</CardTitle>
                <CardDescription>
                  Vir dringende pastorale sorg
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Dominee</h4>
                    <p className="text-gray-600">
                      <a href="tel:082-123-4567" className="text-amber-600 hover:text-amber-800">
                        082 123 4567
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Kerkraad Voorsitter</h4>
                    <p className="text-gray-600">
                      <a href="tel:083-765-4321" className="text-amber-600 hover:text-amber-800">
                        083 765 4321
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
