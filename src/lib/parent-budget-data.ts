import { parseStoredBudgetEntry, BUDGET_STORAGE_KEY, type BudgetEntry } from '../stores/budget-store'
import { ROLE_PROFILE_STORAGE_KEY, roleProfileSchema, type ParentProfile } from '../stores/role-profile-store'

export type ParentBudgetBackup = {
  version: 1
  exportedAt: string
  profile: ParentProfile
  entries: BudgetEntry[]
}

type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function serializeParentBudgetBackup(profile: ParentProfile, entries: BudgetEntry[]): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), profile, entries }, null, 2)
}

export function parseParentBudgetBackup(input: string): ParentBudgetBackup {
  try {
    const raw: unknown = JSON.parse(input)
    if (!raw || typeof raw !== 'object') throw new Error()
    const data = raw as Record<string, unknown>
    if (data.version !== 1 || typeof data.exportedAt !== 'string' || Number.isNaN(Date.parse(data.exportedAt)) || !Array.isArray(data.entries)) throw new Error()
    const parsedProfile = roleProfileSchema.safeParse({ role: 'parent', profile: data.profile })
    const entries = data.entries.map(parseStoredBudgetEntry)
    if (!parsedProfile.success || parsedProfile.data.role !== 'parent' || !entries.every((entry): entry is BudgetEntry => entry !== null)) throw new Error()
    return { version: 1, exportedAt: data.exportedAt, profile: parsedProfile.data.profile, entries }
  } catch {
    throw new Error('Неверный файл резервной копии бюджета')
  }
}

export function restoreParentBudgetBackup(backup: ParentBudgetBackup, targetStorage?: BrowserStorage): boolean {
  let storage = targetStorage
  try { storage ??= typeof window === 'undefined' ? undefined : window.localStorage } catch { return false }
  if (!storage) return false
  const writes: Array<[string, string]> = [
    [ROLE_PROFILE_STORAGE_KEY, JSON.stringify({ version: 1, role: 'parent', profile: backup.profile })],
    [BUDGET_STORAGE_KEY, JSON.stringify(backup.entries)],
  ]
  const previous: Array<readonly [string, string | null]> = []
  const applied: string[] = []
  try {
    previous.push(...writes.map(([key]) => [key, storage.getItem(key)] as const))
    for (const [key, value] of writes) { storage.setItem(key, value); applied.push(key) }
    return true
  } catch {
    try {
      for (const key of [...applied].reverse()) storage.removeItem(key)
      for (const [key, value] of previous) { if (value !== null) storage.setItem(key, value) }
    } catch { /* browser storage is unavailable */ }
    return false
  }
}

export function downloadParentBudgetBackup(payload: string): void {
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'sinhronica-budget.json'
  link.click()
  URL.revokeObjectURL(url)
}
