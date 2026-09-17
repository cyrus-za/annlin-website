import type { NextRequest } from 'next/server'
import { getTaskActor, privateJson, taskErrorResponse } from '@/lib/task-api'
import { getTaskAssignees } from '@/lib/services/tasks'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const actor = await getTaskActor(request)
    return privateJson({ assignees: await getTaskAssignees(actor) })
  } catch (error) {
    return taskErrorResponse(error, 'assignees')
  }
}
