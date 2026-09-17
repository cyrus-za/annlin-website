import assert from 'node:assert/strict'
import { nextRecurringDate } from '../lib/event-recurrence'

const at = (value: string) => new Date(`${value}T09:30:00+02:00`)

assert.equal(nextRecurringDate(at('2026-09-07'), 'BIWEEKLY').toISOString(), at('2026-09-21').toISOString())
assert.equal(nextRecurringDate(at('2026-09-07'), 'FIRST_WEEKDAY_MONTHLY').toISOString(), at('2026-10-01').toISOString())
assert.equal(nextRecurringDate(at('2026-10-01'), 'FIRST_WEEKDAY_MONTHLY').toISOString(), at('2026-11-02').toISOString())
assert.equal(nextRecurringDate(at('2027-04-01'), 'FIRST_WEEKDAY_MONTHLY').toISOString(), at('2027-05-03').toISOString())

console.log(JSON.stringify({ passed: true, checks: 4 }))
