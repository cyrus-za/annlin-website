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
  }>>`
    SELECT
      (SELECT COUNT(*) FROM "feature_requests") AS requests,
      (SELECT COUNT(*) FROM "feature_request_activities") AS activities,
      (SELECT COUNT(*) FROM "feature_request_read_receipts") AS receipts,
      (SELECT COUNT(*) FROM "feature_request_attachments") AS attachments,
      (
        SELECT COUNT(*) FROM "feature_requests" r
        WHERE r."activitySeq" <> (
          SELECT COALESCE(MAX(a.seq), 0) FROM "feature_request_activities" a WHERE a."requestId" = r.id
        )
      ) AS sequence_errors,
      (
        SELECT COUNT(*) FROM "feature_request_read_receipts" rr
        JOIN "feature_requests" r ON r.id = rr."requestId"
        WHERE rr."lastReadSeq" > r."activitySeq"
      ) AS receipt_errors,
      (
        SELECT COUNT(*) FROM "feature_request_attachments" a
        WHERE a.size <= 0
          OR a."mimeType" NOT IN ('image/jpeg', 'image/png', 'image/webp')
          OR a.pathname NOT LIKE 'admin-uploads/%'
      ) AS attachment_errors
  `

  if (!totals) throw new Error('Feature request audit returned no result')
  const summary = {
    requests: Number(totals.requests),
    activities: Number(totals.activities),
    receipts: Number(totals.receipts),
    attachments: Number(totals.attachments),
    sequence_errors: Number(totals.sequence_errors),
    receipt_errors: Number(totals.receipt_errors),
    attachment_errors: Number(totals.attachment_errors),
  }
  console.log(JSON.stringify(summary, null, 2))

  if (summary.sequence_errors !== 0 || summary.receipt_errors !== 0 || summary.attachment_errors !== 0) {
    process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Feature request audit failed')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
