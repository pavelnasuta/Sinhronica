import { create } from 'zustand'

import { normalizeRoutineBlockDraft, normalizeRoutineDraft, type Routine, type RoutineBlock, type RoutineDraft } from '../features/routines/routine-types'
import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import type { StorageStatus } from './ideas-store'

export const ROUTINES_STORAGE_KEY = 'sinhronica:routines:v1'

type RoutinesState = {
  routines: Routine[]
  storageStatus: StorageStatus
  create: (draft: RoutineDraft) => Routine | null
  update: (id: string, draft: RoutineDraft) => void
  remove: (id: string) => void
  clear: () => void
  hydrate: () => void
}

const unavailableStorage: SafeStorage = { getItem: () => null, setItem: () => false, removeItem: () => false, available: () => false }
const getStorage = (): SafeStorage => { try { return typeof window === 'undefined' ? unavailableStorage : createSafeStorage(window.localStorage) } catch { return unavailableStorage } }
const storage = getStorage()

function normalizeBlocks(value: unknown): RoutineBlock[] | null {
  if (!Array.isArray(value)) return null
  const blocks: RoutineBlock[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>
    const normalized = normalizeRoutineBlockDraft(record)
    if (!normalized) return null
    blocks.push({ ...normalized, id: typeof record.id === 'string' && record.id ? record.id : crypto.randomUUID() })
  }
  return blocks
}

function normalizeStoredRoutine(value: unknown): Routine | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string' || Number.isNaN(Date.parse(raw.createdAt)) || Number.isNaN(Date.parse(raw.updatedAt))) return null
  const draft = normalizeRoutineDraft(raw)
  const blocks = normalizeBlocks(raw.blocks)
  return draft && blocks ? { ...draft, blocks, id: raw.id, createdAt: raw.createdAt, updatedAt: raw.updatedAt } : null
}

function readRoutines(): Routine[] | null {
  const serialized = storage.getItem(ROUTINES_STORAGE_KEY)
  if (serialized === null) return []
  try { const parsed = JSON.parse(serialized); if (!Array.isArray(parsed)) return null; const routines = parsed.map(normalizeStoredRoutine); return routines.every((routine): routine is Routine => routine !== null) ? routines : null } catch { return null }
}

function persist(set: (state: Partial<RoutinesState>) => void, routines: Routine[]) {
  const wasSaved = storage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines))
  set({ routines, storageStatus: wasSaved ? 'ready' : 'unsaved' })
}

function normalizeNewRoutine(draftValue: RoutineDraft, existing?: Routine): Routine | null {
  const draft = normalizeRoutineDraft(draftValue)
  const blocks = normalizeBlocks(draftValue.blocks ?? [])
  if (!draft || !blocks) return null
  const timestamp = new Date().toISOString()
  return { ...draft, blocks, id: existing?.id ?? crypto.randomUUID(), createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp }
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  routines: [], storageStatus: 'ready',
  create: (draft) => { const routine = normalizeNewRoutine(draft); if (!routine) return null; persist(set, [...get().routines, routine]); return routine },
  update: (id, draft) => { const current = get().routines.find((routine) => routine.id === id); const next = current && normalizeNewRoutine(draft, current); if (next) persist(set, get().routines.map((routine) => routine.id === id ? next : routine)) },
  remove: (id) => persist(set, get().routines.filter((routine) => routine.id !== id)),
  clear: () => { storage.removeItem(ROUTINES_STORAGE_KEY); set({ routines: [], storageStatus: 'ready' }) },
  hydrate: () => { if (get().storageStatus === 'unsaved') return; if (!storage.available()) { set({ storageStatus: 'unsaved' }); return }; const routines = readRoutines(); set(routines === null ? { routines: [], storageStatus: 'recovered' } : { routines, storageStatus: 'ready' }) },
}))
