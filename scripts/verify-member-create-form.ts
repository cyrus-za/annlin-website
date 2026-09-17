import {
  describeMemberCreateFailure,
  memberCreateStatusOptions,
  parseMemberCreateForm,
} from '../lib/members/create-form'

const failures: string[] = []
let total = 0
function check(name: string, condition: boolean) {
  total += 1
  if (!condition) failures.push(name)
}
function form(fields: Record<string, string | undefined>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) if (value !== undefined) data.set(key, value)
  return data
}

const valid = {
  firstNames: '  Toets   Persoon ', preferredName: ' TP ', lastName: ' Voorbeeld ',
  birthDate: '1984-02-29', status: 'ACTIVE', wardId: 'synthetic-member-pilot-ward-a',
}
const parsed = parseMemberCreateForm(form(valid))
check('valid form parses', parsed.ok)
if (parsed.ok) {
  check('names are normalized', parsed.value.firstNames === 'Toets Persoon' && parsed.value.lastName === 'Voorbeeld')
  check('preferred name is normalized', parsed.value.preferredName === 'TP')
  check('date is parsed exactly', parsed.value.birthDate?.toISOString().slice(0, 10) === valid.birthDate)
  check('ward is retained', parsed.value.wardId === valid.wardId)
}
const optional = parseMemberCreateForm(form({ ...valid, preferredName: '', birthDate: '', wardId: '' }))
check('optional values become null', optional.ok && optional.value.preferredName === null && optional.value.birthDate === null && optional.value.wardId === null)
check('first names are required', !parseMemberCreateForm(form({ ...valid, firstNames: '' })).ok)
check('last name is required', !parseMemberCreateForm(form({ ...valid, lastName: '' })).ok)
check('invalid dates are rejected', !parseMemberCreateForm(form({ ...valid, birthDate: '2026-02-29' })).ok)
check('invalid ward ids are rejected', !parseMemberCreateForm(form({ ...valid, wardId: '../ward' })).ok)
check('archived cannot be selected on creation', !parseMemberCreateForm(form({ ...valid, status: 'ARCHIVED' })).ok)
check('unknown status is rejected', !parseMemberCreateForm(form({ ...valid, status: 'UNKNOWN' })).ok)
check('creation options exclude archived', !memberCreateStatusOptions().some(({ value }) => value === 'ARCHIVED'))
const hidden = describeMemberCreateFailure('NOT_FOUND', 'secret database detail')
check('not found hides internals', hidden.status === 'error' && hidden.message !== 'secret database detail')

if (failures.length) {
  console.error(`Lidmaatskeppingsvorm-verifikasie het misluk (${failures.length}/${total}): ${failures.join('; ')}`)
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ status: 'ok', checks: total }))
}
