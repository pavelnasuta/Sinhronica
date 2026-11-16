import { describe, expect, it } from 'vitest'

import { serializeUserData } from './user-data'

describe('user data export', () => {
  it('serializes a versioned local backup without unrelated browser data', () => {
    const profile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' as const }
    const achievement = { id: 'combo-april', performedOn: '2026-04-10', eventName: 'Кубок Федерации', discipline: 'combo' as const, score: 9.25, medal: 'gold' as const, createdAt: '2026-04-10T10:00:00.000Z', updatedAt: '2026-04-10T10:00:00.000Z' }
    const figureProgress = [{ figureCode: '106', status: 'learning' as const, updatedAt: '2026-11-16T00:00:00.000Z' }]
    const payload = JSON.parse(serializeUserData({ profile, ideas: [], achievements: [achievement], figureProgress, theme: 'dark' }))

    expect(payload).toMatchObject({
      version: 3,
      profile,
      ideas: [],
      achievements: [achievement],
      figureProgress,
      preferences: { theme: 'dark' },
    })
    expect(payload).toHaveProperty('exportedAt')
    expect(payload).not.toHaveProperty('other-product:key')
  })
})
