import { z } from 'zod'
import { create } from 'zustand'

import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import { athleteProfileSchema } from './athlete-profile-store'

export const ROLE_PROFILE_STORAGE_KEY = 'sinhronica:role-profile:v1'

export const USER_ROLES = ['athlete', 'parent', 'coach'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const PARENT_SPORT_RANKS = [
  'Не указан',
  'дельфиник',
  'III юношеский разряд',
  'II юношеский разряд',
  'I юношеский разряд',
  'III спортивный разряд',
  'II спортивный разряд',
  'I спортивный разряд',
  'КМС',
  'МС',
  'МСМК',
] as const

export const parentChildSchema = z.object({
  id: z.string().regex(/^child-[12]$/),
  name: z.string().trim().min(2).max(50),
  sportRank: z.enum(PARENT_SPORT_RANKS),
})

export const parentProfileSchema = z.object({
  name: z.string().trim().min(2).max(50),
  city: z.string().trim().min(2).max(80),
  children: z.array(parentChildSchema).min(1).max(2).superRefine((children, context) => {
    if (new Set(children.map((child) => child.id)).size !== children.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'У детей должны быть разные идентификаторы.' })
  }),
})

const legacyParentProfileSchema = z.object({
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
export type ParentChild = z.infer<typeof parentChildSchema>
export type CoachProfile = z.infer<typeof coachProfileSchema>

type PersistedRoleProfile = { version: 2 } & RoleProfile
type LegacyParentRoleProfile = { version: 1; role: 'parent'; profile: z.infer<typeof legacyParentProfileSchema> }

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
  try { return createSafeStorage(window.localStorage as BrowserStorage) } catch { return unavailableStorage }
}

function migrateLegacyParent(input: LegacyParentRoleProfile): RoleProfile {
  return {
    role: 'parent',
    profile: {
      name: input.profile.name,
      city: input.profile.city,
      children: [{ id: 'child-1', name: input.profile.childName, sportRank: 'Не указан' }],
    },
  }
}

export function parsePersistedRoleProfile(raw: string | null): RoleProfile | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    const current = z.object({ version: z.literal(2) }).and(roleProfileSchema).safeParse(parsed)
    if (current.success) {
      return { role: current.data.role, profile: current.data.profile } as RoleProfile
    }
    const legacy = z.object({ version: z.literal(1), role: z.literal('parent'), profile: legacyParentProfileSchema }).safeParse(parsed)
    return legacy.success ? migrateLegacyParent(legacy.data) : null
  } catch { return null }
}

const storage = getStorage()

export const useRoleProfileStore = create<RoleProfileState>((set) => ({
  profile: parsePersistedRoleProfile(storage.getItem(ROLE_PROFILE_STORAGE_KEY)),
  save: (input) => {
    const parsed = roleProfileSchema.safeParse(input)
    if (!parsed.success) return false
    const profile = parsed.data
    const persisted: PersistedRoleProfile = { version: 2, ...profile }
    if (!storage.setItem(ROLE_PROFILE_STORAGE_KEY, JSON.stringify(persisted))) return false
    set({ profile })
    return true
  },
  clear: () => { storage.removeItem(ROLE_PROFILE_STORAGE_KEY); set({ profile: null }) },
}))

export function roleLabel(role: UserRole): string {
  return role === 'athlete' ? 'Спортсменка' : role === 'parent' ? 'Родитель' : 'Тренер'
}
