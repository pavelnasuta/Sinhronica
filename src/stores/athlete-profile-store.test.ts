import { beforeEach, describe, expect, it } from 'vitest'

import { calculateAge, useAthleteProfileStore } from './athlete-profile-store'

const STORAGE_KEY = 'sinhronica:athlete-profile:v1'

describe('athlete profile store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useAthleteProfileStore.setState({ profile: null })
  })

  it('calculates the age from the birth date without advancing before the birthday', () => {
    expect(calculateAge('2014-11-16', new Date('2026-11-15T12:00:00'))).toBe(11)
    expect(calculateAge('2014-11-15', new Date('2026-11-15T12:00:00'))).toBe(12)
  })

  it('stores the athlete profile only under the Sinhronica local key', () => {
    const profile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань' }

    expect(useAthleteProfileStore.getState().save(profile)).toBe(true)
    expect(useAthleteProfileStore.getState().profile).toEqual(profile)
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({ version: 1, profile })
    expect(window.localStorage.getItem('mvp-pwa-starter:preferences:v1')).toBeNull()
  })
})
