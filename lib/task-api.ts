import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { auth } from '@/lib/auth'
import { TaskError, type TaskActor } from '@/lib/services/tasks'
import type { UserRole } from '@prisma/client'

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Pragma: 'no-cache',
}

export function privateJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  for (const [name, value] of Object.entries(PRIVATE_HEADERS)) response.headers.set(name, value)
  return response
}

export async function getTaskActor(request: NextRequest): Promise<TaskActor> {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) throw new TaskError('UNAUTHORIZED', 'Meld asseblief aan')
  return { id: session.user.id, role: session.user.role as UserRole }
}

export function requireJsonMutation(request: NextRequest) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new TaskError('INVALID', 'Gebruik asseblief JSON')
  }
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) {
    throw new TaskError('FORBIDDEN', 'Ongeldige versoek-oorsprong')
  }
}

export function taskErrorResponse(error: unknown, operation: string) {
  if (error instanceof ZodError) {
    return privateJson({ error: error.issues[0]?.message ?? 'Ongeldige besonderhede' }, { status: 400 })
  }
  if (error instanceof TaskError) {
    const status = error.code === 'UNAUTHORIZED' ? 401 : error.code === 'NOT_FOUND' ? 404 : error.code === 'FORBIDDEN' ? 403 : error.code === 'CONFLICT' ? 409 : 400
    return privateJson({ error: error.message }, { status })
  }
  console.error(`Task API failed: ${operation}`)
  return privateJson({ error: 'Die versoek kon nie voltooi word nie' }, { status: 500 })
}
