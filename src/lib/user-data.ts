import type { AthleteProfile } from '../stores/athlete-profile-store'
import type { ThemePreference } from '../stores/preferences-store'
import type { Idea } from '../types/idea'
import type { Achievement } from '../features/achievements/achievement-types'

export type UserDataExport = {
  version: 2
  exportedAt: string
  profile: AthleteProfile
  ideas: Idea[]
  achievements: Achievement[]
  preferences: { theme: ThemePreference }
}

export function serializeUserData({ profile, ideas, achievements, theme }: Omit<UserDataExport, 'version' | 'exportedAt' | 'preferences'> & { theme: ThemePreference }): string {
  return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), profile, ideas, achievements, preferences: { theme } }, null, 2)
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
