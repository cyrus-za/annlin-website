/**
 * Verifies the pure helpers behind the read-only member detail view.
 *
 * Runs without a database, environment file or member data: it only exercises the register
 * link sanitiser and the audit/event summarisers with synthetic placeholder values.
 */
import { summarizeMemberAuditChanges, summarizeMembershipEventDetails } from '../lib/members/detail-view'
import { memberDetailHref, memberRowId, registerHref, registerListQuery } from '../lib/members/register-links'

const failures: string[] = []
let total = 0

function check(name: string, condition: boolean) {
  total += 1
  if (!condition) failures.push(name)
}

// Register -> detail -> register links carry only the register's own parameters.
check('empty params produce a bare register link', registerHref({}) === '/admin/lidmate')
check('search and page are preserved', registerListQuery({ soek: 'toets', bladsy: '3' }) === '?soek=toets&bladsy=3')
check('page one is dropped', registerListQuery({ soek: 'toets', bladsy: '1' }) === '?soek=toets')
check('non-numeric pages are dropped', registerListQuery({ bladsy: 'abc' }) === '')
check('negative pages are dropped', registerListQuery({ bladsy: '-4' }) === '')
check('fractional pages are dropped', registerListQuery({ bladsy: '2.5' }) === '')
check('search is trimmed', registerListQuery({ soek: '  toets  ' }) === '?soek=toets')
check('overlong search is bounded', registerListQuery({ soek: 'x'.repeat(500) }).length <= '?soek='.length + 100)
check('search is percent-encoded', registerListQuery({ soek: 'a&b=c#d' }) === '?soek=a%26b%3Dc%23d')
check(
  'foreign parameters are ignored',
  registerListQuery({ soek: 'toets', bladsy: '2', terug: 'https://evil.example', next: '/x' } as Record<string, string>) === '?soek=toets&bladsy=2',
)
check('detail link is same-origin and opaque', memberDetailHref('rec01', { soek: 'toets' }) === '/admin/lidmate/rec01?soek=toets')
check('detail link encodes the id', memberDetailHref('a/b', {}) === '/admin/lidmate/a%2Fb')
check('return link targets the row anchor', registerHref({ bladsy: '2' }, 'rec01') === '/admin/lidmate?bladsy=2#lid-rec01')
check('row id matches the return anchor', `#${memberRowId('rec01')}` === registerHref({}, 'rec01').slice('/admin/lidmate'.length))

// Membership event details: only a note and a recognised status change are surfaced.
const arrival = summarizeMembershipEventDetails({ note: '  Proefgebeurtenis  ', internalRef: { id: 'x' } })
check('event note is trimmed', arrival.note === 'Proefgebeurtenis')
check('event without status change reports none', arrival.statusChange === null)
const statusChanged = summarizeMembershipEventDetails({ before: 'ACTIVE', after: 'INACTIVE' })
check('status change is recognised', statusChanged.statusChange?.before === 'ACTIVE' && statusChanged.statusChange.after === 'INACTIVE')
check('unknown statuses are not surfaced', summarizeMembershipEventDetails({ before: 'ACTIVE', after: 'DROP TABLE' }).statusChange === null)
check('non-object details are tolerated', summarizeMembershipEventDetails('raw string').note === null)
check('array details are tolerated', summarizeMembershipEventDetails([1, 2, 3]).statusChange === null)
check('null details are tolerated', summarizeMembershipEventDetails(null).note === null)
check('overlong notes are bounded', (summarizeMembershipEventDetails({ note: 'n'.repeat(2000) }).note ?? '').length === 500)
check('blank notes are dropped', summarizeMembershipEventDetails({ note: '   ' }).note === null)

// Audit changes: known fields show labelled values, unknown fields show only their name.
const update = summarizeMemberAuditChanges({
  before: { firstNames: 'Ou Naam', preferredName: null, lastName: 'Van', status: 'ACTIVE', version: 1 },
  after: { firstNames: 'Nuwe Naam', preferredName: null, lastName: 'Van', status: 'INACTIVE', version: 2 },
})
const byKey = new Map(update.map((field) => [field.key, field]))
check('unchanged fields are omitted', !byKey.has('lastName') && !byKey.has('preferredName'))
check('version is never shown', !byKey.has('version'))
check('changed name is labelled', byKey.get('firstNames')?.label === 'Voorname' && byKey.get('firstNames')?.after === 'Nuwe Naam')
check('status change is flagged for label mapping', byKey.get('status')?.isStatus === true && byKey.get('status')?.after === 'INACTIVE')
check('field order is stable', update.map((field) => field.key).join(',') === 'firstNames,status')

const unknownField = summarizeMemberAuditChanges({
  before: { sourceHash: 'abc123', nested: { secret: 'x' } },
  after: { sourceHash: 'def456', nested: { secret: 'y' } },
})
check('unknown fields expose no values', unknownField.every((field) => field.before === null && field.after === null))
check('unknown fields are still named', unknownField.map((field) => field.key).sort().join(',') === 'nested,sourceHash')
check('no raw JSON survives', !JSON.stringify(unknownField).includes('abc123') && !JSON.stringify(unknownField).includes('secret'))

const created = summarizeMemberAuditChanges({ after: { firstNames: 'Nuut', status: 'ACTIVE' } })
check('created records show new values only', created.every((field) => field.before === null) && created.length === 2)
check('empty before and after collapse to placeholder', summarizeMemberAuditChanges({ before: { preferredName: '' }, after: { preferredName: null } }).length === 0)
check('non-object changes are tolerated', summarizeMemberAuditChanges('oops').length === 0)
check('non-object before/after are tolerated', summarizeMemberAuditChanges({ before: 'x', after: ['y'] }).length === 0)
check('overlong values are bounded', (summarizeMemberAuditChanges({ after: { lastName: 'v'.repeat(1000) } })[0]?.after ?? '').length === 200)
check('non-string values are not rendered', summarizeMemberAuditChanges({ after: { firstNames: { deep: true } } })[0]?.after === null)
check('invalid status values are masked', summarizeMemberAuditChanges({ before: { status: 'ACTIVE' }, after: { status: 'BOGUS' } })[0]?.after === '—')

if (failures.length > 0) {
  console.error(`Lidmaatdetail-verifikasie het misluk (${failures.length}/${total}): ${failures.join('; ')}`)
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ status: 'ok', checks: total }))
}
