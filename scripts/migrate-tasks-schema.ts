import { prisma } from '../lib/db'

const phase = process.argv.find((argument) => argument.startsWith('--phase='))?.split('=')[1]

if (phase !== 'prepare' && phase !== 'finalize') {
  throw new Error('Use --phase=prepare or --phase=finalize')
}

async function prepare() {
  const statements = [
    `SELECT pg_advisory_xact_lock(1820917)`,
    `DO $$
    BEGIN
      IF to_regclass('public.tasks') IS NULL AND to_regclass('public.feature_requests') IS NOT NULL THEN
        ALTER TABLE "feature_requests" RENAME TO "tasks";
        ALTER TABLE "feature_request_activities" RENAME TO "task_activities";
        ALTER TABLE "feature_request_attachments" RENAME TO "task_attachments";
        ALTER TABLE "feature_request_read_receipts" RENAME TO "task_read_receipts";
      END IF;
    END $$`,
    `DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'tasks'::regclass AND conname = 'feature_requests_requesterId_fkey') THEN ALTER TABLE "tasks" RENAME CONSTRAINT "feature_requests_requesterId_fkey" TO "tasks_requesterId_fkey"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'tasks'::regclass AND conname = 'feature_requests_assigneeId_fkey') THEN ALTER TABLE "tasks" RENAME CONSTRAINT "feature_requests_assigneeId_fkey" TO "tasks_assigneeId_fkey"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'tasks'::regclass AND conname = 'feature_requests_source_check') THEN ALTER TABLE "tasks" RENAME CONSTRAINT "feature_requests_source_check" TO "tasks_source_check"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'task_activities'::regclass AND conname = 'feature_request_activities_requestId_fkey') THEN ALTER TABLE "task_activities" RENAME CONSTRAINT "feature_request_activities_requestId_fkey" TO "task_activities_requestId_fkey"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'task_activities'::regclass AND conname = 'feature_request_activities_actorId_fkey') THEN ALTER TABLE "task_activities" RENAME CONSTRAINT "feature_request_activities_actorId_fkey" TO "task_activities_actorId_fkey"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'task_attachments'::regclass AND conname = 'feature_request_attachments_requestId_fkey') THEN ALTER TABLE "task_attachments" RENAME CONSTRAINT "feature_request_attachments_requestId_fkey" TO "task_attachments_requestId_fkey"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'task_attachments'::regclass AND conname = 'feature_request_attachments_activityId_fkey') THEN ALTER TABLE "task_attachments" RENAME CONSTRAINT "feature_request_attachments_activityId_fkey" TO "task_attachments_activityId_fkey"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'task_attachments'::regclass AND conname = 'feature_request_attachments_uploaderId_fkey') THEN ALTER TABLE "task_attachments" RENAME CONSTRAINT "feature_request_attachments_uploaderId_fkey" TO "task_attachments_uploaderId_fkey"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'task_read_receipts'::regclass AND conname = 'feature_request_read_receipts_requestId_fkey') THEN ALTER TABLE "task_read_receipts" RENAME CONSTRAINT "feature_request_read_receipts_requestId_fkey" TO "task_read_receipts_requestId_fkey"; END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'task_read_receipts'::regclass AND conname = 'feature_request_read_receipts_userId_fkey') THEN ALTER TABLE "task_read_receipts" RENAME CONSTRAINT "feature_request_read_receipts_userId_fkey" TO "task_read_receipts_userId_fkey"; END IF;
    END $$`,
    `ALTER INDEX IF EXISTS "feature_requests_pkey" RENAME TO "tasks_pkey"`,
    `ALTER INDEX IF EXISTS "feature_requests_requesterId_creationKey_key" RENAME TO "tasks_requesterId_creationKey_key"`,
    `ALTER INDEX IF EXISTS "feature_requests_requesterId_lastActivityAt_id_idx" RENAME TO "tasks_requesterId_lastActivityAt_id_idx"`,
    `ALTER INDEX IF EXISTS "feature_requests_source_lastActivityAt_id_idx" RENAME TO "tasks_source_lastActivityAt_id_idx"`,
    `ALTER INDEX IF EXISTS "feature_requests_status_lastActivityAt_id_idx" RENAME TO "tasks_status_lastActivityAt_id_idx"`,
    `ALTER INDEX IF EXISTS "feature_requests_lastActivityAt_id_idx" RENAME TO "tasks_lastActivityAt_id_idx"`,
    `ALTER INDEX IF EXISTS "feature_request_activities_pkey" RENAME TO "task_activities_pkey"`,
    `ALTER INDEX IF EXISTS "feature_request_activities_requestId_seq_key" RENAME TO "task_activities_requestId_seq_key"`,
    `ALTER INDEX IF EXISTS "feature_request_activities_requestId_actorId_kind_operation_key" RENAME TO "task_activities_requestId_actorId_kind_operationKey_key"`,
    `ALTER INDEX IF EXISTS "feature_request_activities_requestId_seq_idx" RENAME TO "task_activities_requestId_seq_idx"`,
    `ALTER INDEX IF EXISTS "feature_request_attachments_pkey" RENAME TO "task_attachments_pkey"`,
    `ALTER INDEX IF EXISTS "feature_request_attachments_requestId_pathname_key" RENAME TO "task_attachments_requestId_pathname_key"`,
    `ALTER INDEX IF EXISTS "feature_request_attachments_activityId_idx" RENAME TO "task_attachments_activityId_idx"`,
    `ALTER INDEX IF EXISTS "feature_request_attachments_uploaderId_idx" RENAME TO "task_attachments_uploaderId_idx"`,
    `ALTER INDEX IF EXISTS "feature_request_read_receipts_pkey" RENAME TO "task_read_receipts_pkey"`,
    `ALTER INDEX IF EXISTS "feature_request_read_receipts_userId_requestId_idx" RENAME TO "task_read_receipts_userId_requestId_idx"`,
    `CREATE OR REPLACE VIEW "feature_requests" AS SELECT * FROM "tasks"`,
    `CREATE OR REPLACE VIEW "feature_request_activities" AS SELECT * FROM "task_activities"`,
    `CREATE OR REPLACE VIEW "feature_request_attachments" AS SELECT * FROM "task_attachments"`,
    `CREATE OR REPLACE VIEW "feature_request_read_receipts" AS SELECT * FROM "task_read_receipts"`,
  ]
  await prisma.$transaction(statements.map((statement) => prisma.$executeRawUnsafe(statement)))
}

async function finalize() {
  const statements = [
    `SELECT pg_advisory_xact_lock(1820917)`,
    `DROP VIEW IF EXISTS "feature_request_read_receipts"`,
    `DROP VIEW IF EXISTS "feature_request_attachments"`,
    `DROP VIEW IF EXISTS "feature_request_activities"`,
    `DROP VIEW IF EXISTS "feature_requests"`,
    `ALTER TABLE "tasks" DROP COLUMN IF EXISTS "nextAction"`,
    `UPDATE "task_activities" SET body = NULL WHERE kind::text = 'WORKFLOW' AND btrim(COALESCE(body, '')) IN ('.', 'Taakbeplanning is opgedateer.')`,
  ]
  await prisma.$transaction(statements.map((statement) => prisma.$executeRawUnsafe(statement)))
}

async function verify() {
  const [summary] = await prisma.$queryRawUnsafe<Array<{
    tasks: bigint
    activities: bigint
    attachments: bigint
    receipts: bigint
    punctuation_only: bigint
  }>>(`
    SELECT
      (SELECT COUNT(*) FROM "tasks") AS tasks,
      (SELECT COUNT(*) FROM "task_activities") AS activities,
      (SELECT COUNT(*) FROM "task_attachments") AS attachments,
      (SELECT COUNT(*) FROM "task_read_receipts") AS receipts,
      (SELECT COUNT(*) FROM "task_activities" WHERE btrim(COALESCE(body, '')) = '.') AS punctuation_only
  `)
  if (!summary) throw new Error('Task migration verification returned no result')
  console.log(JSON.stringify({
    phase,
    tasks: Number(summary.tasks),
    activities: Number(summary.activities),
    attachments: Number(summary.attachments),
    receipts: Number(summary.receipts),
    punctuationOnly: Number(summary.punctuation_only),
  }))
}

async function main() {
  if (phase === 'prepare') await prepare()
  else await finalize()
  await verify()
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Task migration failed')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
