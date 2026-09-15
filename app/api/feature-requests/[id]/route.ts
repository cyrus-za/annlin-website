import type { NextRequest } from 'next/server'
import { featureRequestErrorResponse, getFeatureRequestActor, privateJson, requireJsonMutation } from '@/lib/feature-request-api'
import { FeatureRequestError, getFeatureRequestDetail, updateFeatureRequestWorkflow } from '@/lib/services/feature-requests'
import { updateFeatureRequestWorkflowSchema } from '@/lib/validations/feature-requests'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const actor = await getFeatureRequestActor(request)
    const { id } = await context.params
    const afterSeq = Number(request.nextUrl.searchParams.get('afterSeq') ?? 0)
    if (!Number.isInteger(afterSeq) || afterSeq < 0) throw new FeatureRequestError('INVALID', 'Ongeldige leesposisie')
    return privateJson(await getFeatureRequestDetail(actor, id, afterSeq))
  } catch (error) {
    return featureRequestErrorResponse(error, 'detail')
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    requireJsonMutation(request)
    const actor = await getFeatureRequestActor(request)
    const { id } = await context.params
    const input = updateFeatureRequestWorkflowSchema.parse(await request.json())
    await updateFeatureRequestWorkflow(actor, id, input)
    return privateJson(await getFeatureRequestDetail(actor, id))
  } catch (error) {
    return featureRequestErrorResponse(error, 'workflow')
  }
}
