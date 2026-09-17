import type { NextRequest } from 'next/server'
import { getTaskActor, privateJson, requireJsonMutation, taskErrorResponse } from '@/lib/task-api'
import { markTaskRead } from '@/lib/services/tasks'
import { markTaskReadSchema } from '@/lib/validations/tasks'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    requireJsonMutation(request)
    const actor = await getTaskActor(request)
    const { id } = await context.params
    const input = markTaskReadSchema.parse(await request.json())
    await markTaskRead(actor, id, input.throughSeq)
    return privateJson({ success: true })
  } catch (error) {
    return taskErrorResponse(error, 'read')
  }
}
