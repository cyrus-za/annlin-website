import { prisma } from '../lib/db'

const PREFIX = 'synthetic-member-pilot-'

async function main() {
  if (process.env['MEMBER_SYNTHETIC_CLEAR'] !== '1') {
    throw new Error('Stel MEMBER_SYNTHETIC_CLEAR=1 om slegs die gemerkte sintetiese datastel te verwyder')
  }

  const [realMembers, realHouseholds, realWards, taskLinks, accessScopes] = await Promise.all([
    prisma.member.count({ where: { id: { not: { startsWith: PREFIX } } } }),
    prisma.household.count({ where: { id: { not: { startsWith: PREFIX } } } }),
    prisma.ward.count({ where: { id: { not: { startsWith: PREFIX } } } }),
    prisma.taskSubject.count({
      where: {
        OR: [
          { memberId: { startsWith: PREFIX } },
          { householdId: { startsWith: PREFIX } },
          { wardId: { startsWith: PREFIX } },
        ],
      },
    }),
    prisma.memberWardScope.count({ where: { wardId: { startsWith: PREFIX } } }),
  ])

  if (realMembers + realHouseholds + realWards > 0) {
    throw new Error('Opruiming gestop: die register bevat nie-sintetiese data')
  }
  if (taskLinks > 0 || accessScopes > 0) {
    throw new Error('Opruiming gestop: sintetiese rekords is aan take of gebruikerstoegang gekoppel')
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const members = { id: { startsWith: PREFIX } }
    const households = { id: { startsWith: PREFIX } }
    const wards = { id: { startsWith: PREFIX } }

    await tx.memberSourceRecord.deleteMany({ where: { memberId: members.id } })
    await tx.wardElderAssignment.deleteMany({ where: { OR: [{ memberId: members.id }, { wardId: wards.id }] } })
    await tx.membershipEvent.deleteMany({ where: { memberId: members.id } })
    await tx.memberContactPoint.deleteMany({ where: { memberId: members.id } })
    await tx.wardAssignment.deleteMany({
      where: {
        OR: [
          { memberId: members.id },
          { householdId: households.id },
          { wardId: wards.id },
        ],
      },
    })
    await tx.householdMember.deleteMany({
      where: { OR: [{ memberId: members.id }, { householdId: households.id }] },
    })
    await tx.householdAddress.deleteMany({ where: { householdId: households.id } })

    const memberResult = await tx.member.deleteMany({ where: members })
    const householdResult = await tx.household.deleteMany({ where: households })
    const wardResult = await tx.ward.deleteMany({ where: wards })
    return {
      members: memberResult.count,
      households: householdResult.count,
      wards: wardResult.count,
    }
  }, { isolationLevel: 'Serializable', timeout: 60_000 })

  const retainedAuditEvents = await prisma.memberAuditEvent.count({
    where: { entityId: { startsWith: PREFIX } },
  })
  console.log(JSON.stringify({ status: 'ok', synthetic: true, deleted, retainedAuditEvents }))
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Sintetiese opruiming het misluk')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
