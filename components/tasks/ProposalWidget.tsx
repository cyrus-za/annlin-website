'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Loader2, MessageSquarePlus, Plus, Send } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import {
  TASK_DRAFT_STORAGE_PREFIX,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type PendingTaskAttachment,
  type TaskDetail,
  type TaskSummary,
} from '@/lib/tasks'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { loadCompleteTask, taskJson as requestJson } from '@/lib/task-client'
import { TaskAttachmentGallery, TaskImageAttachments } from '@/components/tasks/TaskImageAttachments'

type Screen = { name: 'list' | 'new' } | { name: 'thread'; id: string }
type Scope = 'mine' | 'all' | 'unread'

function relativeDate(value: string) {
  return new Intl.DateTimeFormat('af-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function StatusPill({ request }: { request: TaskSummary }) {
  return (
    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
      {TASK_STATUS_LABELS[request.status]}
    </span>
  )
}

function Thread({ detail, currentUserId, busy, onReply }: {
  detail: TaskDetail
  currentUserId: string
  busy: boolean
  onReply: (body: string, attachments: PendingTaskAttachment[]) => Promise<void>
}) {
  const [body, setBody] = React.useState('')
  const [attachments, setAttachments] = React.useState<PendingTaskAttachment[]>([])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!body.trim()) return
    await onReply(body.trim(), attachments)
    setBody('')
    setAttachments([])
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-1 py-4 sm:px-2">
        <div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-stone-800">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-800">Oorspronklike voorstel</p>
          <p className="whitespace-pre-wrap">{detail.description}</p>
          <div className="mt-3"><TaskAttachmentGallery attachments={detail.attachments} /></div>
        </div>
        {detail.activities.filter((activity) => activity.kind !== 'CREATED').map((activity) => {
          const mine = activity.actor.id === currentUserId
          return (
            <div key={activity.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm', mine ? 'bg-primary text-primary-foreground' : 'border bg-white text-stone-800')}>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs opacity-75">
                  <strong>{activity.actor.name}</strong>
                  <span>{relativeDate(activity.createdAt)}</span>
                </div>
                {activity.kind === 'WORKFLOW' && <p className="mb-1 text-xs font-semibold uppercase tracking-wide">Status opgedateer</p>}
                <p className="whitespace-pre-wrap">{activity.body}</p>
                <div className="mt-3"><TaskAttachmentGallery attachments={activity.attachments} /></div>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={submit} className="space-y-3 border-t bg-white pt-4">
        <TaskImageAttachments value={attachments} onChange={setAttachments} disabled={busy} />
        <label htmlFor={`feature-reply-${detail.id}`} className="sr-only">Skryf ’n antwoord</label>
        <div className="flex items-end gap-2">
          <textarea
            id={`feature-reply-${detail.id}`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={2}
            maxLength={10000}
            placeholder="Skryf ’n antwoord..."
            className="min-h-12 flex-1 resize-none rounded-lg border border-stone-300 px-3 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" size="icon" disabled={busy || !body.trim()} aria-label="Stuur antwoord">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}

export function ProposalWidget() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const [open, setOpen] = React.useState(false)
  const [screen, setScreen] = React.useState<Screen>({ name: 'list' })
  const [scope, setScope] = React.useState<Scope>('mine')
  const [requests, setRequests] = React.useState<TaskSummary[]>([])
  const [detail, setDetail] = React.useState<TaskDetail | null>(null)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [canManage, setCanManage] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [attachments, setAttachments] = React.useState<PendingTaskAttachment[]>([])
  const [operationKey, setOperationKey] = React.useState('')
  const replyOperationKey = React.useRef('')
  const user = session?.user
  const draftKey = user ? `${TASK_DRAFT_STORAGE_PREFIX}:${user.id}:new` : ''

  const loadList = React.useCallback(async (quiet = false) => {
    if (!user) return
    if (!quiet) setLoading(true)
    try {
      const data = await requestJson<{ requests: TaskSummary[]; unreadCount: number; canManage: boolean }>(`/api/tasks?scope=${scope}&source=PROPOSAL&limit=20`)
      setRequests(data.requests)
      setUnreadCount(data.unreadCount)
      setCanManage(data.canManage)
      setError('')
    } catch (cause) {
      if (!quiet) setError(cause instanceof Error ? cause.message : 'Voorstelle kon nie gelaai word nie')
    } finally {
      if (!quiet) setLoading(false)
    }
  }, [scope, user])

  const loadDetail = React.useCallback(async (id: string, quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const data = await loadCompleteTask(id)
      setDetail(data)
      setError('')
      await requestJson(`/api/tasks/${id}/read`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ throughSeq: data.throughSeq }),
      })
      setUnreadCount((count) => Math.max(0, count - (data.unread ? 1 : 0)))
    } catch (cause) {
      if (!quiet) setError(cause instanceof Error ? cause.message : 'Voorstel kon nie gelaai word nie')
    } finally {
      if (!quiet) setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!user) return
    void loadList()
  }, [loadList, user])

  React.useEffect(() => {
    if (!user) return
    const refresh = () => {
      void loadList(true)
      if (open && screen.name === 'thread') void loadDetail(screen.id, true)
    }
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, 60_000)
    window.addEventListener('focus', refresh)
    window.addEventListener('online', refresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('online', refresh)
    }
  }, [loadDetail, loadList, open, screen, user])

  React.useEffect(() => {
    if (!draftKey) return
    const saved = window.sessionStorage.getItem(draftKey)
    if (!saved) return
    try {
      const draft = JSON.parse(saved) as { title?: string; description?: string; operationKey?: string; attachments?: PendingTaskAttachment[] }
      setTitle(draft.title ?? '')
      setDescription(draft.description ?? '')
      setOperationKey(draft.operationKey ?? crypto.randomUUID())
      setAttachments(draft.attachments ?? [])
    } catch {
      window.sessionStorage.removeItem(draftKey)
      setOperationKey(crypto.randomUUID())
    }
  }, [draftKey])

  React.useEffect(() => {
    if (draftKey && !operationKey) setOperationKey(crypto.randomUUID())
  }, [draftKey, operationKey])

  React.useEffect(() => {
    if (!draftKey) return
    if (!title && !description && attachments.length === 0) window.sessionStorage.removeItem(draftKey)
    else window.sessionStorage.setItem(draftKey, JSON.stringify({ title, description, operationKey, attachments }))
  }, [attachments, description, draftKey, operationKey, title])

  async function createRequest(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !description.trim()) return
    setBusy(true)
    try {
      const created = await requestJson<TaskDetail>('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), pagePath: pathname, operationKey, attachments }),
      })
      setTitle('')
      setDescription('')
      setOperationKey(crypto.randomUUID())
      setAttachments([])
      window.sessionStorage.removeItem(draftKey)
      setDetail(created)
      setScreen({ name: 'thread', id: created.id })
      await loadList(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Voorstel kon nie gestuur word nie')
    } finally {
      setBusy(false)
    }
  }

  async function reply(body: string, replyAttachments: PendingTaskAttachment[]) {
    if (screen.name !== 'thread') return
    setBusy(true)
    try {
      if (!replyOperationKey.current) replyOperationKey.current = crypto.randomUUID()
      await requestJson<TaskDetail>(`/api/tasks/${screen.id}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body, operationKey: replyOperationKey.current, attachments: replyAttachments }),
      })
      replyOperationKey.current = ''
      setDetail(await loadCompleteTask(screen.id))
      await loadList(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Antwoord kon nie gestuur word nie')
    } finally {
      setBusy(false)
    }
  }

  if (isPending || !user || pathname.startsWith('/auth/') || pathname === '/admin/take' || pathname === '/admin/voorstelle') return null

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 h-12 rounded-full px-4 shadow-xl sm:bottom-6 sm:right-6 sm:h-14 sm:px-5"
        aria-label={unreadCount ? `Voorstelle, ${unreadCount} ongelees` : 'Voorstelle'}
      >
        <MessageSquarePlus className="h-5 w-5 sm:mr-2" />
        <span className="hidden sm:inline">Voorstelle</span>
        {unreadCount > 0 && <span className="ml-2 min-w-5 rounded-full bg-white px-1.5 text-xs font-bold text-primary">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="inset-0 left-0 top-0 flex h-[100dvh] max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-4 sm:left-1/2 sm:top-1/2 sm:h-[min(760px,90dvh)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6">
          <DialogHeader className="shrink-0 pr-8 text-left">
            <div className="flex items-center gap-2">
              {screen.name !== 'list' && (
                <Button type="button" variant="ghost" size="icon" onClick={() => { setScreen({ name: 'list' }); setDetail(null); void loadList() }} aria-label="Terug na voorstelle">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <DialogTitle>{screen.name === 'new' ? 'Nuwe voorstel' : screen.name === 'thread' ? detail?.title ?? 'Voorstel' : 'Voorstelle'}</DialogTitle>
                <DialogDescription>{screen.name === 'list' ? 'Deel idees en volg terugvoer op een plek.' : screen.name === 'new' ? 'Beskryf wat jy graag wil verander of verbeter.' : detail ? `${TASK_STATUS_LABELS[detail.status]} · ${TASK_PRIORITY_LABELS[detail.priority]}` : 'Laai gesprek...'}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {error && <div role="alert" className="my-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>}

          {screen.name === 'list' && (
            <div className="flex min-h-0 flex-1 flex-col pt-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {(['mine', ...(canManage ? ['all', 'unread'] : ['unread'])] as Scope[]).map((value) => (
                  <Button key={value} type="button" size="sm" variant={scope === value ? 'default' : 'outline'} onClick={() => setScope(value)}>
                    {value === 'mine' ? 'My voorstelle' : value === 'all' ? 'Alles' : `Ongelees${unreadCount ? ` (${unreadCount})` : ''}`}
                  </Button>
                ))}
                <Button type="button" size="sm" className="ml-auto" onClick={() => setScreen({ name: 'new' })}>
                  <Plus className="mr-1 h-4 w-4" /> Nuwe voorstel
                </Button>
              </div>
              {canManage && <Button asChild variant="link" className="mb-2 h-auto justify-start p-0"><Link href="/admin/take" onClick={() => setOpen(false)}>Maak die volledige takebord oop</Link></Button>}
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                {loading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                {!loading && requests.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Geen voorstelle in hierdie aansig nie.</p>}
                {!loading && requests.map((request) => (
                  <button key={request.id} type="button" onClick={() => { setScreen({ name: 'thread', id: request.id }); void loadDetail(request.id) }} className="flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left transition hover:border-primary/40 hover:shadow-sm">
                    <span className={cn('mt-2 h-2.5 w-2.5 shrink-0 rounded-full', request.unread ? 'bg-primary' : 'bg-stone-200')} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2"><strong className="truncate text-sm text-stone-900">{request.title}</strong><StatusPill request={request} /></span>
                      <span className="mt-2 block text-xs text-muted-foreground">{request.requester.name} · {relativeDate(request.lastActivityAt)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {screen.name === 'new' && (
            <form onSubmit={createRequest} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pt-5">
              <div><label htmlFor="feature-title" className="mb-1.5 block text-sm font-medium">Opskrif</label><input id="feature-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} required className="h-11 w-full rounded-lg border border-stone-300 px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              <div className="flex min-h-0 flex-1 flex-col"><label htmlFor="feature-description" className="mb-1.5 block text-sm font-medium">Beskrywing</label><textarea id="feature-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={10000} required className="min-h-52 flex-1 resize-none rounded-lg border border-stone-300 p-3 text-base leading-6 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Wat moet verander, en waarom?" /></div>
              <TaskImageAttachments value={attachments} onChange={setAttachments} disabled={busy} />
              <p className="text-xs text-muted-foreground">Bladsykonteks: {pathname}</p>
              <Button type="submit" disabled={busy || !operationKey || !title.trim() || !description.trim()}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Stuur voorstel</Button>
            </form>
          )}

          {screen.name === 'thread' && (loading || !detail ? <div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : <Thread detail={detail} currentUserId={user.id} busy={busy} onReply={reply} />)}
        </DialogContent>
      </Dialog>
    </>
  )
}
