import type { NextRequest } from 'next/server'
import { featureRequestErrorResponse, getFeatureRequestActor, privateJson, requireJsonMutation } from '@/lib/feature-request-api'
import { createFeatureRequest, getFeatureRequestDetail, getFeatureRequestUnreadCount, listFeatureRequests } from '@/lib/services/feature-requests'
import { createFeatureRequestSchema, featureRequestListQuerySchema } from '@/lib/validations/feature-requests'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const actor = await getFeatureRequestActor(request)
    const query = featureRequestListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams))
    const [page, unreadCount] = await Promise.all([
      listFeatureRequests(actor, query),
      getFeatureRequestUnreadCount(actor),
    ])
    return privateJson({ ...page, unreadCount })
  } catch (error) {
    return featureRequestErrorResponse(error, 'list')
  }
}

export async function POST(request: NextRequest) {
  try {
    requireJsonMutation(request)
    const actor = await getFeatureRequestActor(request)
    const input = createFeatureRequestSchema.parse(await request.json())
    const created = await createFeatureRequest(actor, input)
    return privateJson(await getFeatureRequestDetail(actor, created.id), { status: 201 })
  } catch (error) {
    return featureRequestErrorResponse(error, 'create')
  }
}
