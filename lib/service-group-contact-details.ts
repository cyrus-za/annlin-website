import { ServiceGroupCategory } from '@prisma/client'

type ServiceGroupContactDetails = {
  contactPerson: string
  contactEmail?: string
  contactPhone?: string | null
}

// Public WordPress service-group pages name these people explicitly.
const explicitServiceGroupContactDetails = new Map<string, ServiceGroupContactDetails>([
  [
    'jeugbediening',
    {
      contactPerson: 'Lisa Vosloo, oudl. Thomas Venter, Zoë Venter en Clarissa Rehder',
    },
  ],
  [
    'terebinte',
    {
      contactPerson: 'Ouderling Hannes Venter',
    },
  ],
  [
    'susters',
    {
      contactPerson: 'Magda du Toit',
    },
  ],
  [
    'sekuriteit',
    {
      contactPerson: 'Ouderling Jan Rehder',
    },
  ],
  [
    'gebedsgroepe',
    {
      contactPerson: 'Carina Pyper',
    },
  ],
  [
    'vroue-bedieningsgroep',
    {
      contactPerson: 'Anne-Marie',
    },
  ],
])

export function contactDetailsForServiceGroup(
  slug: string,
  category: ServiceGroupCategory,
  defaultEmail: string
): Required<ServiceGroupContactDetails> {
  const explicitDetails = explicitServiceGroupContactDetails.get(slug)

  return {
    contactPerson:
      explicitDetails?.contactPerson ??
      (category === ServiceGroupCategory.DIAKONIE ? 'Diakonie' : 'Kerkkantoor'),
    contactEmail: explicitDetails?.contactEmail ?? defaultEmail,
    contactPhone: explicitDetails?.contactPhone ?? null,
  }
}
