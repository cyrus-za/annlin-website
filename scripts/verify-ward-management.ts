import { parseCreateWardForm, parseUpdateWardForm } from '../lib/members/ward-form'

const failures: string[] = []
let total = 0
function check(name: string, condition: boolean) { total += 1; if (!condition) failures.push(name) }
function form(fields: Record<string, string | undefined>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) if (value !== undefined) data.set(key, value)
  return data
}

const base = { code: ' 12 ', name: ' Annlin   Oos ', activeFrom: '2026-09-17', elderId: 'synthetic-member-pilot-alfa-1', elderStartDate: '2026-10-01' }
const created = parseCreateWardForm(form(base))
check('create parses', created.ok)
if (created.ok) {
  check('code is trimmed', created.value.code === '12')
  check('name whitespace is normalized', created.value.name === 'Annlin Oos')
  check('elder remains independent identifier', created.value.elderId === base.elderId)
  check('elder start date is independent', created.value.elderStartDate.toISOString().slice(0, 10) === '2026-10-01')
}
check('elder is optional', parseCreateWardForm(form({ ...base, elderId: '', elderStartDate: '' })).ok)
check('code is required', !parseCreateWardForm(form({ ...base, code: '' })).ok)
check('name is required', !parseCreateWardForm(form({ ...base, name: '' })).ok)
check('date must be valid', !parseCreateWardForm(form({ ...base, activeFrom: '2026-02-29' })).ok)
check('elder id is validated', !parseCreateWardForm(form({ ...base, elderId: '../member' })).ok)
check('elder requires service date', !parseCreateWardForm(form({ ...base, elderStartDate: '' })).ok)
check('elder cannot start before ward', !parseCreateWardForm(form({ ...base, elderStartDate: '2026-01-01' })).ok)

const updated = parseUpdateWardForm(form({ ...base, wardId: 'synthetic-member-pilot-ward-a', version: '3' }))
check('update parses', updated.ok && updated.value.version === 3)
check('update rejects bad ward id', !parseUpdateWardForm(form({ ...base, wardId: '../ward', version: '3' })).ok)
check('update rejects bad version', !parseUpdateWardForm(form({ ...base, wardId: 'ward-a', version: '0' })).ok)

if (failures.length) {
  console.error(`Wykbestuur-verifikasie het misluk (${failures.length}/${total}): ${failures.join('; ')}`)
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ status: 'ok', checks: total }))
}
