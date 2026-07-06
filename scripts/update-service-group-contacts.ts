#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'
import { contactDetailsForServiceGroup } from '../lib/service-group-contact-details'

const DEFAULT_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'admin@localhost.local'

async function main() {
  const serviceGroups = await prisma.serviceGroup.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      contactPerson: true,
      contactEmail: true,
      contactPhone: true,
    },
    orderBy: { displayOrder: 'asc' },
  })

  for (const serviceGroup of serviceGroups) {
    const contactDetails = contactDetailsForServiceGroup(
      serviceGroup.slug,
      serviceGroup.category,
      DEFAULT_CONTACT_EMAIL
    )

    await prisma.serviceGroup.update({
      where: { id: serviceGroup.id },
      data: contactDetails,
    })

    console.log(
      `${serviceGroup.name}: ${serviceGroup.contactPerson} -> ${contactDetails.contactPerson}`
    )
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
