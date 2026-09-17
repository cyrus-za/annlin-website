'use client'

import * as React from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { addMember } from '@/app/admin/_actions/members'
import {
  MEMBER_CREATE_IDLE,
  type MemberCreateField,
} from '@/lib/members/create-form'
import { MEMBER_NAME_MAX_LENGTH } from '@/lib/members/edit-form'

const controlClassName = 'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:bg-gray-50 aria-[invalid=true]:border-red-600'

export function MemberCreateForm({
  wards,
  wardRequired,
  statusOptions,
}: {
  wards: Array<{ id: string; code: string; name: string }>
  wardRequired: boolean
  statusOptions: Array<{ value: string; label: string }>
}) {
  const [state, action, pending] = useActionState(addMember, MEMBER_CREATE_IDLE)
  const baseId = React.useId()
  const errorFor = (field: MemberCreateField) => state.status === 'error' && state.field === field ? state.message : null
  const idFor = (field: MemberCreateField) => `${baseId}-${field}`

  function Field({ field, label, optional, children }: { field: MemberCreateField; label: string; optional?: boolean; children: React.ReactNode }) {
    const error = errorFor(field)
    return (
      <div className="min-w-0">
        <label htmlFor={idFor(field)} className="mb-1 block text-sm font-semibold text-gray-800">
          {label}{optional && <span className="ml-1 font-normal text-gray-500">(opsioneel)</span>}
        </label>
        {children}
        {error && <p id={`${idFor(field)}-fout`} className="mt-1 text-sm font-medium text-red-700">{error}</p>}
      </div>
    )
  }

  const inputProps = (field: MemberCreateField) => ({
    id: idFor(field),
    name: field,
    disabled: pending,
    'aria-invalid': errorFor(field) ? true as const : undefined,
    'aria-describedby': errorFor(field) ? `${idFor(field)}-fout` : undefined,
    className: controlClassName,
  })

  return (
    <form action={action} noValidate aria-busy={pending} className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      {state.status === 'error' && !state.field && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">{state.message}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field field="firstNames" label="Voorname"><input {...inputProps('firstNames')} required maxLength={MEMBER_NAME_MAX_LENGTH} autoFocus /></Field>
        <Field field="preferredName" label="Noemnaam" optional><input {...inputProps('preferredName')} maxLength={MEMBER_NAME_MAX_LENGTH} /></Field>
        <Field field="lastName" label="Van"><input {...inputProps('lastName')} required maxLength={MEMBER_NAME_MAX_LENGTH} /></Field>
        <Field field="birthDate" label="Geboortedatum" optional><input {...inputProps('birthDate')} type="date" max={new Date().toISOString().slice(0, 10)} /></Field>
        <Field field="status" label="Status">
          <select {...inputProps('status')} required defaultValue="ACTIVE">
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </Field>
        <Field field="wardId" label="Wyk" optional={!wardRequired}>
          <select {...inputProps('wardId')} required={wardRequired} defaultValue="">
            <option value="">{wardRequired ? 'Kies ’n wyk' : 'Nog geen wyk nie'}</option>
            {wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.code}: {ward.name}</option>)}
          </select>
        </Field>
      </div>
      <p className="text-sm text-gray-600">Jy kan kontakbesonderhede, huishouding en lidmaatskapgebeure byvoeg nadat die rekord geskep is.</p>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center rounded-md bg-amber-800 px-5 text-base font-semibold text-white hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-60">
          {pending ? 'Skep tans…' : 'Skep lidmaat'}
        </button>
        <Link href="/admin/lidmate" className="inline-flex min-h-11 items-center rounded-md border border-gray-300 bg-white px-5 text-base font-semibold text-gray-800 hover:bg-gray-50">Kanselleer</Link>
      </div>
    </form>
  )
}
