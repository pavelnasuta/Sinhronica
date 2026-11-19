import { beforeEach, describe, expect, it } from 'vitest'

import {
  ROLE_PROFILE_STORAGE_KEY,
  parsePersistedRoleProfile,
  useRoleProfileStore,
} from './role-profile-store'

describe('role profile store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useRoleProfileStore.setState({ profile: null })
  })

  it('stores a parent profile with its role under a versioned Sinhronica key', () => {
    const profile = {
      role: 'parent' as const,
      profile: { name: 'Елена', city: 'Казань', children: [{ id: 'child-1' as const, name: 'Алина', sportRank: 'II юношеский разряд' as const }] },
    }

    expect(useRoleProfileStore.getState().save(profile)).toBe(true)
    expect(useRoleProfileStore.getState().profile).toEqual(profile)
    expect(JSON.parse(window.localStorage.getItem(ROLE_PROFILE_STORAGE_KEY) ?? 'null')).toEqual({ version: 2, ...profile })
  })

  it('migrates an existing parent profile to one child with an unselected rank', () => {
    expect(parsePersistedRoleProfile(JSON.stringify({
      version: 1,
      role: 'parent',
      profile: { name: 'Елена', childName: 'Алина', childBirthDate: '2014-11-16', city: 'Казань' },
    }))).toEqual({
      role: 'parent',
      profile: {
        name: 'Елена',
        city: 'Казань',
        children: [{ id: 'child-1', name: 'Алина', sportRank: 'Не указан' }],
      },
    })
  })

  it('rejects a malformed saved role profile', () => {
    expect(parsePersistedRoleProfile(JSON.stringify({ version: 1, role: 'coach', profile: { name: '' } }))).toBeNull()
  })

  it('clears only the role profile key', () => {
    useRoleProfileStore.getState().save({ role: 'coach', profile: { name: 'Ольга' } })
    window.localStorage.setItem('other-product:key', 'keep')

    useRoleProfileStore.getState().clear()

    expect(window.localStorage.getItem(ROLE_PROFILE_STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem('other-product:key')).toBe('keep')
  })
})
