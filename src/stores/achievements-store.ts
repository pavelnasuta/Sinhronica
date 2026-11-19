import { create } from 'zustand'

import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import type { Achievement, AchievementDraft } from '../features/achievements/achievement-types'
import { normalizeAchievementDraft } from '../features/achievements/achievement-utils'
import type { StorageStatus } from './ideas-store'

export const ACHIEVEMENTS_STORAGE_KEY = 'sinhronica:achievements:v1'

type AchievementsState = {
  achievements: Achievement[]
  storageStatus: StorageStatus
  create: (draft: AchievementDraft) => Achievement | null
  update: (id: string, draft: AchievementDraft) => void
  remove: (id: string) => void
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

export function parseStoredAchievement(value: unknown): Achievement | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string' || Number.isNaN(Date.parse(raw.createdAt)) || Number.isNaN(Date.parse(raw.updatedAt))) return null
  const normalized = normalizeAchievementDraft({
    performedOn: typeof raw.performedOn === 'string' ? raw.performedOn : '',
    eventName: typeof raw.eventName === 'string' ? raw.eventName : '',
    discipline: typeof raw.discipline === 'string' ? raw.discipline as AchievementDraft['discipline'] : 'figures',
    customDiscipline: typeof raw.customDiscipline === 'string' ? raw.customDiscipline : undefined,
    score: typeof raw.score === 'number' ? raw.score : Number.NaN,
    medal: typeof raw.medal === 'string' ? raw.medal as AchievementDraft['medal'] : 'none',
    childId: raw.childId === 'child-1' || raw.childId === 'child-2' ? raw.childId : undefined,
  })
  return normalized ? { ...normalized, id: raw.id, createdAt: raw.createdAt, updatedAt: raw.updatedAt } : null
}

function readAchievements(): Achievement[] | null {
  const serialized = storage.getItem(ACHIEVEMENTS_STORAGE_KEY)
  if (serialized === null) return []
  try {
    const parsed = JSON.parse(serialized)
    if (!Array.isArray(parsed)) return null
    const records = parsed.map(parseStoredAchievement)
    return records.every((record): record is Achievement => record !== null) ? records : null
  } catch {
    return null
  }
}

function persist(set: (state: Partial<AchievementsState>) => void, achievements: Achievement[]) {
  const wasSaved = storage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements))
  set({ achievements, storageStatus: wasSaved ? 'ready' : 'unsaved' })
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  achievements: [],
  storageStatus: 'ready',
  create: (draft) => {
    const normalized = normalizeAchievementDraft(draft)
    if (!normalized) return null
    const timestamp = new Date().toISOString()
    const achievement: Achievement = { ...normalized, id: crypto.randomUUID(), createdAt: timestamp, updatedAt: timestamp }
    persist(set, [...get().achievements, achievement])
    return achievement
  },
  update: (id, draft) => {
    const normalized = normalizeAchievementDraft(draft)
    if (!normalized) return
    const timestamp = new Date().toISOString()
    persist(set, get().achievements.map((achievement) => achievement.id === id ? { ...achievement, ...normalized, updatedAt: timestamp } : achievement))
  },
  remove: (id) => persist(set, get().achievements.filter((achievement) => achievement.id !== id)),
  clear: () => {
    storage.removeItem(ACHIEVEMENTS_STORAGE_KEY)
    set({ achievements: [], storageStatus: 'ready' })
  },
  hydrate: () => {
    if (get().storageStatus === 'unsaved') return
    if (!storage.available()) {
      set({ storageStatus: 'unsaved' })
      return
    }
    const achievements = readAchievements()
    set(achievements === null ? { achievements: [], storageStatus: 'recovered' } : { achievements, storageStatus: 'ready' })
  },
}))
