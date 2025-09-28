// Zod Validation Schemas
// This directory contains all form validation schemas using Zod

import { z } from 'zod'

// Example validation schemas - will be expanded as needed
export const loginSchema = z.object({
  email: z.string().email('Voer asseblief \'n geldige e-pos adres in'),
  password: z.string().min(8, 'Wagwoord moet minstens 8 karakters wees'),
})

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Naam is verplig'),
  email: z.string().email('Voer asseblief \'n geldige e-pos adres in'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Onderwerp is verplig'),
  message: z.string().min(10, 'Boodskap moet minstens 10 karakters wees'),
  type: z.enum(['general', 'service_group', 'specific']),
  serviceGroupId: z.string().optional(),
})

// Export types for TypeScript
export type LoginInput = z.infer<typeof loginSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
