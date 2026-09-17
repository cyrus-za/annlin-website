'use client'

import * as React from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { addWard, saveWard } from '@/app/admin/_actions/wards'
import { WARD_FORM_IDLE, type WardFormState } from '@/lib/members/ward-form'

type Candidate = {
  id: string
  name: string
  ownWard: { id: string; code: string; name: string } | null
  elderWard: { id: string; code: string; name: string } | null
}
type Ward = {
  id: string
  code: string
  name: string
  activeFrom: string
  version: number
  memberCount: number
  elder: { id: string; name: string; since: string } | null
}

const control = 'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:bg-gray-50'
const primary = 'inline-flex min-h-11 items-center justify-center rounded-md bg-amber-800 px-5 text-base font-semibold text-white hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-60'
const today = new Date().toISOString().slice(0, 10)

function Status({ state }: { state: WardFormState }) {
  if (state.status === 'idle') return null
  return <p role={state.status === 'error' ? 'alert' : 'status'} className={`rounded-lg px-4 py-3 text-sm font-medium ${state.status === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>{state.message}</p>
}

function ElderOptions({ candidates, wardId }: { candidates: Candidate[]; wardId?: string }) {
  return candidates.map((candidate) => {
    const assignedElsewhere = Boolean(candidate.elderWard && candidate.elderWard.id !== wardId)
    const context = candidate.ownWard ? `lid van ${candidate.ownWard.code}` : 'geen lidmaatskapswyk'
    const service = assignedElsewhere && candidate.elderWard ? `; reeds ouderling van ${candidate.elderWard.code}` : ''
    return <option key={candidate.id} value={candidate.id} disabled={assignedElsewhere}>{candidate.name} ({context}{service})</option>
  })
}

function CreateWardForm({ candidates }: { candidates: Candidate[] }) {
  const [state, action, pending] = useActionState(addWard, WARD_FORM_IDLE)
  return (
    <details className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm" defaultOpen={state.status === 'error'}>
      <summary className="cursor-pointer text-lg font-semibold text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Voeg ’n wyk by</summary>
      <form action={action} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-800">Wykkode<input name="code" required maxLength={30} disabled={pending} className={`${control} mt-1`} placeholder="Byvoorbeeld: 12" /></label>
          <label className="text-sm font-semibold text-gray-800">Wyknaam<input name="name" required maxLength={120} disabled={pending} className={`${control} mt-1`} placeholder="Byvoorbeeld: Annlin-Oos" /></label>
          <label className="text-sm font-semibold text-gray-800">Aktief vanaf<input name="activeFrom" type="date" required defaultValue={today} disabled={pending} className={`${control} mt-1`} /></label>
          <label className="text-sm font-semibold text-gray-800">Ouderling <span className="font-normal text-gray-500">(opsioneel)</span>
            <select name="elderId" defaultValue="" disabled={pending} className={`${control} mt-1`}><option value="">Nog nie toegewys nie</option><ElderOptions candidates={candidates} /></select>
          </label>
          <label className="text-sm font-semibold text-gray-800">Ouderling vanaf<input name="elderStartDate" type="date" defaultValue={today} disabled={pending} className={`${control} mt-1`} /></label>
        </div>
        <Status state={state} />
        <button type="submit" disabled={pending} className={primary}>{pending ? 'Skep tans…' : 'Skep wyk'}</button>
      </form>
    </details>
  )
}

function WardCard({ ward, candidates }: { ward: Ward; candidates: Candidate[] }) {
  const [state, action, pending] = useActionState(saveWard, WARD_FORM_IDLE)
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-xl font-bold text-gray-900">{ward.code}: {ward.name}</h2><p className="mt-1 text-sm text-gray-600">{ward.memberCount} huidige lid{ward.memberCount === 1 ? '' : 'mate'} · {ward.elder ? `Ouderling: ${ward.elder.name}` : 'Geen ouderling toegewys nie'}</p></div>
        {ward.elder && <Link href={`/admin/lidmate/${encodeURIComponent(ward.elder.id)}`} prefetch={false} className="text-sm font-semibold text-amber-800 hover:underline">Bekyk ouderling</Link>}
      </div>
      <form action={action} className="space-y-4">
        <input type="hidden" name="wardId" value={ward.id} /><input type="hidden" name="version" value={ward.version} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-800">Wykkode<input name="code" required maxLength={30} defaultValue={ward.code} disabled={pending} className={`${control} mt-1`} /></label>
          <label className="text-sm font-semibold text-gray-800">Wyknaam<input name="name" required maxLength={120} defaultValue={ward.name} disabled={pending} className={`${control} mt-1`} /></label>
          <label className="text-sm font-semibold text-gray-800">Aktief vanaf<input name="activeFrom" type="date" required defaultValue={ward.activeFrom} disabled={pending} className={`${control} mt-1`} /></label>
          <label className="text-sm font-semibold text-gray-800">Ouderling
            <select name="elderId" defaultValue={ward.elder?.id ?? ''} disabled={pending} className={`${control} mt-1`}><option value="">Geen ouderling</option><ElderOptions candidates={candidates} wardId={ward.id} /></select>
          </label>
          <label className="text-sm font-semibold text-gray-800">Verandering van toepassing vanaf<input name="elderStartDate" type="date" defaultValue={today} disabled={pending} className={`${control} mt-1`} /></label>
        </div>
        <p className="text-sm text-gray-600">Die ouderling se eie lidmaatskapswyk verander nie wanneer hy aan hierdie wyk toegewys word nie.</p>
        <Status state={state} />
        <button type="submit" disabled={pending} className={primary}>{pending ? 'Stoor tans…' : 'Stoor wyk'}</button>
      </form>
    </article>
  )
}

export function WardManagement({ canCreate, wards, candidates }: { canCreate: boolean; wards: Ward[]; candidates: Candidate[] }) {
  return <div className="space-y-6">
    {canCreate && <CreateWardForm candidates={candidates} />}
    {wards.length === 0 ? <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-base text-gray-600">Geen aktiewe wyke is beskikbaar nie.</p> : wards.map((ward) => <WardCard key={ward.id} ward={ward} candidates={candidates} />)}
  </div>
}
