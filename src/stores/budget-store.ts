import { create } from 'zustand'

import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import { isValidBirthDate } from './athlete-profile-store'
import type { StorageStatus } from './ideas-store'

export const BUDGET_STORAGE_KEY = 'sinhronica:parent-budget:v1'
export const BUDGET_CATEGORIES = ['training', 'travel', 'entry', 'equipment', 'medical', 'transport', 'other'] as const
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number]

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  training: 'Занятия',
  travel: 'Сборы и поездки',
  entry: 'Стартовые взносы',
  equipment: 'Купальники и экипировка',
  medical: 'Медицина',
  transport: 'Транспорт',
  other: 'Прочее',
}

export type BudgetChildId = 'child-1' | 'child-2' | 'both'
export const BUDGET_CHILD_IDS = ['child-1', 'child-2', 'both'] as const

export type BudgetDraft = { spentOn: string; amount: number; category: BudgetCategory; comment: string; childId: BudgetChildId }
export type BudgetEntry = BudgetDraft & { id: string; createdAt: string; updatedAt: string }

type BudgetState = {
  entries: BudgetEntry[]
  storageStatus: StorageStatus
  create: (draft: BudgetDraft) => BudgetEntry | null
  update: (id: string, draft: BudgetDraft) => void
  remove: (id: string) => void
  clear: () => void
  hydrate: () => void
}

const unavailableStorage: SafeStorage = { getItem: () => null, setItem: () => false, removeItem: () => false, available: () => false }
function getStorage(): SafeStorage {
  if (typeof window === 'undefined') return unavailableStorage
  try { return createSafeStorage(window.localStorage) } catch { return unavailableStorage }
}

export function normalizeBudgetDraft(draft: BudgetDraft): BudgetDraft | null {
  const amount = Number(draft.amount)
  if (!isValidBirthDate(draft.spentOn) || !Number.isFinite(amount) || amount <= 0 || amount > 10_000_000 || !BUDGET_CATEGORIES.includes(draft.category) || !BUDGET_CHILD_IDS.includes(draft.childId)) return null
  const comment = draft.comment.trim()
  if (comment.length > 500) return null
  return { spentOn: draft.spentOn, amount: Math.round(amount * 100) / 100, category: draft.category, comment, childId: draft.childId }
}

export function parseStoredBudgetEntry(value: unknown): BudgetEntry | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string' || Number.isNaN(Date.parse(raw.createdAt)) || Number.isNaN(Date.parse(raw.updatedAt))) return null
  const draft = normalizeBudgetDraft({
    spentOn: typeof raw.spentOn === 'string' ? raw.spentOn : '',
    amount: typeof raw.amount === 'number' ? raw.amount : Number.NaN,
    category: raw.category as BudgetCategory,
    comment: typeof raw.comment === 'string' ? raw.comment : '',
    childId: typeof raw.childId === 'string' ? raw.childId as BudgetChildId : 'child-1',
  })
  return draft ? { ...draft, id: raw.id, createdAt: raw.createdAt, updatedAt: raw.updatedAt } : null
}

const storage = getStorage()
function readEntries(): BudgetEntry[] | null {
  const raw = storage.getItem(BUDGET_STORAGE_KEY)
  if (raw === null) return []
  try {
    const values = JSON.parse(raw)
    if (!Array.isArray(values)) return null
    const entries = values.map(parseStoredBudgetEntry)
    return entries.every((entry): entry is BudgetEntry => entry !== null) ? entries : null
  } catch { return null }
}
function persist(set: (state: Partial<BudgetState>) => void, entries: BudgetEntry[]) {
  const saved = storage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(entries))
  set({ entries, storageStatus: saved ? 'ready' : 'unsaved' })
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  entries: [],
  storageStatus: 'ready',
  create: (draft) => {
    const normalized = normalizeBudgetDraft(draft)
    if (!normalized) return null
    const timestamp = new Date().toISOString()
    const entry = { ...normalized, id: crypto.randomUUID(), createdAt: timestamp, updatedAt: timestamp }
    persist(set, [...get().entries, entry])
    return entry
  },
  update: (id, draft) => {
    const normalized = normalizeBudgetDraft(draft)
    if (!normalized) return
    persist(set, get().entries.map((entry) => entry.id === id ? { ...entry, ...normalized, updatedAt: new Date().toISOString() } : entry))
  },
  remove: (id) => persist(set, get().entries.filter((entry) => entry.id !== id)),
  clear: () => { storage.removeItem(BUDGET_STORAGE_KEY); set({ entries: [], storageStatus: 'ready' }) },
  hydrate: () => {
    if (get().storageStatus === 'unsaved') return
    if (!storage.available()) { set({ storageStatus: 'unsaved' }); return }
    const entries = readEntries()
    set(entries === null ? { entries: [], storageStatus: 'recovered' } : { entries, storageStatus: 'ready' })
  },
}))
