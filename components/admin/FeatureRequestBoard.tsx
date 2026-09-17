'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, MessageSquare, Plus, RefreshCw } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import {
  ACTIVE_FEATURE_REQUEST_STATUSES, CLOSED_FEATURE_REQUEST_STATUSES,
  FEATURE_REQUEST_PRIORITIES, FEATURE_REQUEST_PRIORITY_LABELS,
  FEATURE_REQUEST_STATUSES, FEATURE_REQUEST_STATUS_LABELS,
  TASK_SOURCE_LABELS,
  type FeatureRequestDetail, type FeatureRequestPriorityValue,
  type FeatureRequestStatusValue, type FeatureRequestSummary,
  type PendingFeatureRequestAttachment, type TaskSourceValue,
} from '@/lib/feature-requests'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FeatureRequestAttachmentGallery, FeatureRequestImageAttachments } from '@/components/feature-requests/FeatureRequestImageAttachments'
import { cn } from '@/lib/utils'
import { cacheFeatureRequest, featureRequestJson as requestJson, getCachedFeatureRequest, loadCompleteFeatureRequest } from '@/lib/feature-request-client'

type Assignee = { id: string; name: string }

function shortDate(value: string) {
  return new Intl.DateTimeFormat('af-ZA', { day: 'numeric', month: 'short' }).format(new Date(value))
}

function BoardCard({ request, currentUserId, onOpen, onDragStart }: {
  request: FeatureRequestSummary
  currentUserId?: string
  onOpen: () => void
  onDragStart: (event: React.DragEvent) => void
}) {
  return <button type="button" draggable onDragStart={onDragStart} onClick={onOpen} className="w-full cursor-grab rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md active:cursor-grabbing">
    {request.coverImage && <div className="-mx-4 -mt-4 mb-4 overflow-hidden rounded-t-xl border-b bg-stone-100">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={request.coverImage.url} alt={`Aanhangsel: ${request.coverImage.filename}`} className="aspect-video h-auto w-full object-cover" /></div>}
    <div className="flex items-start gap-2">{request.unread && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Ongelees" />}<strong className="min-w-0 flex-1 text-sm leading-5 text-stone-900">{request.title}</strong></div>
    <p className="mt-3 text-xs text-muted-foreground">{request.requester.name} · {shortDate(request.lastActivityAt)}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-800">{TASK_SOURCE_LABELS[request.source]}</span><span className={cn('rounded-full px-2 py-1 font-semibold', request.priority === 'URGENT' ? 'bg-red-100 text-red-800' : request.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-stone-100 text-stone-700')}>{FEATURE_REQUEST_PRIORITY_LABELS[request.priority]}</span>{request.assignee && <span className={cn('truncate rounded-full px-2 py-1 font-semibold', request.assignee.id === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-stone-100 text-stone-700')}>{request.assignee.id === currentUserId ? 'Aan my' : request.assignee.name}</span>}<span className="ml-auto flex items-center gap-1 text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" />{request.messageCount}</span></div>
  </button>
}

export function FeatureRequestBoard() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [requests, setRequests] = React.useState<FeatureRequestSummary[]>([])
  const [assignees, setAssignees] = React.useState<Assignee[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedSummary, setSelectedSummary] = React.useState<FeatureRequestSummary | null>(null)
  const [detail, setDetail] = React.useState<FeatureRequestDetail | null>(null)
  const [showClosed, setShowClosed] = React.useState(false)
  const [assignedToMe, setAssignedToMe] = React.useState(false)
  const [sourceFilter, setSourceFilter] = React.useState<'ALL' | TaskSourceValue>('ALL')
  const [mobileStatus, setMobileStatus] = React.useState<FeatureRequestStatusValue>('NEW')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [dialogNotice, setDialogNotice] = React.useState('')
  const [status, setStatus] = React.useState<FeatureRequestStatusValue>('NEW')
  const [priority, setPriority] = React.useState<FeatureRequestPriorityValue>('NORMAL')
  const [assigneeId, setAssigneeId] = React.useState('')
  const [nextAction, setNextAction] = React.useState('')
  const [note, setNote] = React.useState('')
  const [reply, setReply] = React.useState('')
  const [replyAttachments, setReplyAttachments] = React.useState<PendingFeatureRequestAttachment[]>([])
  const [confirmWip, setConfirmWip] = React.useState(false)
  const [dragTarget, setDragTarget] = React.useState<FeatureRequestStatusValue | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [createTitle, setCreateTitle] = React.useState('')
  const [createDescription, setCreateDescription] = React.useState('')
  const [createAttachments, setCreateAttachments] = React.useState<PendingFeatureRequestAttachment[]>([])
  const [createOperationKey, setCreateOperationKey] = React.useState('')
  const workflowOperationKey = React.useRef('')
  const replyOperationKey = React.useRef('')
  const handledDeepLink = React.useRef('')
  const visibleStatuses = showClosed ? CLOSED_FEATURE_REQUEST_STATUSES : ACTIVE_FEATURE_REQUEST_STATUSES
  const displayedRequests = requests.filter((request) =>
    (!assignedToMe || request.assignee?.id === session?.user.id) &&
    (sourceFilter === 'ALL' || request.source === sourceFilter)
  )

  const loadBoard = React.useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const statuses = showClosed ? CLOSED_FEATURE_REQUEST_STATUSES : ACTIVE_FEATURE_REQUEST_STATUSES
      const pages = await Promise.all(statuses.map((value) => requestJson<{ requests: FeatureRequestSummary[] }>(`/api/feature-requests?scope=all&status=${value}&limit=100`)))
      setRequests(pages.flatMap((page) => page.requests)); setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Take kon nie gelaai word nie') }
    finally { if (!quiet) setLoading(false) }
  }, [showClosed])

  React.useEffect(() => { void loadBoard() }, [loadBoard])
  React.useEffect(() => { setMobileStatus((showClosed ? CLOSED_FEATURE_REQUEST_STATUSES[0] : ACTIVE_FEATURE_REQUEST_STATUSES[0]) as FeatureRequestStatusValue) }, [showClosed])
  React.useEffect(() => { void requestJson<{ assignees: Assignee[] }>('/api/feature-requests/assignees').then((data) => setAssignees(data.assignees)).catch(() => setError('Administrateurs kon nie gelaai word nie')) }, [])
  React.useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') void loadBoard(true) }
    const interval = window.setInterval(refresh, 60_000); window.addEventListener('focus', refresh)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh) }
  }, [loadBoard])

  function hydrateDetail(value: FeatureRequestDetail, desiredStatus?: FeatureRequestStatusValue) {
    setDetail(value); setSelectedSummary(value); setStatus(desiredStatus ?? value.status); setPriority(value.priority)
    setAssigneeId(value.assignee?.id ?? ''); setNextAction(value.nextAction ?? ''); setNote(''); setConfirmWip(false)
    workflowOperationKey.current = ''; replyOperationKey.current = ''
  }

  async function openRequest(request: FeatureRequestSummary, desiredStatus?: FeatureRequestStatusValue) {
    setSelectedId(request.id); setSelectedSummary(request)
    setDialogNotice(desiredStatus ? 'Voltooi die vereiste beplanningsbesonderhede voordat die status verander.' : '')
    const cached = getCachedFeatureRequest(request.id)
    if (cached) hydrateDetail(cached, desiredStatus)
    else { setDetail(null); setStatus(desiredStatus ?? request.status); setPriority(request.priority); setAssigneeId(request.assignee?.id ?? ''); setNextAction(request.nextAction ?? '') }
    try {
      const value = await loadCompleteFeatureRequest(request.id); hydrateDetail(value, desiredStatus)
      await requestJson(`/api/feature-requests/${request.id}/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ throughSeq: value.throughSeq }) })
      setRequests((current) => current.map((item) => item.id === request.id ? { ...item, unread: false } : item))
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Taak kon nie gelaai word nie') }
  }

  const openDeepLinkedRequest = React.useEffectEvent((request: FeatureRequestSummary) => {
    void openRequest(request)
  })

  React.useEffect(() => {
    const requestId = searchParams.get('taak') || searchParams.get('voorstel') || ''
    if (loading || !requestId || handledDeepLink.current === requestId) return
    const request = requests.find((item) => item.id === requestId)
    if (!request) return
    handledDeepLink.current = requestId
    openDeepLinkedRequest(request)
  }, [loading, requests, searchParams])

  async function moveRequest(request: FeatureRequestSummary, nextStatus: FeatureRequestStatusValue) {
    if (request.status === nextStatus) return
    const wipCount = requests.filter((item) => item.status === 'IN_PROGRESS').length
    if (((nextStatus === 'PLANNED' || nextStatus === 'IN_PROGRESS') && (!request.assignee || !request.nextAction?.trim())) || (nextStatus === 'IN_PROGRESS' && wipCount >= 3)) {
      await openRequest(request, nextStatus); return
    }
    const previous = requests
    setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: nextStatus, workflowVersion: item.workflowVersion + 1 } : item))
    try {
      const updated = await requestJson<FeatureRequestDetail>(`/api/feature-requests/${request.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus, note: `Status deur sleep-en-los na ${FEATURE_REQUEST_STATUS_LABELS[nextStatus]} verander.`, workflowVersion: request.workflowVersion, operationKey: crypto.randomUUID() }) })
      cacheFeatureRequest(updated); await loadBoard(true)
    } catch (cause) { setRequests(previous); setError(cause instanceof Error ? cause.message : 'Status kon nie verander word nie') }
  }

  function dropRequest(event: React.DragEvent, nextStatus: FeatureRequestStatusValue) {
    event.preventDefault()
    setDragTarget(null)
    const request = requests.find((item) => item.id === event.dataTransfer.getData('text/plain'))
    if (request) void moveRequest(request, nextStatus)
  }

  async function saveWorkflow(event: React.FormEvent) {
    event.preventDefault(); if (!detail || !note.trim()) return; setSaving(true)
    try {
      if (!workflowOperationKey.current) workflowOperationKey.current = crypto.randomUUID()
      const updated = await requestJson<FeatureRequestDetail>(`/api/feature-requests/${detail.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, priority, assigneeId: assigneeId || null, nextAction: nextAction.trim() || null, note: note.trim(), workflowVersion: detail.workflowVersion, operationKey: workflowOperationKey.current }) })
      workflowOperationKey.current = ''; hydrateDetail(cacheFeatureRequest(updated)); setDialogNotice(''); await loadBoard(true)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Verandering kon nie gestoor word nie') }
    finally { setSaving(false) }
  }

  async function sendReply(event: React.FormEvent) {
    event.preventDefault(); if (!detail || !reply.trim()) return; setSaving(true)
    try {
      if (!replyOperationKey.current) replyOperationKey.current = crypto.randomUUID()
      const updated = await requestJson<FeatureRequestDetail>(`/api/feature-requests/${detail.id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: reply.trim(), operationKey: replyOperationKey.current, attachments: replyAttachments }) })
      replyOperationKey.current = ''; hydrateDetail(cacheFeatureRequest(updated)); setReply(''); setReplyAttachments([]); await loadBoard(true)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Antwoord kon nie gestuur word nie') }
    finally { setSaving(false) }
  }

  async function createRequest(event: React.FormEvent) {
    event.preventDefault(); if (!createTitle.trim() || !createDescription.trim()) return; setSaving(true)
    try {
      const operationKey = createOperationKey || crypto.randomUUID(); setCreateOperationKey(operationKey)
      const created = await requestJson<FeatureRequestDetail>('/api/feature-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: createTitle.trim(), description: createDescription.trim(), pagePath: '/admin/take', source: 'MANUAL', operationKey, attachments: createAttachments }) })
      cacheFeatureRequest(created); setCreateOpen(false); setCreateTitle(''); setCreateDescription(''); setCreateAttachments([]); setCreateOperationKey(''); await loadBoard(true); await openRequest(created)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Taak kon nie geskep word nie') }
    finally { setSaving(false) }
  }

  const inProgressCount = requests.filter((request) => request.status === 'IN_PROGRESS').length
  const needsWipConfirmation = detail?.status !== 'IN_PROGRESS' && status === 'IN_PROGRESS' && inProgressCount >= 3

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-gray-900">Take</h1><p className="mt-1 text-gray-600">Prioritiseer werk uit voorstelle en ander bronne op een plek.</p></div><div className="flex flex-wrap gap-2"><Button type="button" onClick={() => { setCreateOperationKey(crypto.randomUUID()); setCreateOpen(true) }}><Plus className="mr-1.5 h-4 w-4" />Nuwe taak</Button><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as 'ALL' | TaskSourceValue)} aria-label="Filter volgens bron" className="h-10 rounded-md border bg-white px-3 text-sm"><option value="ALL">Alle bronne</option><option value="PROPOSAL">Voorstelle</option><option value="MANUAL">Handmatig</option></select><Button type="button" variant={assignedToMe ? 'default' : 'outline'} onClick={() => setAssignedToMe((value) => !value)}>Aan my toegewys</Button><Button type="button" variant={showClosed ? 'outline' : 'default'} onClick={() => setShowClosed(false)}>Aktief</Button><Button type="button" variant={showClosed ? 'default' : 'outline'} onClick={() => setShowClosed(true)}>Afgehandel</Button><Button type="button" variant="outline" size="icon" onClick={() => void loadBoard()} aria-label="Verfris"><RefreshCw className="h-4 w-4" /></Button></div></div>
    {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <p className="hidden text-sm text-muted-foreground lg:block">Sleep ’n kaart na ’n ander kolom om sy status te verander. Maak die kaart oop vir volledige beplanning.</p>
    {!showClosed && <div className="hidden grid-cols-2 gap-3 lg:grid">{(['DONE', 'NOT_PLANNED'] as const).map((value) => <div key={value} onDragEnter={() => setDragTarget(value)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropRequest(event, value)} className={cn('rounded-xl border-2 border-dashed px-4 py-3 text-center text-sm font-medium transition', dragTarget === value ? 'border-primary bg-primary/10 text-primary' : 'border-stone-300 text-muted-foreground')}>Sleep hier vir {FEATURE_REQUEST_STATUS_LABELS[value]}</div>)}</div>}
    <div className="lg:hidden"><label htmlFor="mobile-status" className="mb-1 block text-sm font-medium">Wys status</label><select id="mobile-status" value={mobileStatus} onChange={(event) => setMobileStatus(event.target.value as FeatureRequestStatusValue)} className="h-11 w-full rounded-lg border bg-white px-3">{visibleStatuses.map((value) => <option key={value} value={value}>{FEATURE_REQUEST_STATUS_LABELS[value]}</option>)}</select></div>
    {loading ? <div className="grid gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-stone-100" />)}</div> : <><div className="space-y-3 lg:hidden">{displayedRequests.filter((request) => request.status === mobileStatus).map((request) => <BoardCard key={request.id} request={request} currentUserId={session?.user.id} onOpen={() => void openRequest(request)} onDragStart={() => undefined} />)}{!displayedRequests.some((request) => request.status === mobileStatus) && <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">Geen take nie.</p>}</div><div className={cn('hidden gap-4 lg:grid', showClosed ? 'lg:grid-cols-2' : 'lg:grid-cols-4')}>{visibleStatuses.map((value) => { const column = displayedRequests.filter((request) => request.status === value); return <section key={value} onDragEnter={() => setDragTarget(value)} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragTarget(null) }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropRequest(event, value)} className={cn('min-w-0 rounded-2xl p-3 transition', dragTarget === value ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-stone-100/80')}><header className="mb-3 flex items-center justify-between px-1"><h2 className="font-semibold text-stone-800">{FEATURE_REQUEST_STATUS_LABELS[value]}</h2><span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-stone-600">{column.length}</span></header><div className="space-y-3">{column.map((request) => <BoardCard key={request.id} request={request} currentUserId={session?.user.id} onOpen={() => void openRequest(request)} onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', request.id) }} />)}{column.length === 0 && <p className="rounded-xl border border-dashed border-stone-300 p-5 text-center text-sm text-stone-500">Sleep ’n taak hierheen</p>}</div></section> })}</div></>}

    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="flex max-h-[92dvh] max-w-2xl flex-col overflow-hidden p-5 sm:p-6"><DialogHeader><DialogTitle>Nuwe taak</DialogTitle><DialogDescription>Skep ’n handmatige taak direk op die werkbord.</DialogDescription></DialogHeader><form onSubmit={createRequest} className="min-h-0 space-y-4 overflow-y-auto pr-1"><div><label htmlFor="board-create-title" className="mb-1 block text-sm font-medium">Opskrif</label><input id="board-create-title" value={createTitle} onChange={(event) => setCreateTitle(event.target.value)} maxLength={160} required className="h-11 w-full rounded-lg border px-3" /></div><div><label htmlFor="board-create-description" className="mb-1 block text-sm font-medium">Beskrywing</label><textarea id="board-create-description" value={createDescription} onChange={(event) => setCreateDescription(event.target.value)} rows={7} maxLength={10000} required className="w-full resize-none rounded-lg border p-3" /></div><FeatureRequestImageAttachments value={createAttachments} onChange={setCreateAttachments} disabled={saving} /><Button type="submit" disabled={saving || !createTitle.trim() || !createDescription.trim()}>Skep taak</Button></form></DialogContent></Dialog>

    <Dialog open={Boolean(selectedId)} onOpenChange={(value) => { if (!value) { setSelectedId(null); setDialogNotice(''); setReplyAttachments([]) } }}><DialogContent className="flex h-[92dvh] max-w-4xl flex-col overflow-hidden p-5 sm:p-6"><DialogHeader className="shrink-0 pr-8"><DialogTitle>{detail?.title ?? selectedSummary?.title ?? 'Taak'}</DialogTitle><DialogDescription>{(detail ?? selectedSummary)?.requester.name ?? ''} · {TASK_SOURCE_LABELS[(detail ?? selectedSummary)?.source ?? 'PROPOSAL']} · {FEATURE_REQUEST_STATUS_LABELS[(detail ?? selectedSummary)?.status ?? 'NEW']}</DialogDescription></DialogHeader>{!detail ? <div className="grid flex-1 gap-6 overflow-hidden pt-4 lg:grid-cols-[1fr_320px]"><div className="space-y-4"><div className="h-32 animate-pulse rounded-xl bg-stone-100" /><div className="h-20 animate-pulse rounded-xl bg-stone-100" /></div><div className="h-72 animate-pulse rounded-xl bg-stone-100" /></div> : <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto lg:grid-cols-[1fr_320px]"><section className="space-y-4"><div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 whitespace-pre-wrap">{detail.description}<div className="mt-3"><FeatureRequestAttachmentGallery attachments={detail.attachments} /></div></div><h3 className="font-semibold">Gesprek</h3>{detail.activities.filter((item) => item.kind !== 'CREATED').map((item) => <div key={item.id} className={cn('rounded-xl border p-4 text-sm', item.actor.id === session?.user.id ? 'ml-6 bg-amber-50' : 'mr-6 bg-white')}><p className="mb-1 text-xs text-muted-foreground"><strong>{item.actor.name}</strong> · {shortDate(item.createdAt)}{item.kind === 'WORKFLOW' ? ' · Werkvloei' : ''}</p><p className="whitespace-pre-wrap">{item.body}</p><div className="mt-3"><FeatureRequestAttachmentGallery attachments={item.attachments} /></div></div>)}<form onSubmit={sendReply} className="space-y-3 border-t pt-4"><FeatureRequestImageAttachments value={replyAttachments} onChange={setReplyAttachments} disabled={saving} /><div className="flex items-end gap-2"><label htmlFor="board-reply" className="sr-only">Skryf ’n antwoord</label><textarea id="board-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={2} placeholder="Skryf ’n antwoord..." className="min-h-12 flex-1 resize-none rounded-lg border p-3" /><Button type="submit" disabled={saving || !reply.trim()}>Stuur</Button></div></form></section><form onSubmit={saveWorkflow} className="space-y-4 rounded-xl border bg-stone-50 p-4 lg:sticky lg:top-0 lg:self-start"><h3 className="font-semibold">Beplanning</h3>{dialogNotice && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{dialogNotice}</p>}<div><label htmlFor="workflow-status" className="mb-1 block text-sm font-medium">Status</label><select id="workflow-status" value={status} onChange={(event) => { setStatus(event.target.value as FeatureRequestStatusValue); setConfirmWip(false) }} className="h-10 w-full rounded-md border bg-white px-3">{FEATURE_REQUEST_STATUSES.map((value) => <option key={value} value={value}>{FEATURE_REQUEST_STATUS_LABELS[value]}</option>)}</select></div><div><label htmlFor="workflow-priority" className="mb-1 block text-sm font-medium">Prioriteit</label><select id="workflow-priority" value={priority} onChange={(event) => setPriority(event.target.value as FeatureRequestPriorityValue)} className="h-10 w-full rounded-md border bg-white px-3">{FEATURE_REQUEST_PRIORITIES.map((value) => <option key={value} value={value}>{FEATURE_REQUEST_PRIORITY_LABELS[value]}</option>)}</select></div><div><label htmlFor="workflow-assignee" className="mb-1 block text-sm font-medium">Verantwoordelike persoon</label><select id="workflow-assignee" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="h-10 w-full rounded-md border bg-white px-3"><option value="">Niemand</option>{assignees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></div><div><label htmlFor="workflow-next" className="mb-1 block text-sm font-medium">Volgende stap</label><textarea id="workflow-next" value={nextAction} onChange={(event) => setNextAction(event.target.value)} rows={3} className="w-full resize-none rounded-md border bg-white p-2" /></div><div><label htmlFor="workflow-note" className="mb-1 block text-sm font-medium">Nota oor verandering</label><textarea id="workflow-note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} required className="w-full resize-none rounded-md border bg-white p-2" /></div>{needsWipConfirmation && <label className="flex items-start gap-2 rounded-lg bg-amber-100 p-3 text-sm text-amber-900"><input type="checkbox" checked={confirmWip} onChange={(event) => setConfirmWip(event.target.checked)} className="mt-1" /><span><AlertTriangle className="mr-1 inline h-4 w-4" />Daar is reeds {inProgressCount} take Besig. Ek wil steeds hierdie een begin.</span></label>}<Button type="submit" className="w-full" disabled={saving || !note.trim() || (needsWipConfirmation && !confirmWip)}>Stoor verandering</Button></form></div>}</DialogContent></Dialog>
  </div>
}
