import { prisma } from '../lib/db'

const PREFIX = 'synthetic-member-pilot-'
const startDate = new Date('2026-01-01T00:00:00.000Z')

const wards = [
  { id: `${PREFIX}ward-a`, code: 'TOETS-A', name: 'Sintetiese Wyk A' },
  { id: `${PREFIX}ward-b`, code: 'TOETS-B', name: 'Sintetiese Wyk B' },
]
const households = [
  { id: `${PREFIX}household-alfa`, name: 'SINTETIES: Alfa-huishouding', wardId: wards[0]!.id },
  { id: `${PREFIX}household-beta`, name: 'SINTETIES: Beta-huishouding', wardId: wards[1]!.id },
]
const members = [
  { id: `${PREFIX}alfa-1`, firstNames: 'Toetslid Een', preferredName: 'Alfa', lastName: 'SINTETIES', householdId: households[0]!.id, isHead: true },
  { id: `${PREFIX}alfa-2`, firstNames: 'Toetslid Twee', preferredName: 'Beta', lastName: 'SINTETIES', householdId: households[0]!.id, isHead: false },
  { id: `${PREFIX}beta-1`, firstNames: 'Toetslid Drie', preferredName: 'Gamma', lastName: 'SINTETIES', householdId: households[1]!.id, isHead: true },
  { id: `${PREFIX}beta-2`, firstNames: 'Toetslid Vier Met ’n Baie Lang Samestelling', preferredName: null, lastName: 'SINTETIES-LANGVAN', householdId: households[1]!.id, isHead: false },
]

async function main() {
  if (process.env['MEMBER_SYNTHETIC_SEED'] !== '1') {
    throw new Error('Stel MEMBER_SYNTHETIC_SEED=1 om die gemerkte sintetiese datastel te skep')
  }
  const [realMembers, realHouseholds, realWards] = await Promise.all([
    prisma.member.count({ where: { id: { not: { startsWith: PREFIX } } } }),
    prisma.household.count({ where: { id: { not: { startsWith: PREFIX } } } }),
    prisma.ward.count({ where: { id: { not: { startsWith: PREFIX } } } }),
  ])
  if (realMembers + realHouseholds + realWards > 0) {
    throw new Error('Saai gestop: die register bevat nie-sintetiese data')
  }

  await prisma.$transaction(async (tx) => {
    for (const ward of wards) {
      await tx.ward.upsert({
        where: { id: ward.id },
        create: { ...ward, activeFrom: startDate },
        update: { code: ward.code, name: ward.name },
      })
    }
    for (const household of households) {
      await tx.household.upsert({
        where: { id: household.id },
        create: { id: household.id, name: household.name },
        update: { name: household.name },
      })
      await tx.householdAddress.upsert({
        where: { id: `${household.id}-address` },
        create: {
          id: `${household.id}-address`, householdId: household.id, line1: '1 Voorbeeldstraat',
          suburb: 'Toetsbuurt', city: 'Pretoria', postalCode: '0001', normalized: '1 voorbeeldstraat toetsbuurt pretoria',
          source: 'SYNTHETIC', startDate,
        },
        update: {},
      })
      await tx.wardAssignment.upsert({
        where: { id: `${household.id}-ward` },
        create: { id: `${household.id}-ward`, householdId: household.id, wardId: household.wardId, startDate },
        update: { wardId: household.wardId },
      })
    }
    for (const [index, member] of members.entries()) {
      await tx.member.upsert({
        where: { id: member.id },
        create: {
          id: member.id, firstNames: member.firstNames, preferredName: member.preferredName,
          lastName: member.lastName, birthDate: new Date(`19${70 + index * 5}-01-01T00:00:00.000Z`),
        },
        update: { firstNames: member.firstNames, preferredName: member.preferredName, lastName: member.lastName },
      })
      await tx.householdMember.upsert({
        where: { id: `${member.id}-household` },
        create: {
          id: `${member.id}-household`, householdId: member.householdId, memberId: member.id,
          role: member.isHead ? 'HEAD' : 'OTHER', isHead: member.isHead, startDate,
        },
        update: {},
      })
      await tx.memberContactPoint.upsert({
        where: { id: `${member.id}-email` },
        create: {
          id: `${member.id}-email`, memberId: member.id, type: 'EMAIL',
          value: `toetslid-${index + 1}@example.invalid`, normalizedValue: `toetslid-${index + 1}@example.invalid`,
          isPreferred: true, startDate,
        },
        update: {},
      })
      await tx.membershipEvent.upsert({
        where: { id: `${member.id}-arrival` },
        create: {
          id: `${member.id}-arrival`, memberId: member.id, type: 'ARRIVAL', effectiveDate: startDate,
          source: 'SYNTHETIC', details: { note: 'Sintetiese proefgebeurtenis' },
        },
        update: {},
      })
    }
    await tx.wardElderAssignment.upsert({
      where: { id: `${PREFIX}elder-beta` },
      create: { id: `${PREFIX}elder-beta`, wardId: wards[1]!.id, memberId: members[0]!.id, startDate },
      update: { wardId: wards[1]!.id, memberId: members[0]!.id },
    })
  }, { isolationLevel: 'Serializable', timeout: 60_000 })

  const [memberCount, householdCount, wardCount] = await Promise.all([
    prisma.member.count({ where: { id: { startsWith: PREFIX } } }),
    prisma.household.count({ where: { id: { startsWith: PREFIX } } }),
    prisma.ward.count({ where: { id: { startsWith: PREFIX } } }),
  ])
  console.log(JSON.stringify({ status: 'ok', synthetic: true, members: memberCount, households: householdCount, wards: wardCount }))
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Sintetiese saai het misluk')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
