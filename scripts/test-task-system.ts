import { randomUUID } from 'node:crypto'
import { prisma } from '../lib/db'
import {
  TaskError,
  addTaskMessage,
  createTask,
  getTaskDetail,
  getTaskUnreadCount,
  listTasks,
  markTaskRead,
  updateTaskWorkflow,
} from '../lib/services/tasks'

if (process.env['TASK_TEST_DATABASE'] !== '1') {
  throw new Error('Set TASK_TEST_DATABASE=1 only for an isolated test database')
}

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}

async function expectCode(action: () => Promise<unknown>, code: TaskError['code']) {
  try {
    await action()
  } catch (error) {
    assert(error instanceof TaskError && error.code === code, `Expected ${code}`)
    return
  }
  throw new Error(`Expected ${code}, but operation succeeded`)
}

async function main() {
  const marker = randomUUID()
  const users = await Promise.all([
    prisma.user.create({ data: { email: `requester-${marker}@example.invalid`, name: 'Test Requester', role: 'EDITOR' } }),
    prisma.user.create({ data: { email: `admin-one-${marker}@example.invalid`, name: 'Test Admin One', role: 'ADMIN' } }),
    prisma.user.create({ data: { email: `admin-two-${marker}@example.invalid`, name: 'Test Admin Two', role: 'ADMIN' } }),
    prisma.user.create({ data: { email: `outsider-${marker}@example.invalid`, name: 'Test Outsider', role: 'EDITOR' } }),
  ])
  const requester = { id: users[0].id, role: users[0].role }
  const adminOne = { id: users[1].id, role: users[1].role }
  const adminTwo = { id: users[2].id, role: users[2].role }
  const outsider = { id: users[3].id, role: users[3].role }

  try {
    const adminOneBaseline = await getTaskUnreadCount(adminOne, 'PROPOSAL')
    const adminTwoBaseline = await getTaskUnreadCount(adminTwo, 'PROPOSAL')
    const creationKey = randomUUID()
    const input = { title: 'Test proposal', description: 'Test body', pagePath: '/test', operationKey: creationKey }
    const created = await createTask(requester, input)
    const replay = await createTask(requester, input)
    assert(replay.id === created.id, 'Creation replay created a duplicate')
    await expectCode(() => createTask(requester, { ...input, title: 'Changed' }), 'CONFLICT')
    await expectCode(() => createTask(requester, { ...input, operationKey: randomUUID(), source: 'MANUAL' }), 'FORBIDDEN')
    await expectCode(() => getTaskDetail(outsider, created.id), 'NOT_FOUND')
    assert((await getTaskDetail(requester, created.id)).source === 'PROPOSAL', 'Default source must be PROPOSAL')

    const manual = await createTask(adminOne, {
      title: 'Manual task', description: 'Created from the task board', pagePath: '/admin/take', source: 'MANUAL', operationKey: randomUUID(),
    })
    const manualPage = await listTasks(adminOne, { scope: 'all', source: 'MANUAL', limit: 20 })
    assert(manualPage.requests.some((request) => request.id === manual.id), 'Manual source filter omitted the task')

    assert(await getTaskUnreadCount(requester) === 0, 'Own creation must not be unread')
    assert(await getTaskUnreadCount(adminOne, 'PROPOSAL') === adminOneBaseline + 1, 'First admin must see new task as unread')
    assert(await getTaskUnreadCount(adminTwo, 'PROPOSAL') === adminTwoBaseline + 1, 'Second admin must independently see new task as unread')

    const messageKey = randomUUID()
    await Promise.all([
      addTaskMessage(adminOne, created.id, { body: 'Admin reply', operationKey: messageKey }),
      addTaskMessage(adminOne, created.id, { body: 'Admin reply', operationKey: messageKey }),
    ])
    const messages = await prisma.taskActivity.count({ where: { requestId: created.id, kind: 'MESSAGE' } })
    assert(messages === 1, 'Concurrent message replay created a duplicate')
    assert(await getTaskUnreadCount(adminOne, 'PROPOSAL') === adminOneBaseline + 1, 'Own reply must not hide an earlier unread activity')

    await markTaskRead(adminOne, created.id, 2)
    assert(await getTaskUnreadCount(adminOne, 'PROPOSAL') === adminOneBaseline, 'Reading must clear only the current admin receipt')
    assert(await getTaskUnreadCount(adminTwo, 'PROPOSAL') === adminTwoBaseline + 1, 'Reading by one admin must not clear another admin receipt')
    assert(await getTaskUnreadCount(requester) === 1, 'Requester must see the admin reply as unread')

    await updateTaskWorkflow(adminOne, created.id, {
      status: 'PLANNED',
      priority: 'HIGH',
      assigneeId: adminOne.id,
      workflowVersion: 1,
      operationKey: randomUUID(),
    })
    assert(await getTaskUnreadCount(adminOne, 'PROPOSAL') === adminOneBaseline, 'Own workflow update must not become unread')
    await markTaskRead(requester, created.id, 2)
    assert(await getTaskUnreadCount(requester) === 1, 'Late receipt must not clear later activity')
    await expectCode(() => updateTaskWorkflow(adminTwo, created.id, {
      status: 'DONE', workflowVersion: 1, operationKey: randomUUID(),
    }), 'CONFLICT')

    const adminPage = await listTasks(adminTwo, { scope: 'all', limit: 20 })
    assert(adminPage.requests.some((request) => request.id === created.id), 'Admin list omitted the request')
    const requesterPage = await listTasks(requester, { scope: 'mine', limit: 20 })
    assert(requesterPage.requests.length === 1 && requesterPage.requests[0]?.id === created.id, 'Requester list isolation failed')

    console.log(JSON.stringify({ passed: true, checks: 18 }))
  } finally {
    await prisma.task.deleteMany({ where: { requesterId: { in: users.map((user) => user.id) } } })
    await prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } })
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Task integration test failed')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
