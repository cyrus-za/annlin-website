import type { NextRequest } from 'next/server'
import { featureRequestErrorResponse, getFeatureRequestActor, privateJson } from '@/lib/feature-request-api'
import { getFeatureRequestAssignees } from '@/lib/services/feature-requests'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const actor = await getFeatureRequestActor(request)
    return privateJson({ assignees: await getFeatureRequestAssignees(actor) })
  } catch (error) {
    return featureRequestErrorResponse(error, 'assignees')
  }
}
