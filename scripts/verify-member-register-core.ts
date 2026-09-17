import { prisma } from '../lib/db'

type NamedRow = { name: string }

const requiredTables = [
  'household_addresses',
  'household_members',
  'households',
  'member_audit_events',
  'member_contact_points',
  'member_source_records',
  'member_ward_scopes',
  'members',
  'membership_events',
  'task_subjects',
  'ward_assignments',
  'wards',
]

const requiredConstraints = [
  'household_addresses_no_overlap',
  'household_addresses_valid_dates',
  'household_members_no_overlap',
  'household_members_valid_dates',
  'member_contact_points_valid_dates',
  'task_subjects_exactly_one_subject',
  'ward_assignments_exactly_one_subject',
  'ward_assignments_household_no_overlap',
  'ward_assignments_member_no_overlap',
  'ward_assignments_valid_dates',
  'wards_valid_dates',
]

const requiredIndexes = [
  'household_members_current_head_key',
  'task_subjects_task_household_key',
  'task_subjects_task_member_key',
  'task_subjects_task_ward_key',
]

async function main() {
  const [tables, constraints, indexes, triggers, enums] = await Promise.all([
    prisma.$queryRaw<NamedRow[]>`
      SELECT table_name AS name FROM information_schema.tables
      WHERE table_schema = 'public'
    `,
    prisma.$queryRaw<NamedRow[]>`
      SELECT conname AS name FROM pg_constraint
    `,
    prisma.$queryRaw<NamedRow[]>`
      SELECT indexname AS name FROM pg_indexes
      WHERE schemaname = 'public'
    `,
    prisma.$queryRaw<NamedRow[]>`
      SELECT trigger_name AS name FROM information_schema.triggers
      WHERE event_object_schema = 'public' AND trigger_name = 'member_audit_events_append_only'
    `,
    prisma.$queryRaw<NamedRow[]>`
      SELECT typname AS name FROM pg_type
      WHERE typname IN ('MemberAccessScope', 'MemberContactType', 'MemberStatus', 'MembershipEventType', 'HouseholdRole')
    `,
  ])

  const available = new Set([
    ...tables.map(({ name }) => name),
    ...constraints.map(({ name }) => name),
    ...indexes.map(({ name }) => name),
    ...triggers.map(({ name }) => name),
    ...enums.map(({ name }) => name),
  ])
  const expected = [
    ...requiredTables,
    ...requiredConstraints,
    ...requiredIndexes,
    'member_audit_events_append_only',
    'MemberAccessScope',
    'MemberContactType',
    'MemberStatus',
    'MembershipEventType',
    'HouseholdRole',
  ]
  const missing = expected.filter((name) => !available.has(name))
  if (missing.length > 0) throw new Error(`Kernregister-skema is onvolledig: ${missing.join(', ')}`)

  const triggerNames = new Set(triggers.map(({ name }) => name))

  console.log(JSON.stringify({
    status: 'ok',
    tables: tables.length,
    constraints: constraints.length,
    indexes: indexes.length,
    appendOnlyTriggers: triggerNames.size,
    enums: enums.length,
  }))
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Kernregister-verifikasie het misluk')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
