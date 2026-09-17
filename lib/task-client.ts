import type { TaskDetail } from '@/lib/tasks'

const detailCache = new Map<string, TaskDetail>()

export async function taskJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' })
  const body = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new Error(body.error || 'Die versoek kon nie voltooi word nie')
  return body as T
}

export async function loadCompleteTask(id: string): Promise<TaskDetail> {
  let afterSeq = 0
  const activities: TaskDetail['activities'] = []

  for (let page = 0; page < 100; page++) {
    const next = await taskJson<TaskDetail>(`/api/tasks/${id}?afterSeq=${afterSeq}`)
    activities.push(...next.activities)
    if (!next.hasMoreActivities) {
      const complete = { ...next, activities }
      detailCache.set(id, complete)
      return complete
    }
    if (next.throughSeq <= afterSeq) throw new Error('Die gesprek kon nie volledig gelaai word nie')
    afterSeq = next.throughSeq
  }

  throw new Error('Hierdie gesprek is te lank om veilig te laai')
}

export function getCachedTask(id: string) {
  return detailCache.get(id) ?? null
}

export function cacheTask(detail: TaskDetail) {
  detailCache.set(detail.id, detail)
  return detail
}
