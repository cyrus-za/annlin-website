// Zod Validation Schemas
// This directory contains all form validation schemas using Zod

import { z } from 'zod'

// Example validation schemas - will be expanded as needed
export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  type: z.enum(['general', 'service_group', 'specific']),
  serviceGroupId: z.string().optional(),
})

// Export types for TypeScript
export type LoginInput = z.infer<typeof loginSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
