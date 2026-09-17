import type { NextRequest } from 'next/server'
import { getTaskActor, privateJson, requireJsonMutation, taskErrorResponse } from '@/lib/task-api'
import { getTaskDetail, TaskError, updateTaskWorkflow } from '@/lib/services/tasks'
import { updateTaskWorkflowSchema } from '@/lib/validations/tasks'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const actor = await getTaskActor(request)
    const { id } = await context.params
    const afterSeq = Number(request.nextUrl.searchParams.get('afterSeq') ?? 0)
    if (!Number.isInteger(afterSeq) || afterSeq < 0) throw new TaskError('INVALID', 'Ongeldige leesposisie')
    return privateJson(await getTaskDetail(actor, id, afterSeq))
  } catch (error) {
    return taskErrorResponse(error, 'detail')
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    requireJsonMutation(request)
    const actor = await getTaskActor(request)
    const { id } = await context.params
    const input = updateTaskWorkflowSchema.parse(await request.json())
    await updateTaskWorkflow(actor, id, input)
    return privateJson(await getTaskDetail(actor, id))
  } catch (error) {
    return taskErrorResponse(error, 'workflow')
  }
}
