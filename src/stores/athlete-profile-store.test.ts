import { beforeEach, describe, expect, it } from 'vitest'

import {
  ATHLETE_PROFILE_STORAGE_KEY,
  calculateAge,
  formatLocalDate,
  parseLegacyPersistedProfile,
  parsePersistedProfile,
  useAthleteProfileStore,
} from './athlete-profile-store'

const STORAGE_KEY = ATHLETE_PROFILE_STORAGE_KEY

describe('athlete profile store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useAthleteProfileStore.setState({ profile: null })
  })

  it('calculates the age from the birth date without advancing before the birthday', () => {
    expect(calculateAge('2014-11-16', new Date('2026-11-15T12:00:00'))).toBe(11)
    expect(calculateAge('2014-11-15', new Date('2026-11-15T12:00:00'))).toBe(12)
  })

  it('rejects future and impossible birth dates when reading persisted data', () => {
    const profile = { name: 'Алина', city: 'Казань' }
    const now = new Date('2026-11-15T12:00:00')

    expect(parsePersistedProfile(JSON.stringify({ version: 1, profile: { ...profile, birthDate: '2026-11-16' } }), now)).toBeNull()
    expect(parsePersistedProfile(JSON.stringify({ version: 1, profile: { ...profile, birthDate: '2014-02-30' } }), now)).toBeNull()
  })

  it('formats the input max date from local date fields instead of UTC serialization', () => {
    const localDate = Object.assign(new Date('2026-11-15T12:00:00'), {
      toISOString: () => '2026-11-14T23:00:00.000Z',
    })

    expect(formatLocalDate(localDate)).toBe('2026-11-15')
  })

  it('stores the athlete profile with the selected sport rank under a versioned Sinhronica key', () => {
    const profile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' as const }

    expect(useAthleteProfileStore.getState().save(profile)).toBe(true)
    expect(useAthleteProfileStore.getState().profile).toEqual({ ...profile, manualSportRank: 'дельфиник' })
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({ version: 3, profile: { ...profile, manualSportRank: 'дельфиник' } })
    expect(window.localStorage.getItem('sinhronica:athlete-profile:v1')).toBeNull()
    expect(window.localStorage.getItem('mvp-pwa-starter:preferences:v1')).toBeNull()
  })

  it('keeps a valid legacy profile readable so it can request the missing sport rank', () => {
    const legacyProfile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань' }

    expect(parseLegacyPersistedProfile(JSON.stringify({ version: 1, profile: legacyProfile }))).toEqual(legacyProfile)
  })

  it('clears only the athlete profile key', () => {
    useAthleteProfileStore.getState().save({ name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' })
    window.localStorage.setItem('other-product:key', 'keep')

    useAthleteProfileStore.getState().clear()

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem('other-product:key')).toBe('keep')
    expect(useAthleteProfileStore.getState().profile).toBeNull()
  })
})
