import type { NextRequest } from 'next/server'
import { featureRequestErrorResponse, getFeatureRequestActor, privateJson, requireJsonMutation } from '@/lib/feature-request-api'
import { addFeatureRequestMessage, getFeatureRequestDetail } from '@/lib/services/feature-requests'
import { createFeatureRequestMessageSchema } from '@/lib/validations/feature-requests'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    requireJsonMutation(request)
    const actor = await getFeatureRequestActor(request)
    const { id } = await context.params
    const input = createFeatureRequestMessageSchema.parse(await request.json())
    await addFeatureRequestMessage(actor, id, input)
    return privateJson(await getFeatureRequestDetail(actor, id))
  } catch (error) {
    return featureRequestErrorResponse(error, 'message')
  }
}
