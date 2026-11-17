import type { TrainingEntry } from './training-diary-types'

const plural = (value: number) => value === 1 ? 'тренировка' : value > 1 && value < 5 ? 'тренировки' : 'тренировок'
const formatLocalDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function getDiaryWeekSummary(entries: TrainingEntry[], now = new Date()): { count: number; moods: NonNullable<TrainingEntry['mood']>[] } {
  const fromDate = new Date(now); fromDate.setHours(0, 0, 0, 0); fromDate.setDate(fromDate.getDate() - 6)
  const week = entries.filter((entry) => entry.performedOn >= formatLocalDate(fromDate) && entry.performedOn <= formatLocalDate(now))
  return { count: week.length, moods: week.sort((left, right) => left.performedOn.localeCompare(right.performedOn)).map((entry) => entry.mood).filter((mood): mood is NonNullable<TrainingEntry['mood']> => Boolean(mood)).slice(-5) }
}

export function diaryCountLabel(value: number): string { return `${value} ${plural(value)}` }
