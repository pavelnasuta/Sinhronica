import { z } from 'zod'
import { create } from 'zustand'

import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import { athleteProfileSchema, isValidBirthDate } from './athlete-profile-store'

export const ROLE_PROFILE_STORAGE_KEY = 'sinhronica:role-profile:v1'

export const USER_ROLES = ['athlete', 'parent', 'coach'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const parentProfileSchema = z.object({
  name: z.string().trim().min(2).max(50),
  childName: z.string().trim().min(2).max(50),
  childBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().trim().min(2).max(80),
})

export const coachProfileSchema = z.object({
  name: z.string().trim().min(2).max(50),
})

export const roleProfileSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('athlete'), profile: athleteProfileSchema }),
  z.object({ role: z.literal('parent'), profile: parentProfileSchema }),
  z.object({ role: z.literal('coach'), profile: coachProfileSchema }),
])

export type RoleProfile = z.infer<typeof roleProfileSchema>
export type ParentProfile = z.infer<typeof parentProfileSchema>
export type CoachProfile = z.infer<typeof coachProfileSchema>

type PersistedRoleProfile = { version: 1 } & RoleProfile

type RoleProfileState = {
  profile: RoleProfile | null
  save: (profile: RoleProfile) => boolean
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

function hasValidBirthDates(profile: RoleProfile, now = new Date()): boolean {
  if (profile.role === 'athlete') return isValidBirthDate(profile.profile.birthDate, now)
  return profile.role !== 'parent' || isValidBirthDate(profile.profile.childBirthDate, now)
}

export function parsePersistedRoleProfile(raw: string | null, now = new Date()): RoleProfile | null {
  if (!raw) return null

  try {
    const saved = z.object({ version: z.literal(1) }).and(roleProfileSchema).safeParse(JSON.parse(raw))
    return saved.success && hasValidBirthDates(saved.data, now) ? saved.data : null
  } catch {
    return null
  }
}

const storage = getStorage()

export const useRoleProfileStore = create<RoleProfileState>((set) => ({
  profile: parsePersistedRoleProfile(storage.getItem(ROLE_PROFILE_STORAGE_KEY)),
  save: (input) => {
    const parsed = roleProfileSchema.safeParse(input)
    if (!parsed.success || !hasValidBirthDates(parsed.data)) return false

    const profile = parsed.data
    const persisted: PersistedRoleProfile = { version: 1, ...profile }
    if (!storage.setItem(ROLE_PROFILE_STORAGE_KEY, JSON.stringify(persisted))) return false

    set({ profile })
    return true
  },
  clear: () => {
    storage.removeItem(ROLE_PROFILE_STORAGE_KEY)
    set({ profile: null })
  },
}))

export function roleLabel(role: UserRole): string {
  return role === 'athlete' ? 'Спортсменка' : role === 'parent' ? 'Родитель' : 'Тренер'
}
