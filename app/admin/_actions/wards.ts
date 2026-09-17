'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-config'
import { MemberAuthorizationError } from '@/lib/members/authorization'
import { createWard, updateWard, WardCommandError } from '@/lib/members/wards'
import {
  parseCreateWardForm,
  parseUpdateWardForm,
  wardFailure,
  type WardFormState,
} from '@/lib/members/ward-form'

function commandFailure(error: unknown): WardFormState {
  if (error instanceof WardCommandError) {
    if (error.code === 'NOT_FOUND') return wardFailure('Hierdie wyk of lidmaat is nie beskikbaar nie.')
    return wardFailure(error.message)
  }
  if (error instanceof MemberAuthorizationError) return wardFailure('Wykbestuur is nie beskikbaar nie.')
  console.error('Wykbestuur het misluk:', error instanceof Error ? error.name : 'onbekende fout')
  return wardFailure()
}

export async function addWard(_previous: WardFormState, data: FormData): Promise<WardFormState> {
  const parsed = parseCreateWardForm(data)
  if (!parsed.ok) return parsed.state
  const { user } = await requireAuth()
  try {
    await createWard(user.id, parsed.value)
    revalidatePath('/admin/wyke')
    revalidatePath('/admin/lidmate')
    return { status: 'success', message: 'Wyk geskep.' }
  } catch (error) {
    return commandFailure(error)
  }
}

export async function saveWard(_previous: WardFormState, data: FormData): Promise<WardFormState> {
  const parsed = parseUpdateWardForm(data)
  if (!parsed.ok) return parsed.state
  const { user } = await requireAuth()
  try {
    await updateWard(user.id, parsed.value)
    revalidatePath('/admin/wyke')
    revalidatePath('/admin/lidmate')
    return { status: 'success', message: 'Wyk gestoor.' }
  } catch (error) {
    return commandFailure(error)
  }
}
