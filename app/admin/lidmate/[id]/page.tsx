import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { UserRole } from '@prisma/client'
import { requireAuth } from '@/lib/auth-config'
import { MemberAuthorizationError } from '@/lib/members/authorization'
import type { MemberDetail, MemberDetailFieldChange } from '@/lib/members/detail-view'
import { getMemberDetail, getMemberManagementOptions } from '@/lib/members/queries'
import {
  CONTACT_TYPE_LABELS,
  HOUSEHOLD_ROLE_LABELS,
  MEMBER_STATUS_LABELS,
  MEMBERSHIP_EVENT_LABELS,
} from '@/lib/members/labels'
import { memberStatusOptions } from '@/lib/members/edit-form'
import { memberDetailHref, registerHref, type RegisterListParams } from '@/lib/members/register-links'
import { listOpenTasksForMember } from '@/lib/services/tasks'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/lib/tasks'
import { cn } from '@/lib/utils'
import { MemberEditPanel } from '@/components/admin/members/MemberEditPanel'
import {
  ContactEditor,
  EventEditor,
  HouseholdEditor,
  WardEditor,
} from '@/components/admin/members/MemberRelatedEditors'

export const dynamic = 'force-dynamic'

const VISIBLE_HISTORY_ITEMS = 8

const AUDIT_ACTION_LABELS: Record<string, string> = {
  CREATE: 'Geskep',
  UPDATE: 'Opgedateer',
  ARCHIVE: 'Geargiveer',
  RESTORE: 'Heraktiveer',
  UNARCHIVE: 'Heraktiveer',
  VIEW_DETAIL: 'Besigtig',
  WARD_UPDATE: 'Wyk verander',
  HOUSEHOLD_UPDATE: 'Huishouding verander',
  CONTACT_ADD: 'Kontakpunt bygevoeg',
  CONTACT_UPDATE: 'Kontakpunt verander',
  CONTACT_END: 'Kontakpunt verwyder',
  EVENT_ADD: 'Gebeurtenis bygevoeg',
  ELDER_ASSIGNMENT_ADD: 'As ouderling toegewys',
  ELDER_ASSIGNMENT_END: 'Ouderlingdienstyd beëindig',
}

const dateFormatter = new Intl.DateTimeFormat('af-ZA', { dateStyle: 'long', timeZone: 'Africa/Johannesburg' })
const dateTimeFormatter = new Intl.DateTimeFormat('af-ZA', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Johannesburg',
})

function displayName(person: { firstNames: string; preferredName: string | null; lastName: string }) {
  return `${person.preferredName || person.firstNames} ${person.lastName}`
}

function DateOnly({ date }: { date: Date }) {
  return <time dateTime={date.toISOString().slice(0, 10)}>{dateFormatter.format(date)}</time>
}

function DateTime({ date }: { date: Date }) {
  return <time dateTime={date.toISOString()}>{dateTimeFormatter.format(date)}</time>
}

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'pilot' | 'accent' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        tone === 'neutral' && 'bg-gray-100 text-gray-700',
        tone === 'pilot' && 'bg-amber-100 uppercase tracking-wide text-amber-900',
        tone === 'accent' && 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200',
      )}
    >
      {children}
    </span>
  )
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 id={`${id}-heading`} className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Notice({ children, tone = 'empty' }: { children: React.ReactNode; tone?: 'empty' | 'unavailable' }) {
  return (
    <p
      className={cn(
        'rounded-lg border border-dashed px-4 py-3 text-base',
        tone === 'empty' && 'border-gray-200 bg-gray-50 text-gray-600',
        tone === 'unavailable' && 'border-amber-200 bg-amber-50 text-amber-900',
      )}
    >
      {children}
    </p>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-base text-gray-900">{children}</dd>
    </div>
  )
}

/** Shows the first items directly and folds the remainder behind a native disclosure. */
function LongList<T>({
  items,
  label,
  renderItem,
  getKey,
}: {
  items: T[]
  label: string
  renderItem: (item: T) => React.ReactNode
  getKey: (item: T) => string
}) {
  const visible = items.slice(0, VISIBLE_HISTORY_ITEMS)
  const folded = items.slice(VISIBLE_HISTORY_ITEMS)
  return (
    <>
      <ol className="divide-y divide-gray-100">
        {visible.map((item) => <li key={getKey(item)} className="py-3 first:pt-0">{renderItem(item)}</li>)}
      </ol>
      {folded.length > 0 && (
        <details className="mt-2 border-t border-gray-100 pt-3">
          <summary className="cursor-pointer rounded-md text-sm font-semibold text-amber-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Wys nog {folded.length} {label}
          </summary>
          <ol className="mt-2 divide-y divide-gray-100">
            {folded.map((item) => <li key={getKey(item)} className="py-3">{renderItem(item)}</li>)}
          </ol>
        </details>
      )}
    </>
  )
}

function CoreDetailsSection({ member }: { member: MemberDetail }) {
  const readView = (
    <dl className="grid gap-4 sm:grid-cols-2">
      <Field label="Voorname">{member.firstNames}</Field>
      <Field label="Noemnaam">{member.preferredName || <span className="text-gray-500">Geen</span>}</Field>
      <Field label="Van">{member.lastName}</Field>
      <Field label="Geboortedatum">{member.birthDate ? <DateOnly date={member.birthDate} /> : <span className="text-gray-500">Geen</span>}</Field>
      <Field label="Status">{MEMBER_STATUS_LABELS[member.status]}</Field>
    </dl>
  )

  return (
    <Section
      id="kern"
      title="Kernbesonderhede"
      description={member.canEdit ? 'Wysigings word eers gestoor wanneer jy dit uitdruklik bevestig en word in die rekordgeskiedenis aangeteken.' : undefined}
    >
      {member.canEdit ? (
        <MemberEditPanel
          memberId={member.id}
          version={member.version}
          values={{
            firstNames: member.firstNames,
            preferredName: member.preferredName ?? '',
            lastName: member.lastName,
            birthDate: member.birthDate?.toISOString().slice(0, 10) ?? '',
            status: member.status,
          }}
          statusOptions={memberStatusOptions(member.status)}
          readView={readView}
        />
      ) : (
        readView
      )}
    </Section>
  )
}

type ManagementOptions = NonNullable<Awaited<ReturnType<typeof getMemberManagementOptions>>>

function HouseholdSection({ member, listParams, options }: { member: MemberDetail; listParams: RegisterListParams; options: ManagementOptions | null }) {
  const household = member.household
  if (!household) {
    return (
      <Section id="huishouding" title="Huishouding">
        <Notice>Geen huidige huishouding nie. Hierdie lidmaat is nie tans aan ’n huishouding of besoekpunt gekoppel nie.</Notice>
        {options && <HouseholdEditor memberId={member.id} version={member.version} currentHouseholdId={null} currentRole="OTHER" currentIsHead={false} households={options.households} canCreateHousehold={options.canCreateHousehold} />}
      </Section>
    )
  }

  const others = household.members.filter((person) => person.id !== member.id)
  return (
    <Section id="huishouding" title="Huishouding" description="Huidige huishouding en die lede wat tans daaraan gekoppel is.">
      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label="Huishouding">
          <span className="font-semibold">{household.name}</span>
          {household.archivedAt && <span className="ml-2 align-middle"><Pill>Geargiveer</Pill></span>}
        </Field>
        <Field label="Lid sedert"><DateOnly date={household.since} /></Field>
        <Field label="Rol in huishouding">
          {HOUSEHOLD_ROLE_LABELS[household.role]}
          {household.isHead && <span className="ml-2 align-middle"><Pill tone="accent">Hooflid</Pill></span>}
        </Field>
      </dl>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500">Ander huidige lede</h3>
      {others.length === 0 ? (
        <div className="mt-2"><Notice>Geen ander huidige lede in hierdie huishouding nie.</Notice></div>
      ) : (
        <ul className="mt-2 divide-y divide-gray-100">
          {others.map((person) => (
            <li key={person.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  href={memberDetailHref(person.id, listParams)}
                  prefetch={false}
                  className="break-words text-base font-semibold text-amber-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {displayName(person)}
                </Link>
                <p className="text-sm text-gray-600">
                  {HOUSEHOLD_ROLE_LABELS[person.role]}
                  {person.isHead && ' · Hooflid'}
                </p>
              </div>
              <Pill>{MEMBER_STATUS_LABELS[person.status]}</Pill>
            </li>
          ))}
        </ul>
      )}
      {member.scopeKind === 'WARDS' && (
        <p className="mt-3 text-sm text-gray-600">Slegs lede binne jou toegelate wyke word hier gewys.</p>
      )}
      {options && <HouseholdEditor memberId={member.id} version={member.version} currentHouseholdId={household.id} currentRole={household.role} currentIsHead={household.isHead} households={options.households} canCreateHousehold={options.canCreateHousehold} />}
    </Section>
  )
}

function WardService({ member }: { member: MemberDetail }) {
  return member.elderOf ? (
    <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-base text-blue-950">
      <span className="block text-xs font-semibold uppercase tracking-wide text-blue-700">Ouderling van</span>
      <span className="font-semibold">{member.elderOf.code}: {member.elderOf.name}</span>
      <span className="ml-2 text-sm text-blue-800">sedert <DateOnly date={member.elderOf.since} /></span>
      <p className="mt-1 text-sm text-blue-800">Hierdie dienstoewysing is apart van die wyk waaraan die lidmaat behoort.</p>
    </div>
  ) : null
}

function WardSection({ member, options }: { member: MemberDetail; options: ManagementOptions | null }) {
  const ward = member.ward
  if (!ward) {
    return (
      <Section id="wyk" title="Wyk">
        <Notice>Geen huidige wyk nie. Daar is nie ’n individuele wyktoewysing of ’n huishoudingswyk nie.</Notice>
        <WardService member={member} />
        {options && <WardEditor memberId={member.id} version={member.version} currentWardId={null} wards={options.wards} wardRequired={options.wardRequired} />}
      </Section>
    )
  }

  return (
    <Section id="wyk" title="Wyk" description="Die effektiewe wyk: ’n individuele toewysing kry voorkeur bo die huishouding se wyk.">
      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label="Effektiewe wyk">
          <span className="font-semibold">{ward.code}</span>
          <span className="text-gray-700">: {ward.name}</span>
        </Field>
        <Field label="Afgelei van">
          {ward.source === 'INDIVIDUAL' ? 'Individuele toewysing' : `Huishouding${member.household ? ` (${member.household.name})` : ''}`}
          <span className="block text-sm text-gray-600">sedert <DateOnly date={ward.since} /></span>
        </Field>
      </dl>
      {ward.overriddenHouseholdWard && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-base text-amber-900 ring-1 ring-inset ring-amber-200">
          Hierdie individuele toewysing oorheers die huishouding se wyk ({ward.overriddenHouseholdWard.code}: {ward.overriddenHouseholdWard.name}).
        </p>
      )}
      <WardService member={member} />
      {options && <WardEditor memberId={member.id} version={member.version} currentWardId={ward.source === 'INDIVIDUAL' ? ward.id : null} wards={options.wards} wardRequired={options.wardRequired} />}
    </Section>
  )
}

function ContactsSection({ member, options }: { member: MemberDetail; options: ManagementOptions | null }) {
  return (
    <Section id="kontak" title="Kontakpunte" description="Slegs huidige kontakpunte word gewys.">
      {member.contacts.length === 0 ? (
        <Notice>Geen huidige kontakpunte aangeteken nie.</Notice>
      ) : (
        <ul className="divide-y divide-gray-100">
          {member.contacts.map((contact) => (
            <li key={contact.id} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">{CONTACT_TYPE_LABELS[contact.type]}</span>
              <div className="min-w-0">
                <p className="break-all text-base text-gray-900">{contact.value}</p>
                {(contact.isPreferred || contact.verifiedAt) && (
                  <p className="mt-1 flex flex-wrap gap-2">
                    {contact.isPreferred && <Pill tone="accent">Voorkeur</Pill>}
                    {contact.verifiedAt && <Pill>Geverifieer</Pill>}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {options && <ContactEditor memberId={member.id} version={member.version} contacts={member.contacts.map(({ id, type, value, isPreferred, verifiedAt }) => ({ id, type, value, isPreferred, isVerified: Boolean(verifiedAt) }))} />}
    </Section>
  )
}

type LinkedTasks = Awaited<ReturnType<typeof listOpenTasksForMember>> | null

function TasksSection({ tasks }: { tasks: LinkedTasks }) {
  return (
    <Section id="take" title="Oop take" description="Take wat aan hierdie lidmaat gekoppel is en nog nie afgehandel is nie.">
      {tasks === null ? (
        <Notice tone="unavailable">Gekoppelde take kon nie nou gelaai word nie. Die res van die rekord is steeds beskikbaar.</Notice>
      ) : !tasks.available ? (
        <Notice tone="unavailable">Gekoppelde take val buite jou huidige toegang en word nie hier gewys nie.</Notice>
      ) : tasks.requests.length === 0 ? (
        <Notice>Geen oop take is aan hierdie lidmaat gekoppel nie.</Notice>
      ) : (
        <>
          <ul className="divide-y divide-gray-100">
            {tasks.requests.map((task) => (
              <li key={task.id} className="py-3 first:pt-0">
                <Link
                  href={`/admin/take?taak=${encodeURIComponent(task.id)}`}
                  className="break-words text-base font-semibold text-amber-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {task.title}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <Pill>{TASK_STATUS_LABELS[task.status]}</Pill>
                  <span>Prioriteit: {TASK_PRIORITY_LABELS[task.priority]}</span>
                  <span>· {task.assignee ? `Verantwoordelik: ${task.assignee.name}` : 'Nog nie toegewys nie'}</span>
                  <span>· Laaste aktiwiteit <DateTime date={new Date(task.lastActivityAt)} /></span>
                </p>
              </li>
            ))}
          </ul>
          {tasks.hasMore && (
            <p className="mt-3 text-sm text-gray-600">
              Net die jongste {tasks.requests.length} take word hier gewys.{' '}
              <Link href="/admin/take" className="font-semibold text-amber-800 hover:underline">Gaan na die takebord</Link>
            </p>
          )}
        </>
      )}
    </Section>
  )
}

function EventsSection({ member, options }: { member: MemberDetail; options: ManagementOptions | null }) {
  return (
    <Section id="gebeure" title="Lidmaatskapgebeure" description="Kerklike lewensiklusgebeure, nuutste eerste.">
      {member.events.length === 0 ? (
        <Notice>Geen lidmaatskapgebeure is nog vir hierdie rekord aangeteken nie.</Notice>
      ) : (
        <LongList
          items={member.events}
          label="gebeure"
          getKey={(event) => event.id}
          renderItem={(event) => (
            <div className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
              <span className="text-sm text-gray-600"><DateOnly date={event.effectiveDate} /></span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-gray-900">{MEMBERSHIP_EVENT_LABELS[event.type]}</p>
                {event.statusChange && (
                  <p className="text-sm text-gray-700">
                    Status: {MEMBER_STATUS_LABELS[event.statusChange.before]} → {MEMBER_STATUS_LABELS[event.statusChange.after]}
                  </p>
                )}
                {event.note && <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{event.note}</p>}
              </div>
            </div>
          )}
        />
      )}
      {options && <EventEditor memberId={member.id} version={member.version} />}
    </Section>
  )
}

function formatHistoryValue(field: MemberDetailFieldChange, value: string | null) {
  if (value === null) return null
  if (field.isStatus && value in MEMBER_STATUS_LABELS) return MEMBER_STATUS_LABELS[value as keyof typeof MEMBER_STATUS_LABELS]
  return value
}

function HistorySection({ member }: { member: MemberDetail }) {
  return (
    <Section id="geskiedenis" title="Rekordgeskiedenis" description="Wie hierdie rekord verander het en watter velde geraak is.">
      {!member.historyAvailable ? (
        <Notice tone="unavailable">Rekordgeskiedenis val buite jou huidige toegang en word nie hier gewys nie.</Notice>
      ) : member.history.length === 0 ? (
        <Notice>Geen veranderinge aan hierdie rekord is nog aangeteken nie.</Notice>
      ) : (
        <LongList
          items={member.history}
          label="inskrywings"
          getKey={(entry) => entry.id}
          renderItem={(entry) => (
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-x-2 text-base text-gray-900">
                <span className="font-semibold">{AUDIT_ACTION_LABELS[entry.action] ?? entry.action}</span>
                <span className="text-sm text-gray-600">deur {entry.actorName}</span>
                <span className="text-sm text-gray-600"><DateTime date={entry.createdAt} /></span>
              </p>
              {entry.fields.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                  {entry.fields.map((field) => {
                    const before = formatHistoryValue(field, field.before)
                    const after = formatHistoryValue(field, field.after)
                    return (
                      <li key={field.key} className="break-words">
                        <span className="font-medium">{field.label}:</span>{' '}
                        {before === null && after === null
                          ? 'gewysig'
                          : <>{before ?? '—'} → {after ?? '—'}</>}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        />
      )}
    </Section>
  )
}

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ soek?: string; bladsy?: string }>
}) {
  const { user } = await requireAuth()
  const [{ id }, listParams] = await Promise.all([params, searchParams])

  let member: MemberDetail | null
  try {
    member = await getMemberDetail(user.id, id)
  } catch (error) {
    if (error instanceof MemberAuthorizationError) notFound()
    throw error
  }
  // Unknown and out-of-scope IDs share the same not-found response.
  if (!member) notFound()

  let tasks: LinkedTasks = null
  let managementOptions: ManagementOptions | null = null
  try {
    tasks = await listOpenTasksForMember({ id: user.id, role: user.role as UserRole }, member.id)
  } catch (error) {
    console.error('Gekoppelde take kon nie vir die lidmaatdetail gelaai word nie:', error instanceof Error ? error.name : 'onbekende fout')
  }
  if (member.canEdit) {
    try {
      managementOptions = await getMemberManagementOptions(user.id, member.id)
    } catch (error) {
      if (!(error instanceof MemberAuthorizationError)) throw error
    }
  }

  const backHref = registerHref(listParams, member.id)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center gap-2 rounded-md text-base font-semibold text-amber-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Terug na register
      </Link>

      <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="pilot">Proeflopie</Pill>
          <Pill>{MEMBER_STATUS_LABELS[member.status]}</Pill>
          {member.archivedAt && <span className="text-sm text-gray-600">Geargiveer op <DateOnly date={member.archivedAt} /></span>}
        </div>
        <h1 className="mt-3 break-words text-3xl font-bold text-gray-900">{displayName(member)}</h1>
        {member.preferredName && (
          <p className="mt-1 break-words text-base text-gray-700">Volle name: {member.firstNames} {member.lastName}</p>
        )}
        <p className="mt-3 text-base text-gray-600">
          {member.canEdit ? 'Sintetiese proefdata. ' : 'Leesalleen-aansig van sintetiese proefdata. '}
          Winkerk bly die amptelike register.
        </p>
        <p className="mt-1 text-sm text-gray-600">Rekord laas gewysig <DateTime date={member.updatedAt} /></p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="min-w-0 space-y-6">
          <CoreDetailsSection member={member} />
          <HouseholdSection member={member} listParams={listParams} options={managementOptions} />
          <WardSection member={member} options={managementOptions} />
          <ContactsSection member={member} options={managementOptions} />
        </div>
        <div className="min-w-0 space-y-6">
          <TasksSection tasks={tasks} />
          <EventsSection member={member} options={managementOptions} />
          <HistorySection member={member} />
        </div>
      </div>
    </div>
  )
}
