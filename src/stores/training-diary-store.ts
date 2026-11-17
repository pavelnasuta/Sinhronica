import { create } from 'zustand'

import { normalizeTrainingEntryDraft, type TrainingEntry, type TrainingEntryDraft } from '../features/training-diary/training-diary-types'
import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import type { StorageStatus } from './ideas-store'

export const TRAINING_DIARY_STORAGE_KEY = 'sinhronica:training-diary:v1'

type TrainingDiaryState = {
  entries: TrainingEntry[]
  storageStatus: StorageStatus
  create: (draft: TrainingEntryDraft) => TrainingEntry | null
  update: (id: string, draft: TrainingEntryDraft) => void
  remove: (id: string) => void
  clear: () => void
  hydrate: () => void
}

const unavailableStorage: SafeStorage = { getItem: () => null, setItem: () => false, removeItem: () => false, available: () => false }
const getStorage = (): SafeStorage => { try { return typeof window === 'undefined' ? unavailableStorage : createSafeStorage(window.localStorage) } catch { return unavailableStorage } }
const storage = getStorage()

export function parseStoredTrainingEntry(value: unknown): TrainingEntry | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string' || Number.isNaN(Date.parse(raw.createdAt)) || Number.isNaN(Date.parse(raw.updatedAt))) return null
  const draft = normalizeTrainingEntryDraft(raw)
  return draft ? { ...draft, id: raw.id, createdAt: raw.createdAt, updatedAt: raw.updatedAt } : null
}

function readEntries(): TrainingEntry[] | null {
  const serialized = storage.getItem(TRAINING_DIARY_STORAGE_KEY)
  if (serialized === null) return []
  try { const parsed = JSON.parse(serialized); if (!Array.isArray(parsed)) return null; const entries = parsed.map(parseStoredTrainingEntry); return entries.every((entry): entry is TrainingEntry => entry !== null) ? entries : null } catch { return null }
}

function persist(set: (state: Partial<TrainingDiaryState>) => void, entries: TrainingEntry[]) {
  const wasSaved = storage.setItem(TRAINING_DIARY_STORAGE_KEY, JSON.stringify(entries))
  set({ entries, storageStatus: wasSaved ? 'ready' : 'unsaved' })
}

function normalizeNewEntry(value: TrainingEntryDraft, existing?: TrainingEntry): TrainingEntry | null {
  const draft = normalizeTrainingEntryDraft(value)
  if (!draft) return null
  const timestamp = new Date().toISOString()
  return { ...draft, id: existing?.id ?? crypto.randomUUID(), createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp }
}

export const useTrainingDiaryStore = create<TrainingDiaryState>((set, get) => ({
  entries: [], storageStatus: 'ready',
  create: (draft) => { const entry = normalizeNewEntry(draft); if (!entry) return null; persist(set, [...get().entries, entry]); return entry },
  update: (id, draft) => { const current = get().entries.find((entry) => entry.id === id); const next = current && normalizeNewEntry(draft, current); if (next) persist(set, get().entries.map((entry) => entry.id === id ? next : entry)) },
  remove: (id) => persist(set, get().entries.filter((entry) => entry.id !== id)),
  clear: () => { storage.removeItem(TRAINING_DIARY_STORAGE_KEY); set({ entries: [], storageStatus: 'ready' }) },
  hydrate: () => { if (get().storageStatus === 'unsaved') return; if (!storage.available()) { set({ storageStatus: 'unsaved' }); return }; const entries = readEntries(); set(entries === null ? { entries: [], storageStatus: 'recovered' } : { entries, storageStatus: 'ready' }) },
}))
