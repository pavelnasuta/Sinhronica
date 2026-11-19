import { z } from 'zod'
import { create } from 'zustand'

import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import { highestSportRank, SPORT_RANKS, type SportRank } from './sport-ranks'

export { SPORT_RANKS } from './sport-ranks'
export const ATHLETE_PROFILE_STORAGE_KEY = 'sinhronica:athlete-profile:v3'
const LEGACY_STORAGE_KEYS = ['sinhronica:athlete-profile:v2', 'sinhronica:athlete-profile:v1']

export const athleteProfileSchema = z.object({
  name: z.string().trim().min(2).max(50),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().trim().min(2).max(80),
  sportRank: z.enum(SPORT_RANKS),
  manualSportRank: z.enum(SPORT_RANKS).optional(),
  verifiedAwardRank: z.enum(SPORT_RANKS).optional(),
})

const legacyAthleteProfileSchema = athleteProfileSchema.omit({ sportRank: true })

export type AthleteProfile = z.infer<typeof athleteProfileSchema>
export type LegacyAthleteProfile = z.infer<typeof legacyAthleteProfileSchema>
export type StoredAthleteProfile = AthleteProfile | LegacyAthleteProfile

type PersistedProfile = { version: 3; profile: AthleteProfile }

type AthleteProfileState = {
  profile: StoredAthleteProfile | null
  save: (profile: AthleteProfile) => boolean
  syncAwardRank: (rank: SportRank | undefined) => boolean
  clear: () => void
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

function readProfile(storage: SafeStorage): StoredAthleteProfile | null {
  return parsePersistedProfile(storage.getItem(ATHLETE_PROFILE_STORAGE_KEY))
    ?? parsePersistedProfile(storage.getItem(LEGACY_STORAGE_KEYS[0]))
    ?? parseLegacyPersistedProfile(storage.getItem(LEGACY_STORAGE_KEYS[1]))
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

export function formatLocalDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parsePersistedProfile(raw: string | null, now = new Date()): AthleteProfile | null {
  if (!raw) return null

  try {
    const saved = z.object({ version: z.union([z.literal(2), z.literal(3)]), profile: athleteProfileSchema }).safeParse(JSON.parse(raw))
    if (!saved.success || !isValidBirthDate(saved.data.profile.birthDate, now)) return null
    const manualSportRank = saved.data.profile.manualSportRank ?? saved.data.profile.sportRank
    const sportRank = highestSportRank([manualSportRank, saved.data.profile.verifiedAwardRank]) ?? manualSportRank
    return { ...saved.data.profile, sportRank, manualSportRank }
  } catch {
    return null
  }
}

export function parseLegacyPersistedProfile(raw: string | null, now = new Date()): LegacyAthleteProfile | null {
  if (!raw) return null

  try {
    const saved = z.object({ version: z.literal(1), profile: legacyAthleteProfileSchema }).safeParse(JSON.parse(raw))
    return saved.success && isValidBirthDate(saved.data.profile.birthDate, now) ? saved.data.profile : null
  } catch {
    return null
  }
}

export function hasSportRank(profile: StoredAthleteProfile): profile is AthleteProfile {
  return 'sportRank' in profile
}

export function calculateAge(value: string, now = new Date()): number | null {
  const birthDate = parseBirthDate(value)
  if (!birthDate || !isValidBirthDate(value, now)) return null

  let age = now.getFullYear() - birthDate.year
  if (now.getMonth() + 1 < birthDate.month || (now.getMonth() + 1 === birthDate.month && now.getDate() < birthDate.day)) age -= 1
  return age
}

const storage = getStorage()

function saveProfile(storage: SafeStorage, set: (state: Pick<AthleteProfileState, 'profile'>) => void, input: AthleteProfile): boolean {
  const parsed = athleteProfileSchema.safeParse(input)
  if (!parsed.success || !isValidBirthDate(parsed.data.birthDate)) return false
  const manualSportRank = parsed.data.manualSportRank ?? parsed.data.sportRank
  const profile = { ...parsed.data, manualSportRank, sportRank: highestSportRank([manualSportRank, parsed.data.verifiedAwardRank]) ?? manualSportRank }
  const persisted: PersistedProfile = { version: 3, profile }
  if (!storage.setItem(ATHLETE_PROFILE_STORAGE_KEY, JSON.stringify(persisted))) return false
  LEGACY_STORAGE_KEYS.forEach((key) => storage.removeItem(key))
  set({ profile })
  return true
}

export const useAthleteProfileStore = create<AthleteProfileState>((set, get) => ({
  profile: readProfile(storage),
  save: (input) => saveProfile(storage, set, input),
  syncAwardRank: (verifiedAwardRank) => {
    const current = get().profile
    if (!current || !hasSportRank(current)) return false
    return saveProfile(storage, set, { ...current, verifiedAwardRank, manualSportRank: current.manualSportRank ?? current.sportRank })
  },
  clear: () => {
    storage.removeItem(ATHLETE_PROFILE_STORAGE_KEY)
    LEGACY_STORAGE_KEYS.forEach((key) => storage.removeItem(key))
    set({ profile: null })
  },
}))
