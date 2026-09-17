'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-config'
import { MemberAuthorizationError } from '@/lib/members/authorization'
import { MemberCommandError, updateMember } from '@/lib/members/commands'
import {
  describeMemberEditFailure,
  parseMemberEditForm,
  type MemberEditState,
} from '@/lib/members/edit-form'

/**
 * Saves the narrow set of editable member fields.
 *
 * The actor always comes from the server-side session; the browser only supplies field values,
 * the opaque record ID and the optimistic version, all of which are validated here and again
 * inside `updateMember`. Authorization, scope and revocation failures collapse into the same
 * generic not-found state so the form cannot be used to probe records.
 */
export async function saveMemberDetails(_previous: MemberEditState, formData: FormData): Promise<MemberEditState> {
  const { user } = await requireAuth()

  const parsed = parseMemberEditForm(formData)
  if (!parsed.ok) return parsed.state
  const { memberId, version, input } = parsed.value

  try {
    const updated = await updateMember(user.id, memberId, { ...input, version })
    revalidatePath('/admin/lidmate')
    revalidatePath(`/admin/lidmate/${memberId}`)
    return { status: 'success', message: 'Veranderinge gestoor.', version: updated.version }
  } catch (error) {
    if (error instanceof MemberCommandError) return describeMemberEditFailure(error.code, error.message)
    if (error instanceof MemberAuthorizationError) return describeMemberEditFailure('NOT_FOUND')
    console.error('Lidmaatwysiging het misluk:', error instanceof Error ? error.name : 'onbekende fout')
    return describeMemberEditFailure('UNAVAILABLE')
  }
}
