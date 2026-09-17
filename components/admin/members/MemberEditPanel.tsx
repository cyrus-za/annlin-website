'use client'

import * as React from 'react'
import { useActionState } from 'react'
import type { MemberStatus } from '@prisma/client'
import { saveMemberDetails } from '@/app/admin/_actions/members'
import {
  MEMBER_EDIT_IDLE,
  MEMBER_NAME_MAX_LENGTH,
  hasMemberEditChanges,
  type MemberEditField,
  type MemberEditState,
  type MemberEditValues,
} from '@/lib/members/edit-form'
import { cn } from '@/lib/utils'

interface MemberEditPanelProps {
  memberId: string
  version: number
  values: MemberEditValues
  statusOptions: Array<{ value: MemberStatus; label: string }>
  /** Server-rendered read-only view shown while the form is closed. */
  readView: React.ReactNode
}

const controlClassName =
  'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:bg-gray-50 aria-[invalid=true]:border-red-600'

function FieldShell({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string
  label: string
  error: string | null
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-800">
        {label}
        {optional && <span className="ml-1 font-normal text-gray-500">(opsioneel)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-fout`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export function MemberEditPanel({ memberId, version, values, statusOptions, readView }: MemberEditPanelProps) {
  const baseId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [draft, setDraft] = React.useState<MemberEditValues>(values)
  const toggleRef = React.useRef<HTMLButtonElement>(null)
  const firstFieldRef = React.useRef<HTMLInputElement>(null)
  const returnFocusToToggle = React.useRef(false)

  const [state, formAction, pending] = useActionState<MemberEditState, FormData>(async (previous, formData) => {
    const result = await saveMemberDetails(previous, formData)
    if (result.status === 'success') {
      returnFocusToToggle.current = true
      setShowSuccess(true)
      setOpen(false)
    }
    return result
  }, MEMBER_EDIT_IDLE)

  React.useEffect(() => {
    if (open) {
      firstFieldRef.current?.focus()
    } else if (returnFocusToToggle.current) {
      returnFocusToToggle.current = false
      toggleRef.current?.focus()
    }
  }, [open])

  function beginEdit() {
    // Always start from the latest server values so a previous cancelled draft is not resurrected.
    setDraft(values)
    setShowSuccess(false)
    setOpen(true)
  }

  function cancelEdit() {
    returnFocusToToggle.current = true
    setOpen(false)
  }

  function updateDraft<Key extends keyof MemberEditValues>(key: Key, value: MemberEditValues[Key]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const error = open && state.status === 'error' ? state : null
  const summaryError = error && !error.field ? error : null
  const fieldError = (field: MemberEditField) => (error?.field === field ? error.message : null)
  const dirty = hasMemberEditChanges(draft, values)
  const fieldId = (field: MemberEditField) => `${baseId}-${field}`
  const describedBy = (field: MemberEditField) => (fieldError(field) ? `${fieldId(field)}-fout` : undefined)

  return (
    <div>
      {open ? (
        <form
          action={formAction}
          noValidate
          aria-busy={pending}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !pending) {
              event.preventDefault()
              cancelEdit()
            }
          }}
          className="space-y-5"
        >
          <input type="hidden" name="memberId" value={memberId} />
          <input type="hidden" name="version" value={version} />

          {summaryError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
              <p>{summaryError.message}</p>
              {summaryError.code === 'CONFLICT' && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-2 inline-flex min-h-11 items-center rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-800 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  Herlaai die bladsy
                </button>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell id={fieldId('firstNames')} label="Voorname" error={fieldError('firstNames')}>
              <input
                ref={firstFieldRef}
                id={fieldId('firstNames')}
                name="firstNames"
                value={draft.firstNames}
                onChange={(event) => updateDraft('firstNames', event.target.value)}
                required
                maxLength={MEMBER_NAME_MAX_LENGTH}
                autoComplete="off"
                aria-invalid={fieldError('firstNames') ? true : undefined}
                aria-describedby={describedBy('firstNames')}
                disabled={pending}
                className={controlClassName}
              />
            </FieldShell>
            <FieldShell id={fieldId('preferredName')} label="Noemnaam" error={fieldError('preferredName')} optional>
              <input
                id={fieldId('preferredName')}
                name="preferredName"
                value={draft.preferredName}
                onChange={(event) => updateDraft('preferredName', event.target.value)}
                maxLength={MEMBER_NAME_MAX_LENGTH}
                autoComplete="off"
                aria-invalid={fieldError('preferredName') ? true : undefined}
                aria-describedby={describedBy('preferredName')}
                disabled={pending}
                className={controlClassName}
              />
            </FieldShell>
            <FieldShell id={fieldId('lastName')} label="Van" error={fieldError('lastName')}>
              <input
                id={fieldId('lastName')}
                name="lastName"
                value={draft.lastName}
                onChange={(event) => updateDraft('lastName', event.target.value)}
                required
                maxLength={MEMBER_NAME_MAX_LENGTH}
                autoComplete="off"
                aria-invalid={fieldError('lastName') ? true : undefined}
                aria-describedby={describedBy('lastName')}
                disabled={pending}
                className={controlClassName}
              />
            </FieldShell>
            <FieldShell id={fieldId('birthDate')} label="Geboortedatum" error={fieldError('birthDate')} optional>
              <input
                id={fieldId('birthDate')}
                name="birthDate"
                type="date"
                value={draft.birthDate}
                onChange={(event) => updateDraft('birthDate', event.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                aria-invalid={fieldError('birthDate') ? true : undefined}
                aria-describedby={describedBy('birthDate')}
                disabled={pending}
                className={controlClassName}
              />
            </FieldShell>
            <FieldShell id={fieldId('status')} label="Status" error={fieldError('status')}>
              <select
                id={fieldId('status')}
                name="status"
                value={draft.status}
                onChange={(event) => updateDraft('status', event.target.value as MemberStatus)}
                required
                aria-invalid={fieldError('status') ? true : undefined}
                aria-describedby={describedBy('status')}
                disabled={pending}
                className={controlClassName}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FieldShell>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending || !dirty}
              className="inline-flex min-h-11 items-center rounded-md bg-amber-800 px-5 text-base font-semibold text-white hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Stoor tans…' : 'Stoor veranderinge'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={pending}
              className="inline-flex min-h-11 items-center rounded-md border border-gray-300 bg-white px-5 text-base font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Kanselleer
            </button>
            {!dirty && !pending && <span className="text-sm text-gray-600">Geen veranderinge om te stoor nie.</span>}
          </div>
        </form>
      ) : (
        <>
          {readView}
          <div className="mt-4">
            <button
              ref={toggleRef}
              type="button"
              onClick={beginEdit}
              className="inline-flex min-h-11 items-center rounded-md border border-amber-300 bg-white px-5 text-base font-semibold text-amber-900 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              Wysig kernbesonderhede
            </button>
          </div>
        </>
      )}
      <p role="status" aria-live="polite" className={cn('mt-3 text-sm font-medium text-green-800', !(showSuccess && !open) && 'sr-only')}>
        {showSuccess && !open && state.status === 'success' ? state.message : ''}
      </p>
    </div>
  )
}
