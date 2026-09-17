import type { NextRequest } from 'next/server'
import { getTaskActor, privateJson, requireJsonMutation, taskErrorResponse } from '@/lib/task-api'
import { addTaskMessage, getTaskDetail } from '@/lib/services/tasks'
import { createTaskMessageSchema } from '@/lib/validations/tasks'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    requireJsonMutation(request)
    const actor = await getTaskActor(request)
    const { id } = await context.params
    const input = createTaskMessageSchema.parse(await request.json())
    await addTaskMessage(actor, id, input)
    return privateJson(await getTaskDetail(actor, id))
  } catch (error) {
    return taskErrorResponse(error, 'message')
  }
}
