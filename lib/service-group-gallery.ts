import { z } from 'zod'

export const serviceGroupPhotoInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  url: z.url(),
  pathname: z.string().trim().max(500).optional().nullable(),
  filename: z.string().trim().min(1).max(255),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().int().min(0).max(10 * 1024 * 1024),
  alt: z.string().trim().max(180).default(''),
  caption: z.string().trim().max(500).optional().nullable(),
  displayOrder: z.number().int().min(0),
})

export const serviceGroupGalleryInputSchema = z.array(serviceGroupPhotoInputSchema).max(20)

export type ServiceGroupGalleryPhotoInput = z.infer<typeof serviceGroupPhotoInputSchema>

export type PublicServiceGroupPhoto = {
  id: string
  url: string
  alt: string
  caption: string | null
}
