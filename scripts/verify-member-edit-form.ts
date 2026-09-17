/**
 * Verifies the pure helpers behind the controlled member edit form.
 *
 * Runs without a database, environment file or member data. It covers form parsing and
 * validation, failure-to-message mapping, the status options offered to the form and the
 * dirty check that gates the explicit save action.
 */
import {
  MEMBER_EDIT_IDLE,
  describeMemberEditFailure,
  hasMemberEditChanges,
  memberStatusOptions,
  normalizeName,
  parseMemberEditForm,
} from '../lib/members/edit-form'

const failures: string[] = []
let total = 0

function check(name: string, condition: boolean) {
  total += 1
  if (!condition) failures.push(name)
}

function form(fields: Record<string, string | undefined>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) data.set(key, value)
  }
  return data
}

const valid = {
  memberId: 'synthetic-member-pilot-alfa-1',
  version: '3',
  firstNames: '  Toets   Lid  ',
  preferredName: '',
  lastName: 'Sinteties',
  birthDate: '1980-02-29',
  status: 'ACTIVE',
}

// Happy path: whitespace is normalised, optional name becomes null, version is numeric.
const parsed = parseMemberEditForm(form(valid))
check('valid form parses', parsed.ok)
if (parsed.ok) {
  check('first names are normalised', parsed.value.input.firstNames === 'Toets Lid')
  check('empty preferred name becomes null', parsed.value.input.preferredName === null)
  check('last name is kept', parsed.value.input.lastName === 'Sinteties')
  check('birth date is parsed', parsed.value.input.birthDate?.toISOString().slice(0, 10) === '1980-02-29')
  check('status is typed', parsed.value.input.status === 'ACTIVE')
  check('version is an integer', parsed.value.version === 3)
  check('member id is passed through unchanged', parsed.value.memberId === valid.memberId)
}
const withPreferred = parseMemberEditForm(form({ ...valid, preferredName: '  Alfa  ' }))
check('preferred name is trimmed when present', withPreferred.ok && withPreferred.value.input.preferredName === 'Alfa')

// Identifier and version problems are reported generically.
const badId = parseMemberEditForm(form({ ...valid, memberId: '../etc/passwd' }))
check('invalid member id maps to generic not-found', !badId.ok && badId.state.status === 'error' && badId.state.code === 'NOT_FOUND' && badId.state.field === undefined)
const missingId = parseMemberEditForm(form({ ...valid, memberId: undefined }))
check('missing member id maps to generic not-found', !missingId.ok && missingId.state.status === 'error' && missingId.state.code === 'NOT_FOUND')
const longId = parseMemberEditForm(form({ ...valid, memberId: 'a'.repeat(65) }))
check('overlong member id is rejected', !longId.ok)
for (const version of ['', '0', '-1', '1.5', 'abc', '1e3', '1234567890']) {
  const result = parseMemberEditForm(form({ ...valid, version }))
  check(`version "${version}" maps to a conflict`, !result.ok && result.state.status === 'error' && result.state.code === 'CONFLICT')
}

// Field validation carries the field name so the form can focus and describe the error.
const noFirst = parseMemberEditForm(form({ ...valid, firstNames: '   ' }))
check('blank first names are rejected on the field', !noFirst.ok && noFirst.state.status === 'error' && noFirst.state.field === 'firstNames' && noFirst.state.code === 'INVALID')
const longFirst = parseMemberEditForm(form({ ...valid, firstNames: 'x'.repeat(121) }))
check('overlong first names are rejected', !longFirst.ok && longFirst.state.status === 'error' && longFirst.state.field === 'firstNames')
const boundaryFirst = parseMemberEditForm(form({ ...valid, firstNames: 'x'.repeat(120) }))
check('120-character first names are accepted', boundaryFirst.ok)
const noLast = parseMemberEditForm(form({ ...valid, lastName: '' }))
check('blank last name is rejected on the field', !noLast.ok && noLast.state.status === 'error' && noLast.state.field === 'lastName')
const longPreferred = parseMemberEditForm(form({ ...valid, preferredName: 'y'.repeat(121) }))
check('overlong preferred name is rejected on the field', !longPreferred.ok && longPreferred.state.status === 'error' && longPreferred.state.field === 'preferredName')
const badStatus = parseMemberEditForm(form({ ...valid, status: 'DROP TABLE' }))
check('unknown status is rejected on the field', !badStatus.ok && badStatus.state.status === 'error' && badStatus.state.field === 'status')
const lowerStatus = parseMemberEditForm(form({ ...valid, status: 'active' }))
check('status comparison is exact', !lowerStatus.ok)
const badBirthDate = parseMemberEditForm(form({ ...valid, birthDate: '2025-02-29' }))
check('invalid calendar date is rejected', !badBirthDate.ok && badBirthDate.state.status === 'error' && badBirthDate.state.field === 'birthDate')
const emptyBirthDate = parseMemberEditForm(form({ ...valid, birthDate: '' }))
check('empty birth date is accepted', emptyBirthDate.ok && emptyBirthDate.value.input.birthDate === null)
check('messages are Afrikaans and free of internals', !noFirst.ok && noFirst.state.status === 'error' && /verpligtend/.test(noFirst.state.message) && !/prisma|sql|undefined/i.test(noFirst.state.message))

// Failure mapping never leaks internals and keeps conflicts actionable.
const conflict = describeMemberEditFailure('CONFLICT')
check('conflict explains the refresh', conflict.status === 'error' && /intussen verander/.test(conflict.message) && /Herlaai/.test(conflict.message))
const notFound = describeMemberEditFailure('NOT_FOUND', 'Lidmaat nie gevind nie')
check('not-found ignores the internal detail', notFound.status === 'error' && notFound.message === 'Hierdie rekord is nie beskikbaar nie.')
const unavailable = describeMemberEditFailure('UNAVAILABLE', 'PrismaClientKnownRequestError P2028')
check('unavailable hides the underlying error', unavailable.status === 'error' && !/prisma|P2028/i.test(unavailable.message))
const invalidDetail = describeMemberEditFailure('INVALID', 'Noemnaam is te lank')
check('invalid keeps the command layer message', invalidDetail.status === 'error' && invalidDetail.message === 'Noemnaam is te lank')
const invalidBlank = describeMemberEditFailure('INVALID', '   ')
check('invalid falls back to a generic message', invalidBlank.status === 'error' && invalidBlank.message.length > 0)
check('idle state is idle', MEMBER_EDIT_IDLE.status === 'idle')

// Status options: archiving is not offered unless the record is already archived.
const activeOptions = memberStatusOptions('ACTIVE').map((option) => option.value)
check('archived is not offered for an active record', !activeOptions.includes('ARCHIVED'))
check('other statuses are offered', ['ACTIVE', 'INACTIVE', 'DEPARTED', 'DECEASED'].every((status) => activeOptions.includes(status as typeof activeOptions[number])))
const archivedOptions = memberStatusOptions('ARCHIVED').map((option) => option.value)
check('archived stays selectable for an archived record', archivedOptions.includes('ARCHIVED'))
check('options carry Afrikaans labels', memberStatusOptions('ACTIVE').every((option) => option.label.length > 0 && option.label !== option.value))

// Dirty check mirrors storage normalisation so a no-op save is not offered.
const current = { firstNames: 'Toets Lid', preferredName: '', lastName: 'Sinteties', birthDate: '1980-02-29', status: 'ACTIVE' as const }
check('identical values are not dirty', !hasMemberEditChanges({ ...current }, current))
check('whitespace-only edits are not dirty', !hasMemberEditChanges({ ...current, firstNames: '  Toets   Lid ' }, current))
check('name change is dirty', hasMemberEditChanges({ ...current, lastName: 'Ander' }, current))
check('status change is dirty', hasMemberEditChanges({ ...current, status: 'INACTIVE' }, current))
check('preferred name change is dirty', hasMemberEditChanges({ ...current, preferredName: 'Alfa' }, current))
check('birth date change is dirty', hasMemberEditChanges({ ...current, birthDate: '1981-02-28' }, current))
check('normalizeName collapses internal whitespace', normalizeName(' a \t b\n c ') === 'a b c')

if (failures.length > 0) {
  console.error(`Lidmaatwysigingsvorm-verifikasie het misluk (${failures.length}/${total}): ${failures.join('; ')}`)
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ status: 'ok', checks: total }))
}
