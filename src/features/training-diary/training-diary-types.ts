export const TRAINING_TYPES = ['water', 'dryland', 'acrobatics', 'choreography', 'run-throughs', 'physical-training', 'other'] as const
export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = { water: 'Вода', dryland: 'Суша', acrobatics: 'Акробатика', choreography: 'Хореография', 'run-throughs': 'Прогоны', 'physical-training': 'Физподготовка', other: 'Другое' }
export const TRAINING_MOODS = ['heavy', 'calm', 'good', 'energized'] as const
export const TRAINING_MOOD_LABELS: Record<TrainingMood, string> = { heavy: 'Тяжело', calm: 'Спокойно', good: 'Хорошо', energized: 'На подъёме' }

export type TrainingType = typeof TRAINING_TYPES[number]
export type TrainingMood = typeof TRAINING_MOODS[number]
export type TrainingEntry = { id: string; performedOn: string; types: TrainingType[]; durationMinutes?: number; note?: string; mood?: TrainingMood; createdAt: string; updatedAt: string }
export type TrainingEntryDraft = Omit<TrainingEntry, 'id' | 'createdAt' | 'updatedAt'>

const includes = <T extends readonly string[]>(values: T, value: unknown): value is T[number] => typeof value === 'string' && values.includes(value)
const formatLocalDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const validDate = (value: unknown, now: Date) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && value <= formatLocalDate(now)
}

export function normalizeTrainingEntryDraft(value: unknown, now = new Date()): Omit<TrainingEntry, 'id' | 'createdAt' | 'updatedAt'> | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const types = Array.isArray(raw.types) ? [...new Set(raw.types.filter((type): type is TrainingType => includes(TRAINING_TYPES, type)))] : []
  const duration = raw.durationMinutes === '' || raw.durationMinutes === undefined || raw.durationMinutes === null ? undefined : Number(raw.durationMinutes)
  const note = typeof raw.note === 'string' ? raw.note.trim() : ''
  if (!validDate(raw.performedOn, now) || types.length === 0 || (duration !== undefined && (!Number.isInteger(duration) || duration < 0)) || note.length > 1200 || (raw.mood !== undefined && raw.mood !== '' && !includes(TRAINING_MOODS, raw.mood))) return null
  return { performedOn: raw.performedOn as string, types, durationMinutes: duration, note: note || undefined, mood: includes(TRAINING_MOODS, raw.mood) ? raw.mood : undefined }
}

export function getMoodLabel(mood: TrainingMood): string { return TRAINING_MOOD_LABELS[mood] }
