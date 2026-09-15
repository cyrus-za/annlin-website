import type { FeatureRequestDetail } from '@/lib/feature-requests'

export async function featureRequestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' })
  const body = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new Error(body.error || 'Die versoek kon nie voltooi word nie')
  return body as T
}

export async function loadCompleteFeatureRequest(id: string): Promise<FeatureRequestDetail> {
  let afterSeq = 0
  const activities: FeatureRequestDetail['activities'] = []

  for (let page = 0; page < 100; page++) {
    const next = await featureRequestJson<FeatureRequestDetail>(`/api/feature-requests/${id}?afterSeq=${afterSeq}`)
    activities.push(...next.activities)
    if (!next.hasMoreActivities) return { ...next, activities }
    if (next.throughSeq <= afterSeq) throw new Error('Die gesprek kon nie volledig gelaai word nie')
    afterSeq = next.throughSeq
  }

  throw new Error('Hierdie gesprek is te lank om veilig te laai')
}
