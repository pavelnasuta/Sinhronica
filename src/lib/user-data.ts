import type { AthleteProfile } from '../stores/athlete-profile-store'
import type { ThemePreference } from '../stores/preferences-store'
import type { Idea } from '../types/idea'
import type { Achievement } from '../features/achievements/achievement-types'
import type { FigureProgress } from '../stores/figure-progress-store'
import type { Routine } from '../features/routines/routine-types'
import type { TrainingEntry } from '../features/training-diary/training-diary-types'

export type UserDataExport = {
  version: 5
  exportedAt: string
  profile: AthleteProfile
  ideas: Idea[]
  achievements: Achievement[]
  figureProgress: FigureProgress[]
  routines: Routine[]
  trainingDiary: TrainingEntry[]
  preferences: { theme: ThemePreference }
}

export function serializeUserData({ profile, ideas, achievements, figureProgress, routines, trainingDiary, theme }: Omit<UserDataExport, 'version' | 'exportedAt' | 'preferences'> & { theme: ThemePreference }): string {
  return JSON.stringify({ version: 5, exportedAt: new Date().toISOString(), profile, ideas, achievements, figureProgress, routines, trainingDiary, preferences: { theme } }, null, 2)
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
