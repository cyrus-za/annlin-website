import type { NextRequest } from 'next/server'
import { featureRequestErrorResponse, getFeatureRequestActor, privateJson, requireJsonMutation } from '@/lib/feature-request-api'
import { markFeatureRequestRead } from '@/lib/services/feature-requests'
import { markFeatureRequestReadSchema } from '@/lib/validations/feature-requests'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    requireJsonMutation(request)
    const actor = await getFeatureRequestActor(request)
    const { id } = await context.params
    const input = markFeatureRequestReadSchema.parse(await request.json())
    await markFeatureRequestRead(actor, id, input.throughSeq)
    return privateJson({ success: true })
  } catch (error) {
    return featureRequestErrorResponse(error, 'read')
  }
}
