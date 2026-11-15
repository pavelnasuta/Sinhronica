import { z } from 'zod'
import { create } from 'zustand'

import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'

const STORAGE_KEY = 'sinhronica:athlete-profile:v1'

export const athleteProfileSchema = z.object({
  name: z.string().trim().min(2).max(50),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().trim().min(2).max(80),
})

export type AthleteProfile = z.infer<typeof athleteProfileSchema>

type PersistedProfile = { version: 1; profile: AthleteProfile }

type AthleteProfileState = {
  profile: AthleteProfile | null
  save: (profile: AthleteProfile) => boolean
}

type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const unavailableStorage: SafeStorage = {
  getItem: () => null,
  setItem: () => false,
  removeItem: () => false,
  available: () => false,
}

function getStorage(): SafeStorage {
  if (typeof window === 'undefined') return unavailableStorage

  try {
    return createSafeStorage(window.localStorage as BrowserStorage)
  } catch {
    return unavailableStorage
  }
}

function readProfile(storage: SafeStorage): AthleteProfile | null {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const saved = z.object({ version: z.literal(1), profile: athleteProfileSchema }).safeParse(JSON.parse(raw))
    return saved.success ? saved.data.profile : null
  } catch {
    return null
  }
}

function parseBirthDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null

  return { year, month, day }
}

export function isValidBirthDate(value: string, now = new Date()): boolean {
  const birthDate = parseBirthDate(value)
  if (!birthDate || birthDate.year < 1900) return false

  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Date.UTC(birthDate.year, birthDate.month - 1, birthDate.day) <= today
}

export function calculateAge(value: string, now = new Date()): number | null {
  const birthDate = parseBirthDate(value)
  if (!birthDate || !isValidBirthDate(value, now)) return null

  let age = now.getFullYear() - birthDate.year
  if (now.getMonth() + 1 < birthDate.month || (now.getMonth() + 1 === birthDate.month && now.getDate() < birthDate.day)) age -= 1
  return age
}

const storage = getStorage()

export const useAthleteProfileStore = create<AthleteProfileState>((set) => ({
  profile: readProfile(storage),
  save: (input) => {
    const parsed = athleteProfileSchema.safeParse(input)
    if (!parsed.success || !isValidBirthDate(parsed.data.birthDate)) return false

    const profile = parsed.data
    const persisted: PersistedProfile = { version: 1, profile }
    if (!storage.setItem(STORAGE_KEY, JSON.stringify(persisted))) return false

    set({ profile })
    return true
  },
}))
