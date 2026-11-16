export const ROUTINE_DISCIPLINES = ['solo', 'duet', 'mixed-duet', 'group', 'combo', 'acro-group', 'custom'] as const
export const ROUTINE_PROGRAM_TYPES = ['technical', 'free', 'not-specified'] as const
export const ROUTINE_CONTEXTS = ['training', 'competition', 'show'] as const
export const ROUTINE_BLOCK_TYPES = ['element', 'formation', 'transition', 'note'] as const

export type RoutineDiscipline = typeof ROUTINE_DISCIPLINES[number]
export type RoutineProgramType = typeof ROUTINE_PROGRAM_TYPES[number]
export type RoutineContext = typeof ROUTINE_CONTEXTS[number]
export type RoutineBlockType = typeof ROUTINE_BLOCK_TYPES[number]

export type RoutineBlock = {
  id: string
  type: RoutineBlockType
  title: string
  startSecond?: number
  endSecond?: number
  manualDifficulty?: number
  note?: string
}

export type Routine = {
  id: string
  title: string
  context: RoutineContext
  eventName?: string
  discipline: RoutineDiscipline
  customDiscipline?: string
  programType: RoutineProgramType
  ageGroup: string
  activeAthleteCount: number
  reserveAthleteCount: number
  athleteNames: string[]
  targetDurationSeconds?: number
  generalNote?: string
  blocks: RoutineBlock[]
  createdAt: string
  updatedAt: string
}

export type RoutineDraft = Omit<Routine, 'id' | 'createdAt' | 'updatedAt' | 'blocks'> & { blocks?: RoutineBlock[] } 
export type RoutineBlockDraft = Omit<RoutineBlock, 'id'>

export const ROUTINE_DISCIPLINE_LABELS: Record<RoutineDiscipline, string> = { solo: 'Соло', duet: 'Дуэт', 'mixed-duet': 'Микст-дуэт', group: 'Группа', combo: 'Комби', 'acro-group': 'Акрогруппа', custom: 'Своя дисциплина' }
export const ROUTINE_PROGRAM_TYPE_LABELS: Record<RoutineProgramType, string> = { technical: 'Техническая', free: 'Произвольная', 'not-specified': 'Не указывать' }
export const ROUTINE_CONTEXT_LABELS: Record<RoutineContext, string> = { training: 'Тренировка', competition: 'Соревнования', show: 'Показательное выступление' }
export const ROUTINE_BLOCK_TYPE_LABELS: Record<RoutineBlockType, string> = { element: 'Элемент', formation: 'Построение', transition: 'Переход', note: 'Заметка' }

const includes = <T extends readonly string[]>(values: T, value: unknown): value is T[number] => typeof value === 'string' && values.includes(value)
const trim = (value: unknown) => typeof value === 'string' ? value.trim() : ''

function optionalText(value: unknown): string | undefined {
  const normalized = trim(value)
  return normalized || undefined
}

function optionalInteger(value: unknown): number | undefined | null {
  if (value === '' || value === undefined || value === null) return undefined
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}

function optionalNonNegativeNumber(value: unknown): number | undefined | null {
  if (value === '' || value === undefined || value === null) return undefined
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function normalizeRoutineDraft(value: unknown): Omit<Routine, 'id' | 'createdAt' | 'updatedAt' | 'blocks'> | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const title = trim(raw.title)
  const eventName = optionalText(raw.eventName)
  const customDiscipline = optionalText(raw.customDiscipline)
  const ageGroup = trim(raw.ageGroup)
  const activeAthleteCount = optionalInteger(raw.activeAthleteCount)
  const reserveAthleteCount = optionalInteger(raw.reserveAthleteCount)
  const targetDurationSeconds = optionalInteger(raw.targetDurationSeconds)
  if (!title || !ageGroup || !includes(ROUTINE_CONTEXTS, raw.context) || !includes(ROUTINE_DISCIPLINES, raw.discipline) || !includes(ROUTINE_PROGRAM_TYPES, raw.programType) || activeAthleteCount === null || activeAthleteCount === undefined || reserveAthleteCount === null || targetDurationSeconds === null || (raw.discipline === 'custom' && !customDiscipline)) return null
  const athleteNames = typeof raw.athleteNames === 'string' ? raw.athleteNames.split(',').map((name) => name.trim()).filter(Boolean) : Array.isArray(raw.athleteNames) ? raw.athleteNames.filter((name): name is string => typeof name === 'string' && Boolean(name.trim())).map((name) => name.trim()) : []
  return { title, context: raw.context, eventName, discipline: raw.discipline, customDiscipline: raw.discipline === 'custom' ? customDiscipline : undefined, programType: raw.programType, ageGroup, activeAthleteCount, reserveAthleteCount: reserveAthleteCount ?? 0, athleteNames, targetDurationSeconds, generalNote: optionalText(raw.generalNote) }
}

export function normalizeRoutineBlockDraft(value: unknown): RoutineBlockDraft | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const title = trim(raw.title)
  const startSecond = optionalInteger(raw.startSecond)
  const endSecond = optionalInteger(raw.endSecond)
  const manualDifficulty = optionalNonNegativeNumber(raw.manualDifficulty)
  if (!title || !includes(ROUTINE_BLOCK_TYPES, raw.type) || startSecond === null || endSecond === null || manualDifficulty === null || (startSecond !== undefined && endSecond !== undefined && endSecond < startSecond)) return null
  return { type: raw.type, title, startSecond, endSecond, manualDifficulty: raw.type === 'element' ? manualDifficulty : undefined, note: optionalText(raw.note) }
}

export function formatRoutineTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function calculateDraftDifficulty(blocks: RoutineBlock[]): number {
  return Number(blocks.reduce((sum, block) => sum + (block.type === 'element' ? block.manualDifficulty ?? 0 : 0), 0).toFixed(3))
}
