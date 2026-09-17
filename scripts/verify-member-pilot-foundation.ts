import { prisma } from '../lib/db'

type NamedRow = { name: string }

const requiredColumns = ['users.disabledAt']
const requiredTables = ['member_capability_grants', 'member_pilot_access']
const requiredConstraints = [
  'member_capability_grants_grantedById_fkey',
  'member_capability_grants_userId_capability_key',
  'member_capability_grants_userId_fkey',
  'member_pilot_access_grantedById_fkey',
  'member_pilot_access_userId_fkey',
  'member_pilot_access_userId_key',
]

async function main() {
  const columns = await prisma.$queryRaw<NamedRow[]>`
    SELECT table_name || '.' || column_name AS name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'disabledAt'
  `
  const tables = await prisma.$queryRaw<NamedRow[]>`
    SELECT table_name AS name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('member_capability_grants', 'member_pilot_access')
  `
  const constraints = await prisma.$queryRaw<NamedRow[]>`
    SELECT constraint_name AS name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name IN ('member_capability_grants', 'member_pilot_access')
  `
  const indexes = await prisma.$queryRaw<NamedRow[]>`
    SELECT indexname AS name
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('member_capability_grants', 'member_pilot_access')
  `
  const enumValues = await prisma.$queryRaw<NamedRow[]>`
    SELECT enumlabel AS name
    FROM pg_enum
    JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
    WHERE pg_type.typname = 'MemberCapability'
  `

  const available = new Set([
    ...columns.map(({ name }) => name),
    ...tables.map(({ name }) => name),
    ...constraints.map(({ name }) => name),
    ...indexes.map(({ name }) => name),
  ])
  const missing = [...requiredColumns, ...requiredTables, ...requiredConstraints]
    .filter((name) => !available.has(name))

  if (enumValues.length !== 8) missing.push('MemberCapability enum values')
  if (missing.length > 0) {
    throw new Error(`Lidmaatproef-skema is onvolledig: ${missing.join(', ')}`)
  }

  console.log(JSON.stringify({
    status: 'ok',
    columns: requiredColumns.length,
    tables: requiredTables.length,
    constraints: requiredConstraints.length,
    capabilities: enumValues.length,
  }))
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Skemaverifikasie het misluk')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
