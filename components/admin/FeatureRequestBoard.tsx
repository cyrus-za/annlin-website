'use client'

import * as React from 'react'
import { AlertTriangle, Loader2, MessageSquare, RefreshCw } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import {
  ACTIVE_FEATURE_REQUEST_STATUSES,
  CLOSED_FEATURE_REQUEST_STATUSES,
  FEATURE_REQUEST_PRIORITIES,
  FEATURE_REQUEST_PRIORITY_LABELS,
  FEATURE_REQUEST_STATUSES,
  FEATURE_REQUEST_STATUS_LABELS,
  type FeatureRequestDetail,
  type FeatureRequestPriorityValue,
  type FeatureRequestStatusValue,
  type FeatureRequestSummary,
} from '@/lib/feature-requests'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Assignee = { id: string; name: string }

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'Die versoek kon nie voltooi word nie')
  return body as T
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat('af-ZA', { day: 'numeric', month: 'short' }).format(new Date(value))
}

function BoardCard({ request, onOpen }: { request: FeatureRequestSummary; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="w-full rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md">
      <div className="flex items-start gap-2">
        {request.unread && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Ongelees" />}
        <strong className="min-w-0 flex-1 text-sm leading-5 text-stone-900">{request.title}</strong>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{request.requester.name} · {shortDate(request.lastActivityAt)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={cn('rounded-full px-2 py-1 font-semibold', request.priority === 'URGENT' ? 'bg-red-100 text-red-800' : request.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-stone-100 text-stone-700')}>{FEATURE_REQUEST_PRIORITY_LABELS[request.priority]}</span>
        {request.assignee && <span className="truncate text-muted-foreground">{request.assignee.name}</span>}
        <span className="ml-auto flex items-center gap-1 text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" />{request.messageCount}</span>
      </div>
    </button>
  )
}

export function FeatureRequestBoard() {
  const { data: session } = useSession()
  const [requests, setRequests] = React.useState<FeatureRequestSummary[]>([])
  const [assignees, setAssignees] = React.useState<Assignee[]>([])
  const [detail, setDetail] = React.useState<FeatureRequestDetail | null>(null)
  const [showClosed, setShowClosed] = React.useState(false)
  const [mobileStatus, setMobileStatus] = React.useState<FeatureRequestStatusValue>('NEW')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [status, setStatus] = React.useState<FeatureRequestStatusValue>('NEW')
  const [priority, setPriority] = React.useState<FeatureRequestPriorityValue>('NORMAL')
  const [assigneeId, setAssigneeId] = React.useState('')
  const [nextAction, setNextAction] = React.useState('')
  const [note, setNote] = React.useState('')
  const [reply, setReply] = React.useState('')
  const [confirmWip, setConfirmWip] = React.useState(false)
  const workflowOperationKey = React.useRef('')
  const replyOperationKey = React.useRef('')

  const visibleStatuses = showClosed ? CLOSED_FEATURE_REQUEST_STATUSES : ACTIVE_FEATURE_REQUEST_STATUSES

  const loadBoard = React.useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const statuses = showClosed ? CLOSED_FEATURE_REQUEST_STATUSES : ACTIVE_FEATURE_REQUEST_STATUSES
      const pages = await Promise.all(statuses.map((value) => requestJson<{ requests: FeatureRequestSummary[] }>(`/api/feature-requests?scope=all&status=${value}&limit=100`)))
      setRequests(pages.flatMap((page) => page.requests))
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Voorstelle kon nie gelaai word nie')
    } finally {
      if (!quiet) setLoading(false)
    }
  }, [showClosed])

  React.useEffect(() => { void loadBoard() }, [loadBoard])
  React.useEffect(() => {
    setMobileStatus((showClosed ? CLOSED_FEATURE_REQUEST_STATUSES[0] : ACTIVE_FEATURE_REQUEST_STATUSES[0]) as FeatureRequestStatusValue)
  }, [showClosed])
  React.useEffect(() => {
    void requestJson<{ assignees: Assignee[] }>('/api/feature-requests/assignees').then((data) => setAssignees(data.assignees)).catch(() => setError('Administrateurs kon nie gelaai word nie'))
  }, [])
  React.useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') void loadBoard(true) }
    const interval = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh) }
  }, [loadBoard])

  async function openRequest(id: string) {
    setLoading(true)
    try {
      const value = await requestJson<FeatureRequestDetail>(`/api/feature-requests/${id}`)
      setDetail(value)
      setStatus(value.status)
      setPriority(value.priority)
      setAssigneeId(value.assignee?.id ?? '')
      setNextAction(value.nextAction ?? '')
      setNote('')
      setConfirmWip(false)
      workflowOperationKey.current = ''
      replyOperationKey.current = ''
      await requestJson(`/api/feature-requests/${id}/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ throughSeq: value.throughSeq }) })
      setRequests((current) => current.map((request) => request.id === id ? { ...request, unread: false } : request))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Voorstel kon nie gelaai word nie')
    } finally {
      setLoading(false)
    }
  }

  async function saveWorkflow(event: React.FormEvent) {
    event.preventDefault()
    if (!detail || !note.trim()) return
    setSaving(true)
    try {
      if (!workflowOperationKey.current) workflowOperationKey.current = crypto.randomUUID()
      const updated = await requestJson<FeatureRequestDetail>(`/api/feature-requests/${detail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority, assigneeId: assigneeId || null, nextAction: nextAction.trim() || null, note: note.trim(), workflowVersion: detail.workflowVersion, operationKey: workflowOperationKey.current }),
      })
      workflowOperationKey.current = ''
      setDetail(updated)
      setNote('')
      setConfirmWip(false)
      await loadBoard(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Verandering kon nie gestoor word nie')
    } finally {
      setSaving(false)
    }
  }

  async function sendReply(event: React.FormEvent) {
    event.preventDefault()
    if (!detail || !reply.trim()) return
    setSaving(true)
    try {
      if (!replyOperationKey.current) replyOperationKey.current = crypto.randomUUID()
      const updated = await requestJson<FeatureRequestDetail>(`/api/feature-requests/${detail.id}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: reply.trim(), operationKey: replyOperationKey.current }),
      })
      replyOperationKey.current = ''
      setDetail(updated)
      setReply('')
      await loadBoard(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Antwoord kon nie gestuur word nie')
    } finally {
      setSaving(false)
    }
  }

  const inProgressCount = requests.filter((request) => request.status === 'IN_PROGRESS').length
  const needsWipConfirmation = detail?.status !== 'IN_PROGRESS' && status === 'IN_PROGRESS' && inProgressCount >= 3

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Voorstelle</h1><p className="mt-1 text-gray-600">Prioritiseer idees en hou terugvoer in een gesprek.</p></div>
        <div className="flex gap-2"><Button type="button" variant={showClosed ? 'outline' : 'default'} onClick={() => setShowClosed(false)}>Aktief</Button><Button type="button" variant={showClosed ? 'default' : 'outline'} onClick={() => setShowClosed(true)}>Afgehandel</Button><Button type="button" variant="outline" size="icon" onClick={() => void loadBoard()} aria-label="Verfris"><RefreshCw className="h-4 w-4" /></Button></div>
      </div>
      {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <div className="lg:hidden"><label htmlFor="mobile-status" className="mb-1 block text-sm font-medium">Wys status</label><select id="mobile-status" value={mobileStatus} onChange={(event) => setMobileStatus(event.target.value as FeatureRequestStatusValue)} className="h-11 w-full rounded-lg border bg-white px-3">{visibleStatuses.map((value) => <option key={value} value={value}>{FEATURE_REQUEST_STATUS_LABELS[value]}</option>)}</select></div>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : (
        <>
          <div className="space-y-3 lg:hidden">{requests.filter((request) => request.status === mobileStatus).map((request) => <BoardCard key={request.id} request={request} onOpen={() => void openRequest(request.id)} />)}{!requests.some((request) => request.status === mobileStatus) && <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">Geen voorstelle nie.</p>}</div>
          <div className={cn('hidden gap-4 lg:grid', showClosed ? 'lg:grid-cols-2' : 'lg:grid-cols-4')}>
            {visibleStatuses.map((value) => {
              const column = requests.filter((request) => request.status === value)
              return <section key={value} className="min-w-0 rounded-2xl bg-stone-100/80 p-3"><header className="mb-3 flex items-center justify-between px-1"><h2 className="font-semibold text-stone-800">{FEATURE_REQUEST_STATUS_LABELS[value]}</h2><span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-stone-600">{column.length}</span></header><div className="space-y-3">{column.map((request) => <BoardCard key={request.id} request={request} onOpen={() => void openRequest(request.id)} />)}{column.length === 0 && <p className="rounded-xl border border-dashed border-stone-300 p-5 text-center text-sm text-stone-500">Geen voorstelle nie.</p>}</div></section>
            })}
          </div>
        </>
      )}

      <Dialog open={Boolean(detail)} onOpenChange={(value) => { if (!value) setDetail(null) }}>
        <DialogContent className="flex h-[92dvh] max-w-4xl flex-col overflow-hidden p-5 sm:p-6">
          {detail && <><DialogHeader className="shrink-0 pr-8"><DialogTitle>{detail.title}</DialogTitle><DialogDescription>{detail.requester.name} · {FEATURE_REQUEST_STATUS_LABELS[detail.status]}</DialogDescription></DialogHeader><div className="grid min-h-0 flex-1 gap-6 overflow-y-auto lg:grid-cols-[1fr_320px]">
            <section className="space-y-4"><div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 whitespace-pre-wrap">{detail.description}</div><h3 className="font-semibold">Gesprek</h3>{detail.activities.filter((item) => item.kind !== 'CREATED').map((item) => <div key={item.id} className={cn('rounded-xl border p-4 text-sm', item.actor.id === session?.user.id ? 'ml-6 bg-amber-50' : 'mr-6 bg-white')}><p className="mb-1 text-xs text-muted-foreground"><strong>{item.actor.name}</strong> · {shortDate(item.createdAt)}{item.kind === 'WORKFLOW' ? ' · Werkvloei' : ''}</p><p className="whitespace-pre-wrap">{item.body}</p></div>)}<form onSubmit={sendReply} className="flex items-end gap-2"><label htmlFor="board-reply" className="sr-only">Skryf ’n antwoord</label><textarea id="board-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={2} placeholder="Skryf ’n antwoord..." className="min-h-12 flex-1 resize-none rounded-lg border p-3" /><Button type="submit" disabled={saving || !reply.trim()}>Stuur</Button></form></section>
            <form onSubmit={saveWorkflow} className="space-y-4 rounded-xl border bg-stone-50 p-4 lg:sticky lg:top-0 lg:self-start"><h3 className="font-semibold">Beplanning</h3><div><label htmlFor="workflow-status" className="mb-1 block text-sm font-medium">Status</label><select id="workflow-status" value={status} onChange={(event) => { setStatus(event.target.value as FeatureRequestStatusValue); setConfirmWip(false) }} className="h-10 w-full rounded-md border bg-white px-3">{FEATURE_REQUEST_STATUSES.map((value) => <option key={value} value={value}>{FEATURE_REQUEST_STATUS_LABELS[value]}</option>)}</select></div><div><label htmlFor="workflow-priority" className="mb-1 block text-sm font-medium">Prioriteit</label><select id="workflow-priority" value={priority} onChange={(event) => setPriority(event.target.value as FeatureRequestPriorityValue)} className="h-10 w-full rounded-md border bg-white px-3">{FEATURE_REQUEST_PRIORITIES.map((value) => <option key={value} value={value}>{FEATURE_REQUEST_PRIORITY_LABELS[value]}</option>)}</select></div><div><label htmlFor="workflow-assignee" className="mb-1 block text-sm font-medium">Verantwoordelike persoon</label><select id="workflow-assignee" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="h-10 w-full rounded-md border bg-white px-3"><option value="">Niemand</option>{assignees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></div><div><label htmlFor="workflow-next" className="mb-1 block text-sm font-medium">Volgende stap</label><textarea id="workflow-next" value={nextAction} onChange={(event) => setNextAction(event.target.value)} rows={3} className="w-full resize-none rounded-md border bg-white p-2" /></div><div><label htmlFor="workflow-note" className="mb-1 block text-sm font-medium">Nota oor verandering</label><textarea id="workflow-note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} required className="w-full resize-none rounded-md border bg-white p-2" /></div>{needsWipConfirmation && <label className="flex items-start gap-2 rounded-lg bg-amber-100 p-3 text-sm text-amber-900"><input type="checkbox" checked={confirmWip} onChange={(event) => setConfirmWip(event.target.checked)} className="mt-1" /><span><AlertTriangle className="mr-1 inline h-4 w-4" />Daar is reeds {inProgressCount} voorstelle Besig. Ek wil steeds hierdie een begin.</span></label>}<Button type="submit" className="w-full" disabled={saving || !note.trim() || (needsWipConfirmation && !confirmWip)}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Stoor verandering</Button></form>
          </div></>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
