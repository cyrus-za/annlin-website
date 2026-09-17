'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-config'
import { MemberAuthorizationError } from '@/lib/members/authorization'
import {
  MemberCommandError,
  addMembershipEvent,
  createMember,
  endMemberContact,
  saveMemberContact,
  setMemberHousehold,
  setMemberWard,
  updateMember,
} from '@/lib/members/commands'
import {
  describeMemberCreateFailure,
  parseMemberCreateForm,
  type MemberCreateState,
} from '@/lib/members/create-form'
import {
  describeMemberEditFailure,
  parseMemberEditForm,
  type MemberEditState,
} from '@/lib/members/edit-form'
import {
  parseContactForm,
  parseEventForm,
  parseHouseholdForm,
  parseWardForm,
  relatedFailure,
  type MemberRelatedState,
} from '@/lib/members/related-form'

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

export async function addMember(_previous: MemberCreateState, formData: FormData): Promise<MemberCreateState> {
  const { user } = await requireAuth()
  const parsed = parseMemberCreateForm(formData)
  if (!parsed.ok) return parsed.state

  let memberId: string
  try {
    const member = await createMember(user.id, parsed.value)
    memberId = member.id
  } catch (error) {
    if (error instanceof MemberCommandError) {
      return describeMemberCreateFailure(error.code === 'CONFLICT' ? 'UNAVAILABLE' : error.code, error.message)
    }
    if (error instanceof MemberAuthorizationError) return describeMemberCreateFailure('NOT_FOUND')
    console.error('Lidmaatskepping het misluk:', error instanceof Error ? error.name : 'onbekende fout')
    return describeMemberCreateFailure('UNAVAILABLE')
  }

  revalidatePath('/admin/lidmate')
  redirect(`/admin/lidmate/${memberId}`)
}

async function runRelated<T extends { memberId: string }>(
  parsed: { ok: true; value: T } | { ok: false; state: MemberRelatedState },
  execute: (userId: string, value: T) => Promise<unknown>,
): Promise<MemberRelatedState> {
  if (!parsed.ok) return parsed.state
  const { user } = await requireAuth()
  try {
    await execute(user.id, parsed.value)
    revalidatePath('/admin/lidmate')
    revalidatePath(`/admin/lidmate/${parsed.value.memberId}`)
    return { status: 'success', message: 'Verandering gestoor.' }
  } catch (error) {
    if (error instanceof MemberCommandError) {
      if (error.code === 'CONFLICT') return relatedFailure('Iemand het hierdie rekord intussen verander. Herlaai die bladsy en probeer weer.')
      if (error.code === 'INVALID') return relatedFailure(error.message)
      return relatedFailure('Hierdie rekord of keuse is nie beskikbaar nie.')
    }
    if (error instanceof MemberAuthorizationError) return relatedFailure('Hierdie rekord of keuse is nie beskikbaar nie.')
    console.error('Verwante lidmaatwysiging het misluk:', error instanceof Error ? error.name : 'onbekende fout')
    return relatedFailure()
  }
}

export async function saveMemberWard(_previous: MemberRelatedState, data: FormData) {
  return runRelated(parseWardForm(data), (userId, value) => setMemberWard(userId, value))
}

export async function saveMemberHousehold(_previous: MemberRelatedState, data: FormData) {
  return runRelated(parseHouseholdForm(data), (userId, value) => setMemberHousehold(userId, value))
}

export async function saveMemberContactPoint(_previous: MemberRelatedState, data: FormData) {
  const parsed = parseContactForm(data)
  return runRelated(parsed, (userId, contact) => {
    return contact.operation === 'end'
      ? endMemberContact(userId, { memberId: contact.memberId, version: contact.version, contactId: contact.contactId })
      : saveMemberContact(userId, contact)
  })
}

export async function saveMemberEvent(_previous: MemberRelatedState, data: FormData) {
  return runRelated(parseEventForm(data), (userId, value) => addMembershipEvent(userId, value))
}
