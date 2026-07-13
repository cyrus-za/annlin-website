"use server"

import { ContactSubmissionStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-config'
import { prisma } from '@/lib/db'

function formText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function updateContactSubmissionStatus(formData: FormData) {
  const { user } = await requireAdmin()
  const id = formText(formData, 'id')
  const requestedStatus = formText(formData, 'status')

  if (!id) {
    throw new Error('Indiening-ID is verplig')
  }

  if (!Object.values(ContactSubmissionStatus).includes(requestedStatus as ContactSubmissionStatus)) {
    throw new Error('Ongeldige indieningstatus')
  }

  const status = requestedStatus as ContactSubmissionStatus
  const submission = await prisma.contactSubmission.update({
    where: { id },
    data: { status },
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'UPDATE_STATUS',
      entityType: 'ContactSubmission',
      entityId: submission.id,
      changes: { status },
    },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/indienings')
  revalidatePath(`/admin/indienings/${id}`)
}
