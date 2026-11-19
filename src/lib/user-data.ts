import type { AthleteProfile } from '../stores/athlete-profile-store'
import { ATHLETE_PROFILE_STORAGE_KEY, athleteProfileSchema, isValidBirthDate } from '../stores/athlete-profile-store'
import type { ThemePreference } from '../stores/preferences-store'
import { PREFERENCES_STORAGE_KEY } from '../stores/preferences-store'
import type { Idea } from '../types/idea'
import { parseImportPayload, serializeExportPayload } from './export-import'
import type { Achievement } from '../features/achievements/achievement-types'
import type { FigureProgress } from '../stores/figure-progress-store'
import { parseStoredFigureProgress, FIGURE_PROGRESS_STORAGE_KEY } from '../stores/figure-progress-store'
import type { Routine } from '../features/routines/routine-types'
import { parseStoredRoutine, ROUTINES_STORAGE_KEY } from '../stores/routines-store'
import type { TrainingEntry } from '../features/training-diary/training-diary-types'
import { parseStoredTrainingEntry, TRAINING_DIARY_STORAGE_KEY } from '../stores/training-diary-store'
import { ACHIEVEMENTS_STORAGE_KEY, parseStoredAchievement } from '../stores/achievements-store'
import { IDEAS_STORAGE_KEY } from '../stores/ideas-store'
import { ROLE_PROFILE_STORAGE_KEY } from '../stores/role-profile-store'

export type UserDataExport = {
  version: 6
  exportedAt: string
  profile: AthleteProfile
  ideas: Idea[]
  achievements: Achievement[]
  figureProgress: FigureProgress[]
  routines: Routine[]
  trainingDiary: TrainingEntry[]
  preferences: { theme: ThemePreference }
}

export type UserDataImport = Omit<UserDataExport, 'version'> & { version: 4 | 5 | 6 }

export function serializeUserData({ profile, ideas, achievements, figureProgress, routines, trainingDiary, theme }: Omit<UserDataExport, 'version' | 'exportedAt' | 'preferences'> & { theme: ThemePreference }): string {
  return JSON.stringify({ version: 6, exportedAt: new Date().toISOString(), profile, ideas, achievements, figureProgress, routines, trainingDiary, preferences: { theme } }, null, 2)
}

function parseRecords<T>(value: unknown, parser: (record: unknown) => T | null): T[] {
  if (!Array.isArray(value)) throw new Error('Неверный файл резервной копии')
  const records = value.map(parser)
  if (!records.every((record): record is T => record !== null)) throw new Error('Неверный файл резервной копии')
  return records
}

export function parseUserDataImport(input: string): UserDataImport {
  try {
    const raw: unknown = JSON.parse(input)
    if (!raw || typeof raw !== 'object') throw new Error()
    const data = raw as Record<string, unknown>
    const version = data.version === 4 || data.version === 5 || data.version === 6 ? data.version : null
    if (!version || typeof data.exportedAt !== 'string' || Number.isNaN(Date.parse(data.exportedAt))) throw new Error()
    const profile = athleteProfileSchema.safeParse(data.profile)
    if (!profile.success || !isValidBirthDate(profile.data.birthDate)) throw new Error()
    const ideas = parseImportPayload(JSON.stringify({ version: 1, exportedAt: data.exportedAt, ideas: data.ideas })).ideas
    const preferences = data.preferences
    if (!preferences || typeof preferences !== 'object') throw new Error()
    const importedTheme = (preferences as Record<string, unknown>).theme
    if (!['light', 'dark', 'system'].includes(importedTheme as string)) throw new Error()
    const theme: ThemePreference = importedTheme === 'light' ? 'light' : 'dark'
    return { version, exportedAt: data.exportedAt, profile: profile.data, ideas, achievements: parseRecords(data.achievements, parseStoredAchievement), figureProgress: parseRecords(data.figureProgress, parseStoredFigureProgress), routines: parseRecords(data.routines, parseStoredRoutine), trainingDiary: version === 4 ? [] : parseRecords(data.trainingDiary, parseStoredTrainingEntry), preferences: { theme } }
  } catch {
    throw new Error('Неверный файл резервной копии')
  }
}

export function restoreUserData(data: UserDataImport, targetStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>): boolean {
  let storage = targetStorage
  try {
    storage ??= typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return false
  }
  if (!storage) return false
  const writes: Array<[string, string | null]> = [
    [ROLE_PROFILE_STORAGE_KEY, JSON.stringify({ version: 3, role: 'athlete', profile: data.profile })],
    [ATHLETE_PROFILE_STORAGE_KEY, JSON.stringify({ version: 3, profile: data.profile })],
    ['sinhronica:athlete-profile:v2', null],
    ['sinhronica:athlete-profile:v1', null],
    [IDEAS_STORAGE_KEY, serializeExportPayload(data.ideas)],
    [ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(data.achievements)],
    [FIGURE_PROGRESS_STORAGE_KEY, JSON.stringify(data.figureProgress)],
    [ROUTINES_STORAGE_KEY, JSON.stringify(data.routines)],
    [TRAINING_DIARY_STORAGE_KEY, JSON.stringify(data.trainingDiary)],
    [PREFERENCES_STORAGE_KEY, data.preferences.theme],
  ]
  const previous: Array<readonly [string, string | null]> = []
  const applied: string[] = []
  try {
    previous.push(...writes.map(([key]) => [key, storage.getItem(key)] as const))
    for (const [key, value] of writes) {
      if (value === null) storage.removeItem(key)
      else storage.setItem(key, value)
      applied.push(key)
    }
    return true
  } catch {
    try {
      for (const key of [...applied].reverse()) storage.removeItem(key)
      for (const [key, value] of previous) {
        if (value !== null) storage.setItem(key, value)
      }
    } catch { /* restoration is best-effort after browser storage failure */ }
    return false
  }
}

export function downloadUserData(payload: string): void {
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'sinhronica-data.json'
  link.click()
  URL.revokeObjectURL(url)
}
