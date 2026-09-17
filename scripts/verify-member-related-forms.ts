import { parseContactForm, parseEventForm, parseHouseholdForm, parseWardForm } from '../lib/members/related-form'

const failures: string[] = []
let total = 0
function check(name: string, condition: boolean) { total += 1; if (!condition) failures.push(name) }
function form(fields: Record<string, string | undefined>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) if (value !== undefined) data.set(key, value)
  return data
}
const base = { memberId: 'synthetic-member-pilot-alfa-1', version: '2' }

const ward = parseWardForm(form({ ...base, wardId: 'synthetic-member-pilot-ward-a', startDate: '2026-09-17' }))
check('ward parses', ward.ok && ward.value.wardId === 'synthetic-member-pilot-ward-a')
check('ward can be cleared', parseWardForm(form({ ...base, wardId: '', startDate: '2026-09-17' })).ok)
check('ward rejects bad date', !parseWardForm(form({ ...base, wardId: '', startDate: '2026-02-29' })).ok)

const household = parseHouseholdForm(form({ ...base, householdId: 'synthetic-member-pilot-household-alfa', role: 'HEAD', isHead: 'on', startDate: '2026-09-17' }))
check('household parses', household.ok && household.value.role === 'HEAD' && household.value.isHead)
check('new household parses', parseHouseholdForm(form({ ...base, householdId: '', newHouseholdName: ' Nuwe   huishouding ', role: 'OTHER', startDate: '2026-09-17' })).ok)
check('household rejects two choices', !parseHouseholdForm(form({ ...base, householdId: 'household-1', newHouseholdName: 'Nuwe', role: 'OTHER', startDate: '2026-09-17' })).ok)
check('household rejects role', !parseHouseholdForm(form({ ...base, role: 'OWNER', startDate: '2026-09-17' })).ok)

const contact = parseContactForm(form({ ...base, operation: 'save', type: 'MOBILE', value: ' 082 123 4567 ', isPreferred: 'on' }))
check('contact parses', contact.ok && contact.value.operation === 'save' && contact.value.isPreferred)
check('blank contact rejected', !parseContactForm(form({ ...base, operation: 'save', type: 'MOBILE', value: '' })).ok)
check('short phone rejected', !parseContactForm(form({ ...base, operation: 'save', type: 'PHONE', value: '123' })).ok)
check('invalid email rejected', !parseContactForm(form({ ...base, operation: 'save', type: 'EMAIL', value: 'not-an-email' })).ok)
const ended = parseContactForm(form({ ...base, operation: 'end', contactId: 'contact-1' }))
check('contact can end', ended.ok && ended.value.operation === 'end')
check('end requires id', !parseContactForm(form({ ...base, operation: 'end', contactId: '' })).ok)

const event = parseEventForm(form({ ...base, type: 'BAPTISM', effectiveDate: '2020-01-02', note: ' Nota ' }))
check('event parses', event.ok && event.value.note === 'Nota')
check('event rejects unknown type', !parseEventForm(form({ ...base, type: 'SECRET', effectiveDate: '2020-01-02' })).ok)
check('status change event is derived', !parseEventForm(form({ ...base, type: 'STATUS_CHANGED', effectiveDate: '2020-01-02' })).ok)
check('event rejects long note', !parseEventForm(form({ ...base, type: 'OTHER', effectiveDate: '2020-01-02', note: 'x'.repeat(1001) })).ok)
check('all forms reject invalid record metadata', !parseWardForm(form({ ...base, memberId: '../bad', wardId: '', startDate: '2026-09-17' })).ok)

if (failures.length) {
  console.error(`Verwante lidmaatvorm-verifikasie het misluk (${failures.length}/${total}): ${failures.join('; ')}`)
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ status: 'ok', checks: total }))
}
