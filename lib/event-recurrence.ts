import { addDays, addMonths, addWeeks, addYears, startOfMonth } from 'date-fns'

export const RECURRENCE_LABELS = {
  WEEKLY: 'Weekliks',
  BIWEEKLY: 'Elke 2 weke',
  MONTHLY: 'Maandeliks op dieselfde datum',
  FIRST_WEEKDAY_MONTHLY: 'Eerste weeksdag van elke maand',
  YEARLY: 'Jaarliks',
} as const

export type RecurrencePatternValue = keyof typeof RECURRENCE_LABELS

export function nextRecurringDate(date: Date, pattern: RecurrencePatternValue): Date {
  if (pattern === 'WEEKLY') return addWeeks(date, 1)
  if (pattern === 'BIWEEKLY') return addWeeks(date, 2)
  if (pattern === 'MONTHLY') return addMonths(date, 1)
  if (pattern === 'YEARLY') return addYears(date, 1)

  const nextMonth = startOfMonth(addMonths(date, 1))
  nextMonth.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
  if (nextMonth.getDay() === 6) return addDays(nextMonth, 2)
  if (nextMonth.getDay() === 0) return addDays(nextMonth, 1)
  return nextMonth
}
