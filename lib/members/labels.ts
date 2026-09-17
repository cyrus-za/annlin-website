import type {
  HouseholdRole,
  MemberContactType,
  MemberStatus,
  MembershipEventType,
} from '@prisma/client'

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  ACTIVE: 'Aktief',
  INACTIVE: 'Onaktief',
  DEPARTED: 'Vertrek',
  DECEASED: 'Oorlede',
  ARCHIVED: 'Geargiveer',
}

export const CONTACT_TYPE_LABELS: Record<MemberContactType, string> = {
  MOBILE: 'Selfoon',
  PHONE: 'Telefoon',
  EMAIL: 'E-pos',
  WHATSAPP: 'WhatsApp',
  OTHER: 'Ander',
}

export const HOUSEHOLD_ROLE_LABELS: Record<HouseholdRole, string> = {
  HEAD: 'Hoof',
  SPOUSE: 'Eggenoot/eggenote',
  CHILD: 'Kind',
  DEPENDANT: 'Afhanklike',
  OTHER: 'Ander',
}

export const MEMBERSHIP_EVENT_LABELS: Record<MembershipEventType, string> = {
  ARRIVAL: 'Aankoms',
  BAPTISM: 'Doop',
  PROFESSION: 'Belydenis',
  CERTIFICATE_REQUESTED: 'Bewys aangevra',
  CERTIFICATE_RECEIVED: 'Bewys ontvang',
  DEPARTURE: 'Vertrek',
  RETURNED: 'Teruggekeer',
  DEATH: 'Oorlye',
  STATUS_CHANGED: 'Status verander',
  OTHER: 'Ander',
}
