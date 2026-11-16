import { describe, expect, it } from 'vitest'

import { serializeUserData } from './user-data'

describe('user data export', () => {
  it('serializes a versioned local backup without unrelated browser data', () => {
    const profile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' as const }
    const payload = JSON.parse(serializeUserData({ profile, ideas: [], theme: 'dark' }))

    expect(payload).toMatchObject({
      version: 1,
      profile,
      ideas: [],
      preferences: { theme: 'dark' },
    })
    expect(payload).toHaveProperty('exportedAt')
    expect(payload).not.toHaveProperty('other-product:key')
  })
})
