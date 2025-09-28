'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DataTable } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { showSuccessToast, showErrorToast, showDeleteConfirmationToast } from '@/lib/toast-helpers'
import { Plus, Edit, Trash2, Palette } from 'lucide-react'

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, "Naam is verplig").max(100, "Naam mag nie langer as 100 karakters wees nie"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Ongeldige kleur kode"),
  description: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface EventCategory {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
  updatedAt: string
  _count: {
    events: number
  }
}

// Predefined color options
const colorOptions = [
  '#DC2626', // Red
  '#2563EB', // Blue
  '#059669', // Green
  '#7C3AED', // Purple
  '#EA580C', // Orange
  '#0891B2', // Cyan
  '#BE185D', // Pink
  '#65A30D', // Lime
  '#4338CA', // Indigo
  '#C2410C', // Orange-red
]

export default function EventCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = React.useState<EventCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<EventCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: colorOptions[0],
      description: '',
    },
  })

  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events/categories')
      
      if (!response.ok) {
        throw new Error('Kon nie kategorieë laai nie')
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie kategorieë laai nie')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = () => {
    form.reset({
      name: '',
      color: colorOptions[0],
      description: '',
    })
    setEditingCategory(null)
    setShowCreateDialog(true)
  }

  const handleEdit = (category: EventCategory) => {
    form.reset({
      name: category.name,
      color: category.color,
      description: category.description || '',
    })
    setEditingCategory(category)
    setShowCreateDialog(true)
  }

  const handleDelete = async (category: EventCategory) => {
    if (category._count.events > 0) {
      showErrorToast(
        'Kan nie kategorie verwyder nie',
        `Hierdie kategorie het ${category._count.events} gebeure. Verwyder eers die gebeure.`
      )
      return
    }

    try {
      const response = await fetch(`/api/events/categories/${category.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kon nie kategorie verwyder nie')
      }
      
      showSuccessToast('Kategorie verwyder!', `${category.name} is suksesvol verwyder.`)
      fetchCategories()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie kategorie verwyder nie')
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true)
      
      const url = editingCategory 
        ? `/api/events/categories/${editingCategory.id}`
        : '/api/events/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kon nie kategorie stoor nie')
      }

      const actionText = editingCategory ? 'opgedateer' : 'geskep'
      showSuccessToast(`Kategorie ${actionText}!`, `${data.name} is suksesvol ${actionText}.`)
      
      setShowCreateDialog(false)
      fetchCategories()
      form.reset()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie kategorie stoor nie')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name' as keyof EventCategory,
      label: 'Naam',
      sortable: true,
      render: (value: string, row: EventCategory) => (
        <div className="flex items-center space-x-3">
          <div 
            className="h-4 w-4 rounded-full border border-gray-300"
            style={{ backgroundColor: row.color }}
          ></div>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'description' as keyof EventCategory,
      label: 'Beskrywing',
      render: (value: string) => value || 'Geen beskrywing',
    },
    {
      key: '_count' as keyof EventCategory,
      label: 'Gebeure',
      render: (value: any) => (
        <Badge variant="secondary">
          {value.events} gebeurtenis{value.events !== 1 ? 'se' : ''}
        </Badge>
      ),
    },
    {
      key: 'actions' as keyof EventCategory,
      label: 'Aksies',
    },
  ]

  const actions = [
    {
      label: 'Redigeer',
      onClick: handleEdit,
    },
    {
      label: 'Verwyder',
      onClick: (category: EventCategory) => {
        showDeleteConfirmationToast(category.name, () => handleDelete(category))
      },
      variant: 'destructive' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gebeurtenis Kategorieë</h1>
          <p className="mt-2 text-gray-600">
            Bestuur kategorieë vir kerk gebeure en kalender items
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Voeg Kategorie By
        </Button>
      </div>

      <DataTable
        title="Kategorieë"
        description="Lys van alle gebeurtenis kategorieë"
        data={categories}
        columns={columns}
        actions={actions}
        searchable={true}
        searchPlaceholder="Soek kategorieë..."
        onAdd={handleCreate}
        addButtonText="Voeg Kategorie By"
        isLoading={loading}
        emptyStateText="Geen kategorieë gevind nie."
      />

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Redigeer Kategorie' : 'Nuwe Kategorie'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Wysig die kategorie besonderhede'
                : 'Skep \'n nuwe gebeurtenis kategorie'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie Naam *</FormLabel>
                    <FormControl>
                      <Input placeholder="bv. Eredienste, Byeenkomste" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kleur *</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="grid grid-cols-5 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => field.onChange(color)}
                              className={`h-10 w-10 rounded-lg border-2 transition-all ${
                                field.value === color 
                                  ? 'border-gray-900 scale-110' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="#000000"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="font-mono text-sm"
                          />
                          <div 
                            className="h-10 w-16 rounded border border-gray-300"
                            style={{ backgroundColor: field.value }}
                          ></div>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Kies 'n kleur of voer 'n hex kode in
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrywing</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Opsionele beskrywing van die kategorie..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isSubmitting}
                >
                  Kanselleer
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Stoor...' : (editingCategory ? 'Stoor Veranderinge' : 'Skep Kategorie')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
