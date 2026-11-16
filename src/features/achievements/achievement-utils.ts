import { DISCIPLINES, MEDALS, type Achievement, type AchievementDiscipline, type AchievementDraft, type AchievementMedal, type ScoreChange } from './achievement-types'

function formatLocalDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isValidPerformanceDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const candidate = new Date(year, month - 1, day)
  return candidate.getFullYear() === year
    && candidate.getMonth() === month - 1
    && candidate.getDate() === day
    && value <= formatLocalDate()
}

function isDiscipline(value: string): value is AchievementDiscipline {
  return (DISCIPLINES as readonly string[]).includes(value)
}

function isMedal(value: string): value is AchievementMedal {
  return (MEDALS as readonly string[]).includes(value)
}

export function normalizeAchievementDraft(draft: AchievementDraft): AchievementDraft | null {
  const eventName = draft.eventName.trim()
  const customDiscipline = draft.customDiscipline?.trim()
  const score = Number(draft.score)
  if (!eventName || !isDiscipline(draft.discipline) || !isMedal(draft.medal) || !isValidPerformanceDate(draft.performedOn) || !Number.isFinite(score) || score < 0) return null
  if (draft.discipline === 'custom' && !customDiscipline) return null

  return {
    performedOn: draft.performedOn,
    eventName,
    discipline: draft.discipline,
    ...(draft.discipline === 'custom' ? { customDiscipline } : {}),
    score: Math.round(score * 1000) / 1000,
    medal: draft.medal,
  }
}

export function disciplineKey(record: Pick<Achievement, 'discipline' | 'customDiscipline'>): string {
  return record.discipline === 'custom'
    ? `custom:${record.customDiscipline?.trim().toLocaleLowerCase() ?? ''}`
    : record.discipline
}

export function sortAchievements(records: Achievement[]): Achievement[] {
  return [...records].sort((left, right) => right.performedOn.localeCompare(left.performedOn) || right.createdAt.localeCompare(left.createdAt))
}

export function getPreviousAchievement(current: Achievement, records: Achievement[]): Achievement | null {
  const currentKey = disciplineKey(current)
  return records
    .filter((record) => record.id !== current.id && disciplineKey(record) === currentKey && record.performedOn < current.performedOn)
    .sort((left, right) => right.performedOn.localeCompare(left.performedOn) || right.createdAt.localeCompare(left.createdAt))[0] ?? null
}

export function getScoreChange(current: Achievement, records: Achievement[]): ScoreChange | null {
  const previous = getPreviousAchievement(current, records)
  if (!previous) return null
  const difference = Math.round((current.score - previous.score) * 1000) / 1000
  return { direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same', difference: Math.abs(difference) }
}
