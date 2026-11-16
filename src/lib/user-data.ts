import type { AthleteProfile } from '../stores/athlete-profile-store'
import type { ThemePreference } from '../stores/preferences-store'
import type { Idea } from '../types/idea'

export type UserDataExport = {
  version: 1
  exportedAt: string
  profile: AthleteProfile
  ideas: Idea[]
  preferences: { theme: ThemePreference }
}

export function serializeUserData({ profile, ideas, theme }: Omit<UserDataExport, 'version' | 'exportedAt' | 'preferences'> & { theme: ThemePreference }): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), profile, ideas, preferences: { theme } }, null, 2)
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
