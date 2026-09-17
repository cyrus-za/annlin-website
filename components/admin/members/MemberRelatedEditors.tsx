'use client'

import * as React from 'react'
import { useActionState } from 'react'
import type { HouseholdRole, MemberContactType, MembershipEventType } from '@prisma/client'
import {
  saveMemberContactPoint,
  saveMemberEvent,
  saveMemberHousehold,
  saveMemberWard,
} from '@/app/admin/_actions/members'
import {
  CONTACT_TYPE_LABELS,
  HOUSEHOLD_ROLE_LABELS,
  MEMBERSHIP_EVENT_LABELS,
} from '@/lib/members/labels'
import { MEMBER_RELATED_IDLE, type MemberRelatedState } from '@/lib/members/related-form'

const control = 'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:bg-gray-50'
const primary = 'inline-flex min-h-11 items-center justify-center rounded-md bg-amber-800 px-5 text-base font-semibold text-white hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-60'
const secondary = 'inline-flex min-h-11 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-base font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60'
const today = new Date().toISOString().slice(0, 10)

function Status({ state }: { state: MemberRelatedState }) {
  if (state.status === 'idle') return null
  return <p role={state.status === 'error' ? 'alert' : 'status'} className={`rounded-lg px-4 py-3 text-sm font-medium ${state.status === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>{state.message}</p>
}

function RecordFields({ memberId, version }: { memberId: string; version: number }) {
  return <><input type="hidden" name="memberId" value={memberId} /><input type="hidden" name="version" value={version} /></>
}

function Editor({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="mt-4 rounded-lg border border-amber-200 bg-amber-50/40 p-4">
      <summary className="cursor-pointer text-base font-semibold text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">{label}</summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

export function WardEditor({ memberId, version, currentWardId, wards, wardRequired }: {
  memberId: string; version: number; currentWardId: string | null
  wards: Array<{ id: string; code: string; name: string }>; wardRequired: boolean
}) {
  const [state, action, pending] = useActionState(saveMemberWard, MEMBER_RELATED_IDLE)
  return <Editor label="Verander individuele wyk">
    <form action={action} className="space-y-4">
      <RecordFields memberId={memberId} version={version} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-gray-800">Wyk
          <select name="wardId" defaultValue={currentWardId ?? ''} required={wardRequired} disabled={pending} className={`${control} mt-1`}>
            {!wardRequired && <option value="">Geen individuele wyk</option>}
            {wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.code}: {ward.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-800">Van toepassing vanaf
          <input name="startDate" type="date" required defaultValue={today} disabled={pending} className={`${control} mt-1`} />
        </label>
      </div>
      <Status state={state} />
      <button type="submit" disabled={pending} className={primary}>{pending ? 'Stoor tans…' : 'Stoor wyk'}</button>
    </form>
  </Editor>
}

export function HouseholdEditor({ memberId, version, currentHouseholdId, currentRole, currentIsHead, households, canCreateHousehold }: {
  memberId: string; version: number; currentHouseholdId: string | null; currentRole: HouseholdRole; currentIsHead: boolean
  households: Array<{ id: string; name: string }>; canCreateHousehold: boolean
}) {
  const [state, action, pending] = useActionState(saveMemberHousehold, MEMBER_RELATED_IDLE)
  return <Editor label="Verander huishouding">
    <form action={action} className="space-y-4">
      <RecordFields memberId={memberId} version={version} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-gray-800">Bestaande huishouding
          <select name="householdId" defaultValue={currentHouseholdId ?? ''} disabled={pending} className={`${control} mt-1`}>
            <option value="">Geen huishouding</option>
            {households.map((household) => <option key={household.id} value={household.id}>{household.name}</option>)}
          </select>
        </label>
        {canCreateHousehold && <label className="text-sm font-semibold text-gray-800">Of nuwe huishoudingnaam <span className="font-normal text-gray-500">(opsioneel)</span>
          <input name="newHouseholdName" maxLength={160} disabled={pending} className={`${control} mt-1`} placeholder="Byvoorbeeld: Venter-huishouding" />
        </label>}
        <label className="text-sm font-semibold text-gray-800">Rol
          <select name="role" defaultValue={currentRole} disabled={pending} className={`${control} mt-1`}>
            {(Object.keys(HOUSEHOLD_ROLE_LABELS) as HouseholdRole[]).map((role) => <option key={role} value={role}>{HOUSEHOLD_ROLE_LABELS[role]}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-800">Van toepassing vanaf
          <input name="startDate" type="date" required defaultValue={today} disabled={pending} className={`${control} mt-1`} />
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-base text-gray-800"><input name="isHead" type="checkbox" defaultChecked={currentIsHead} disabled={pending} className="h-5 w-5" />Hooflid van huishouding</label>
      <p className="text-sm text-gray-600">’n Nuwe huishoudingnaam word net gebruik wanneer geen bestaande huishouding gekies is nie.</p>
      <Status state={state} />
      <button type="submit" disabled={pending} className={primary}>{pending ? 'Stoor tans…' : 'Stoor huishouding'}</button>
    </form>
  </Editor>
}

type Contact = { id: string; type: MemberContactType; value: string; isPreferred: boolean; isVerified: boolean }

export function ContactEditor({ memberId, version, contacts }: { memberId: string; version: number; contacts: Contact[] }) {
  const [state, action, pending] = useActionState(saveMemberContactPoint, MEMBER_RELATED_IDLE)
  const [contactId, setContactId] = React.useState('')
  const selected = contacts.find((contact) => contact.id === contactId)
  const [type, setType] = React.useState<MemberContactType>('MOBILE')
  const [value, setValue] = React.useState('')
  const [preferred, setPreferred] = React.useState(false)
  const [verified, setVerified] = React.useState(false)

  function choose(id: string) {
    setContactId(id)
    const contact = contacts.find((item) => item.id === id)
    setType(contact?.type ?? 'MOBILE')
    setValue(contact?.value ?? '')
    setPreferred(contact?.isPreferred ?? false)
    setVerified(contact?.isVerified ?? false)
  }

  return <Editor label="Voeg by of wysig kontakpunt">
    <form action={action} className="space-y-4">
      <RecordFields memberId={memberId} version={version} />
      <input type="hidden" name="contactId" value={contactId} />
      <label className="block text-sm font-semibold text-gray-800">Kontakpunt
        <select value={contactId} onChange={(event) => choose(event.target.value)} disabled={pending} className={`${control} mt-1`}>
          <option value="">Nuwe kontakpunt</option>
          {contacts.map((contact) => <option key={contact.id} value={contact.id}>{CONTACT_TYPE_LABELS[contact.type]}: {contact.value}</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-gray-800">Soort
          <select name="type" value={type} onChange={(event) => setType(event.target.value as MemberContactType)} disabled={pending} className={`${control} mt-1`}>
            {(Object.keys(CONTACT_TYPE_LABELS) as MemberContactType[]).map((item) => <option key={item} value={item}>{CONTACT_TYPE_LABELS[item]}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-800">Kontakbesonderhede
          <input name="value" value={value} onChange={(event) => setValue(event.target.value)} required maxLength={240} disabled={pending} className={`${control} mt-1`} />
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-base text-gray-800"><input name="isPreferred" type="checkbox" checked={preferred} onChange={(event) => setPreferred(event.target.checked)} disabled={pending} className="h-5 w-5" />Voorkeurkontakpunt</label>
      <label className="flex min-h-11 items-center gap-3 text-base text-gray-800"><input name="isVerified" type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} disabled={pending} className="h-5 w-5" />Kontakpunt is geverifieer</label>
      <Status state={state} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" name="operation" value="save" disabled={pending} className={primary}>{pending ? 'Stoor tans…' : selected ? 'Stoor kontakpunt' : 'Voeg kontakpunt by'}</button>
        {selected && <button type="submit" name="operation" value="end" disabled={pending} className={secondary}>Verwyder huidige kontakpunt</button>}
      </div>
    </form>
  </Editor>
}

export function EventEditor({ memberId, version }: { memberId: string; version: number }) {
  const [state, action, pending] = useActionState(saveMemberEvent, MEMBER_RELATED_IDLE)
  return <Editor label="Voeg lidmaatskapgebeurtenis by">
    <form action={action} className="space-y-4">
      <RecordFields memberId={memberId} version={version} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-gray-800">Gebeurtenis
          <select name="type" defaultValue="OTHER" disabled={pending} className={`${control} mt-1`}>
            {(Object.keys(MEMBERSHIP_EVENT_LABELS) as MembershipEventType[]).filter((type) => type !== 'STATUS_CHANGED').map((type) => <option key={type} value={type}>{MEMBERSHIP_EVENT_LABELS[type]}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-800">Datum
          <input name="effectiveDate" type="date" required defaultValue={today} disabled={pending} className={`${control} mt-1`} />
        </label>
      </div>
      <label className="block text-sm font-semibold text-gray-800">Nota <span className="font-normal text-gray-500">(opsioneel)</span>
        <textarea name="note" rows={4} maxLength={1000} disabled={pending} className="mt-1 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" />
      </label>
      <p className="text-sm text-gray-600">Gebeurtenisse vorm deel van die historiese rekord en word nie later stilweg oorskryf nie.</p>
      <Status state={state} />
      <button type="submit" disabled={pending} className={primary}>{pending ? 'Voeg tans by…' : 'Voeg gebeurtenis by'}</button>
    </form>
  </Editor>
}
