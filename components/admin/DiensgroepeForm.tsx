'use client'

import * as React from 'react'
import { z } from 'zod'
import { AdminForm, FormFieldInput, FormFieldTextarea } from './AdminForm'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { Upload, X, Image } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast-helpers'

// Validation schema
const serviceGroupSchema = z.object({
  name: z.string().min(1, "Naam is verplig").max(100, "Naam mag nie langer as 100 karakters wees nie"),
  description: z.string().min(10, "Beskrywing moet ten minste 10 karakters wees").max(1000, "Beskrywing mag nie langer as 1000 karakters wees nie"),
  contactPerson: z.string().min(1, "Kontak persoon is verplig").max(100, "Kontak persoon mag nie langer as 100 karakters wees nie"),
  contactEmail: z.string().email("Ongeldige e-pos adres"),
  contactPhone: z.string().optional().refine((val) => !val || val.length >= 10, {
    message: "Telefoon nommer moet ten minste 10 karakters wees",
  }),
  thumbnailUrl: z.string().optional(),
  isActive: z.boolean().default(true),
})

type ServiceGroupFormData = z.infer<typeof serviceGroupSchema>

interface DiensgroepeFormProps {
  initialData?: Partial<ServiceGroupFormData>
  serviceGroupId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function DiensgroepeForm({
  initialData,
  serviceGroupId,
  onSuccess,
  onCancel
}: DiensgroepeFormProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(initialData?.thumbnailUrl || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const defaultValues: ServiceGroupFormData = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    contactPerson: initialData?.contactPerson || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    isActive: initialData?.isActive ?? true,
  }

  const handleSubmit = async (data: ServiceGroupFormData) => {
    const url = serviceGroupId 
      ? `/api/diensgroepe/${serviceGroupId}`
      : '/api/diensgroepe'
    
    const method = serviceGroupId ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Kon nie diensgroep stoor nie')
    }

    const result = await response.json()
    
    if (onSuccess) {
      onSuccess()
    }
    
    return result
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorToast('Slegs prentjie lêers word ondersteun')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Prentjie mag nie groter as 5MB wees nie')
      return
    }

    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'service-group-thumbnail')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Kon nie prentjie oplaai nie')
      }

      const { url } = await response.json()
      setPreviewUrl(url)
      
      showSuccessToast('Prentjie opgelaai!', 'Jou prentjie is suksesvol opgelaai.')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie prentjie oplaai nie')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminForm
        title={serviceGroupId ? "Redigeer Diensgroep" : "Nuwe Diensgroep"}
        description={serviceGroupId ? "Wysig diensgroep besonderhede" : "Skep 'n nuwe diensgroep"}
        schema={serviceGroupSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitText={serviceGroupId ? "Stoor Veranderinge" : "Skep Diensgroep"}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basiese Inligting</CardTitle>
                <CardDescription>
                  Vul die basiese inligting vir die diensgroep in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormFieldInput
                  name="name"
                  label="Diensgroep Naam"
                  placeholder="bv. Jeugbediening, Koor, Skoonmaak span"
                />

                <FormFieldTextarea
                  name="description"
                  label="Beskrywing"
                  placeholder="Beskryf wat hierdie diensgroep doen en hoe hulle help..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontak Inligting</CardTitle>
                <CardDescription>
                  Kontak besonderhede vir navrae oor hierdie diensgroep
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormFieldInput
                  name="contactPerson"
                  label="Kontak Persoon"
                  placeholder="Naam van die persoon wat navrae hanteer"
                />

                <FormFieldInput
                  name="contactEmail"
                  label="Kontak E-pos"
                  type="email"
                  placeholder="kontak@example.com"
                />

                <FormFieldInput
                  name="contactPhone"
                  label="Kontak Telefoon (Opsioneel)"
                  type="tel"
                  placeholder="012 345 6789"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Beheer of hierdie diensgroep sigbaar is vir gebruikers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Aktief
                        </FormLabel>
                        <FormDescription>
                          Hierdie diensgroep is sigbaar op die webwerf
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
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Prentjie</CardTitle>
                <CardDescription>
                  Laai 'n prentjie op om die diensgroep te verteenwoordig
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          {previewUrl ? (
                            <div className="relative">
                              <img
                                src={previewUrl}
                                alt="Diensgroep prentjie"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={handleRemoveImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <Image className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="mt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isUploading}
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  {isUploading ? 'Laai op...' : 'Kies Prentjie'}
                                </Button>
                              </div>
                              <p className="mt-2 text-sm text-gray-500">
                                PNG, JPG tot 5MB
                              </p>
                            </div>
                          )}
                          
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          
                          <input
                            type="hidden"
                            {...field}
                            value={previewUrl || ''}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminForm>
    </div>
  )
}
