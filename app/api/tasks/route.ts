import type { NextRequest } from 'next/server'
import { getTaskActor, privateJson, requireJsonMutation, taskErrorResponse } from '@/lib/task-api'
import { createTask, getTaskDetail, getTaskUnreadCount, listTasks } from '@/lib/services/tasks'
import { createTaskSchema, taskListQuerySchema } from '@/lib/validations/tasks'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const actor = await getTaskActor(request)
    const query = taskListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams))
    const [page, unreadCount] = await Promise.all([
      listTasks(actor, query),
      getTaskUnreadCount(actor, query.source),
    ])
    return privateJson({ ...page, unreadCount, canManage: actor.role === 'ADMIN' })
  } catch (error) {
    return taskErrorResponse(error, 'list')
  }
}

export async function POST(request: NextRequest) {
  try {
    requireJsonMutation(request)
    const actor = await getTaskActor(request)
    const input = createTaskSchema.parse(await request.json())
    const created = await createTask(actor, input)
    return privateJson(await getTaskDetail(actor, created.id), { status: 201 })
  } catch (error) {
    return taskErrorResponse(error, 'create')
  }
}
