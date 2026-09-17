import { randomUUID } from 'node:crypto'
import { prisma } from '../lib/db'
import {
  FeatureRequestError,
  addFeatureRequestMessage,
  createFeatureRequest,
  getFeatureRequestDetail,
  getFeatureRequestUnreadCount,
  listFeatureRequests,
  markFeatureRequestRead,
  updateFeatureRequestWorkflow,
} from '../lib/services/feature-requests'

if (process.env['FEATURE_REQUEST_TEST_DATABASE'] !== '1') {
  throw new Error('Set FEATURE_REQUEST_TEST_DATABASE=1 only for an isolated test database')
}

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}

async function expectCode(action: () => Promise<unknown>, code: FeatureRequestError['code']) {
  try {
    await action()
  } catch (error) {
    assert(error instanceof FeatureRequestError && error.code === code, `Expected ${code}`)
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
    const adminOneBaseline = await getFeatureRequestUnreadCount(adminOne, 'PROPOSAL')
    const adminTwoBaseline = await getFeatureRequestUnreadCount(adminTwo, 'PROPOSAL')
    const creationKey = randomUUID()
    const input = { title: 'Test proposal', description: 'Test body', pagePath: '/test', operationKey: creationKey }
    const created = await createFeatureRequest(requester, input)
    const replay = await createFeatureRequest(requester, input)
    assert(replay.id === created.id, 'Creation replay created a duplicate')
    await expectCode(() => createFeatureRequest(requester, { ...input, title: 'Changed' }), 'CONFLICT')
    await expectCode(() => createFeatureRequest(requester, { ...input, operationKey: randomUUID(), source: 'MANUAL' }), 'FORBIDDEN')
    await expectCode(() => getFeatureRequestDetail(outsider, created.id), 'NOT_FOUND')
    assert((await getFeatureRequestDetail(requester, created.id)).source === 'PROPOSAL', 'Default source must be PROPOSAL')

    const manual = await createFeatureRequest(adminOne, {
      title: 'Manual task', description: 'Created from the task board', pagePath: '/admin/take', source: 'MANUAL', operationKey: randomUUID(),
    })
    const manualPage = await listFeatureRequests(adminOne, { scope: 'all', source: 'MANUAL', limit: 20 })
    assert(manualPage.requests.some((request) => request.id === manual.id), 'Manual source filter omitted the task')

    assert(await getFeatureRequestUnreadCount(requester) === 0, 'Own creation must not be unread')
    assert(await getFeatureRequestUnreadCount(adminOne, 'PROPOSAL') === adminOneBaseline + 1, 'First admin must see new request as unread')
    assert(await getFeatureRequestUnreadCount(adminTwo, 'PROPOSAL') === adminTwoBaseline + 1, 'Second admin must independently see new request as unread')

    const messageKey = randomUUID()
    await Promise.all([
      addFeatureRequestMessage(adminOne, created.id, { body: 'Admin reply', operationKey: messageKey }),
      addFeatureRequestMessage(adminOne, created.id, { body: 'Admin reply', operationKey: messageKey }),
    ])
    const messages = await prisma.featureRequestActivity.count({ where: { requestId: created.id, kind: 'MESSAGE' } })
    assert(messages === 1, 'Concurrent message replay created a duplicate')
    assert(await getFeatureRequestUnreadCount(adminOne, 'PROPOSAL') === adminOneBaseline + 1, 'Own reply must not hide an earlier unread activity')

    await markFeatureRequestRead(adminOne, created.id, 2)
    assert(await getFeatureRequestUnreadCount(adminOne, 'PROPOSAL') === adminOneBaseline, 'Reading must clear only the current admin receipt')
    assert(await getFeatureRequestUnreadCount(adminTwo, 'PROPOSAL') === adminTwoBaseline + 1, 'Reading by one admin must not clear another admin receipt')
    assert(await getFeatureRequestUnreadCount(requester) === 1, 'Requester must see the admin reply as unread')

    await updateFeatureRequestWorkflow(adminOne, created.id, {
      status: 'PLANNED',
      priority: 'HIGH',
      assigneeId: adminOne.id,
      nextAction: 'Test next action',
      note: 'Planning test',
      workflowVersion: 1,
      operationKey: randomUUID(),
    })
    assert(await getFeatureRequestUnreadCount(adminOne, 'PROPOSAL') === adminOneBaseline, 'Own workflow update must not become unread')
    await markFeatureRequestRead(requester, created.id, 2)
    assert(await getFeatureRequestUnreadCount(requester) === 1, 'Late receipt must not clear later activity')
    await expectCode(() => updateFeatureRequestWorkflow(adminTwo, created.id, {
      status: 'DONE', note: 'Stale update', workflowVersion: 1, operationKey: randomUUID(),
    }), 'CONFLICT')

    const adminPage = await listFeatureRequests(adminTwo, { scope: 'all', limit: 20 })
    assert(adminPage.requests.some((request) => request.id === created.id), 'Admin list omitted the request')
    const requesterPage = await listFeatureRequests(requester, { scope: 'mine', limit: 20 })
    assert(requesterPage.requests.length === 1 && requesterPage.requests[0]?.id === created.id, 'Requester list isolation failed')

    console.log(JSON.stringify({ passed: true, checks: 18 }))
  } finally {
    await prisma.featureRequest.deleteMany({ where: { requesterId: { in: users.map((user) => user.id) } } })
    await prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } })
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Feature request integration test failed')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
