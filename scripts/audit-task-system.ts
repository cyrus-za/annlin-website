import { prisma } from '../lib/db'

async function main() {
  const [totals] = await prisma.$queryRaw<Array<{
    requests: bigint
    activities: bigint
    receipts: bigint
    attachments: bigint
    sequence_errors: bigint
    receipt_errors: bigint
    attachment_errors: bigint
    source_errors: bigint
    legacy_statuses: bigint
    legacy_types: bigint
    legacy_relations: bigint
  }>>`
    SELECT
      (SELECT COUNT(*) FROM "tasks") AS requests,
      (SELECT COUNT(*) FROM "task_activities") AS activities,
      (SELECT COUNT(*) FROM "task_read_receipts") AS receipts,
      (SELECT COUNT(*) FROM "task_attachments") AS attachments,
      (
        SELECT COUNT(*) FROM "tasks" r
        WHERE r."activitySeq" <> (
          SELECT COALESCE(MAX(a.seq), 0) FROM "task_activities" a WHERE a."requestId" = r.id
        )
      ) AS sequence_errors,
      (
        SELECT COUNT(*) FROM "task_read_receipts" rr
        JOIN "tasks" r ON r.id = rr."requestId"
        WHERE rr."lastReadSeq" > r."activitySeq"
      ) AS receipt_errors,
      (
        SELECT COUNT(*) FROM "task_attachments" a
        WHERE a.size <= 0
          OR a."mimeType" NOT IN ('image/jpeg', 'image/png', 'image/webp')
          OR a.pathname NOT LIKE 'admin-uploads/%'
      ) AS attachment_errors,
      (
        SELECT COUNT(*) FROM "tasks" r
        WHERE r.source NOT IN ('PROPOSAL', 'MANUAL')
      ) AS source_errors,
      (SELECT COUNT(*) FROM "tasks" WHERE status::text = 'NOT_PLANNED') AS legacy_statuses,
      (
        SELECT COUNT(*) FROM pg_type
        WHERE typname IN ('FeatureRequestStatus', 'FeatureRequestPriority', 'FeatureRequestActivityKind')
      ) AS legacy_types,
      (
        SELECT COUNT(*) FROM pg_class
        WHERE relname IN ('feature_requests', 'feature_request_activities', 'feature_request_attachments', 'feature_request_read_receipts')
      ) AS legacy_relations
  `

  if (!totals) throw new Error('Task audit returned no result')
  const summary = {
    requests: Number(totals.requests),
    activities: Number(totals.activities),
    receipts: Number(totals.receipts),
    attachments: Number(totals.attachments),
    sequence_errors: Number(totals.sequence_errors),
    receipt_errors: Number(totals.receipt_errors),
    attachment_errors: Number(totals.attachment_errors),
    source_errors: Number(totals.source_errors),
    legacy_statuses: Number(totals.legacy_statuses),
    legacy_types: Number(totals.legacy_types),
    legacy_relations: Number(totals.legacy_relations),
  }
  console.log(JSON.stringify(summary, null, 2))

  const failures = Object.entries(summary).filter(([key, value]) => (
    key.endsWith('_errors') || key.startsWith('legacy_')
  ) && value !== 0)
  if (failures.length > 0) {
    process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Task audit failed')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
