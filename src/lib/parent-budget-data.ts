import { parseStoredBudgetEntry, BUDGET_STORAGE_KEY, type BudgetEntry } from '../stores/budget-store'
import { ROLE_PROFILE_STORAGE_KEY, parentProfileSchema, parsePersistedRoleProfile, type ParentProfile } from '../stores/role-profile-store'

export type ParentBudgetBackup = { version: 1; exportedAt: string; profile: ParentProfile; entries: BudgetEntry[] }
type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function serializeParentBudgetBackup(profile: ParentProfile, entries: BudgetEntry[]): string { return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), profile, entries }, null, 2) }
function parseProfile(profile: unknown): ParentProfile | null {
  const current = parentProfileSchema.safeParse(profile)
  if (current.success) return current.data
  const legacy = parsePersistedRoleProfile(JSON.stringify({ version: 1, role: 'parent', profile }))
  return legacy?.role === 'parent' ? legacy.profile : null
}
export function parseParentBudgetBackup(input: string): ParentBudgetBackup {
  try {
    const data: unknown = JSON.parse(input)
    if (!data || typeof data !== 'object') throw new Error()
    const raw = data as Record<string, unknown>
    const profile = raw.version === 1 && typeof raw.exportedAt === 'string' && !Number.isNaN(Date.parse(raw.exportedAt)) ? parseProfile(raw.profile) : null
    const entries = Array.isArray(raw.entries) ? raw.entries.map(parseStoredBudgetEntry) : []
    if (!profile || !Array.isArray(raw.entries) || !entries.every((entry): entry is BudgetEntry => entry !== null)) throw new Error()
    return { version: 1, exportedAt: raw.exportedAt as string, profile, entries }
  } catch { throw new Error('Неверный файл резервной копии бюджета') }
}
export function restoreParentBudgetBackup(backup: ParentBudgetBackup, targetStorage?: BrowserStorage): boolean {
  let storage = targetStorage
  try { storage ??= typeof window === 'undefined' ? undefined : window.localStorage } catch { return false }
  if (!storage) return false
  const writes: Array<[string, string]> = [[ROLE_PROFILE_STORAGE_KEY, JSON.stringify({ version: 2, role: 'parent', profile: backup.profile })], [BUDGET_STORAGE_KEY, JSON.stringify(backup.entries)]]
  const previous: Array<readonly [string, string | null]> = []; const applied: string[] = []
  try { previous.push(...writes.map(([key]) => [key, storage.getItem(key)] as const)); for (const [key, value] of writes) { storage.setItem(key, value); applied.push(key) }; return true } catch { try { for (const key of [...applied].reverse()) storage.removeItem(key); for (const [key, value] of previous) if (value !== null) storage.setItem(key, value) } catch { /* unavailable */ }; return false }
}
export function downloadParentBudgetBackup(payload: string): void { const blob = new Blob([payload], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'sinhronica-parent.json'; link.click(); URL.revokeObjectURL(url) }
