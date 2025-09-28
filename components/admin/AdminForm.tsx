'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Badge } from '@/components/ui/badge'
import { showSuccessToast, showErrorToast, showSavingToast } from '@/lib/toast-helpers'
import { Loader2, Save, X } from 'lucide-react'

interface AdminFormProps<T extends z.ZodType> {
  title: string
  description?: string
  schema: T
  defaultValues?: z.infer<T>
  onSubmit: (data: z.infer<T>) => Promise<void>
  onCancel?: () => void
  children?: React.ReactNode
  isLoading?: boolean
  submitText?: string
  cancelText?: string
}

export function AdminForm<T extends z.ZodType>({
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  children,
  isLoading = false,
  submitText = 'Stoor',
  cancelText = 'Kanselleer'
}: AdminFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const handleSubmit = async (data: z.infer<T>) => {
    let loadingToast: any
    
    try {
      setIsSubmitting(true)
      loadingToast = showSavingToast()
      
      await onSubmit(data)
      
      // Dismiss loading toast
      if (loadingToast) {
        loadingToast.dismiss()
      }
      
      showSuccessToast("Suksesvol gestoor!", "Jou veranderinge is suksesvol gestoor.")
    } catch (error) {
      // Dismiss loading toast
      if (loadingToast) {
        loadingToast.dismiss()
      }
      
      const errorMessage = error instanceof Error ? error.message : "ʼn Onverwagte fout het voorgekom."
      showErrorToast(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {children}
            
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  {cancelText}
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {submitText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Form field components for common patterns
export function FormFieldInput({
  name,
  label,
  description,
  placeholder,
  type = 'text',
  disabled = false,
}: {
  name: string
  label: string
  description?: string
  placeholder?: string
  type?: string
  disabled?: boolean
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function FormFieldTextarea({
  name,
  label,
  description,
  placeholder,
  rows = 4,
  disabled = false,
}: {
  name: string
  label: string
  description?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function FormFieldSelect({
  name,
  label,
  description,
  placeholder,
  options,
  disabled = false,
}: {
  name: string
  label: string
  description?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  disabled?: boolean
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Status badge component for consistent status display
export function StatusBadge({ 
  status, 
  variant 
}: { 
  status: string
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'
}) {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aktief':
      case 'active':
      case 'gepubliseer':
      case 'published':
        return 'success'
      case 'onaktief':
      case 'inactive':
      case 'konsep':
      case 'draft':
        return 'secondary'
      case 'hangende':
      case 'pending':
        return 'warning'
      case 'verwerp':
      case 'rejected':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <Badge variant={variant || getVariant(status)}>
      {status}
    </Badge>
  )
}
