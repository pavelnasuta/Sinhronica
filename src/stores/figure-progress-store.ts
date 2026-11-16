import { create } from 'zustand'

import { getFigureByCode } from '../features/figures/figures-catalog'
import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import type { StorageStatus } from './ideas-store'

export const FIGURE_PROGRESS_STORAGE_KEY = 'sinhronica:figure-progress:v1'

export type FigureProgressStatus = 'learning' | 'improving' | 'mastered'

export type FigureProgress = {
  figureCode: string
  status: FigureProgressStatus
  updatedAt: string
}

type FigureProgressState = {
  progress: FigureProgress[]
  storageStatus: StorageStatus
  setStatus: (figureCode: string, status: FigureProgressStatus) => FigureProgress | null
  clear: () => void
  hydrate: () => void
}

const unavailableStorage: SafeStorage = {
  getItem: () => null,
  setItem: () => false,
  removeItem: () => false,
  available: () => false,
}

function getStorage(): SafeStorage {
  if (typeof window === 'undefined') return unavailableStorage
  try {
    return createSafeStorage(window.localStorage)
  } catch {
    return unavailableStorage
  }
}

const storage = getStorage()

function isStatus(value: unknown): value is FigureProgressStatus {
  return value === 'learning' || value === 'improving' || value === 'mastered'
}

function parseProgress(value: unknown): FigureProgress | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (typeof raw.figureCode !== 'string' || !isStatus(raw.status) || typeof raw.updatedAt !== 'string' || Number.isNaN(Date.parse(raw.updatedAt)) || !getFigureByCode(raw.figureCode)) return null
  return { figureCode: raw.figureCode, status: raw.status, updatedAt: raw.updatedAt }
}

function readProgress(): FigureProgress[] | null {
  const serialized = storage.getItem(FIGURE_PROGRESS_STORAGE_KEY)
  if (serialized === null) return []
  try {
    const parsed = JSON.parse(serialized)
    if (!Array.isArray(parsed)) return null
    const progress = parsed.map(parseProgress)
    return progress.every((record): record is FigureProgress => record !== null) ? progress : null
  } catch {
    return null
  }
}

function persist(set: (state: Partial<FigureProgressState>) => void, progress: FigureProgress[]) {
  const wasSaved = storage.setItem(FIGURE_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  set({ progress, storageStatus: wasSaved ? 'ready' : 'unsaved' })
}

export const useFigureProgressStore = create<FigureProgressState>((set, get) => ({
  progress: [],
  storageStatus: 'ready',
  setStatus: (figureCode, status) => {
    if (!getFigureByCode(figureCode)) return null
    const record: FigureProgress = { figureCode, status, updatedAt: new Date().toISOString() }
    const existing = get().progress.filter((item) => item.figureCode !== figureCode)
    persist(set, [...existing, record])
    return record
  },
  clear: () => {
    storage.removeItem(FIGURE_PROGRESS_STORAGE_KEY)
    set({ progress: [], storageStatus: 'ready' })
  },
  hydrate: () => {
    if (get().storageStatus === 'unsaved') return
    if (!storage.available()) {
      set({ storageStatus: 'unsaved' })
      return
    }
    const progress = readProgress()
    set(progress === null ? { progress: [], storageStatus: 'recovered' } : { progress, storageStatus: 'ready' })
  },
}))
