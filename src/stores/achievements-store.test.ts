import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ACHIEVEMENTS_STORAGE_KEY, useAchievementsStore } from './achievements-store'

const draft = {
  performedOn: '2026-04-10',
  eventName: '  Кубок Федерации  ',
  discipline: 'combo' as const,
  score: 9.25,
  medal: 'gold' as const,
}

beforeEach(() => {
  localStorage.clear()
  useAchievementsStore.setState({ achievements: [], storageStatus: 'ready' })
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('useAchievementsStore', () => {
  it('persists a created achievement and restores it on hydration', () => {
    const created = useAchievementsStore.getState().create(draft)

    expect(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY)).toContain('Кубок Федерации')
    useAchievementsStore.setState({ achievements: [] })
    useAchievementsStore.getState().hydrate()

    expect(useAchievementsStore.getState().achievements).toContainEqual(expect.objectContaining({ id: created?.id, eventName: 'Кубок Федерации', score: 9.25 }))
  })

  it('updates without changing id or creation timestamp', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-10T10:00:00.000Z'))
    const created = useAchievementsStore.getState().create(draft)
    if (!created) throw new Error('expected record')

    vi.setSystemTime(new Date('2026-04-11T10:00:00.000Z'))
    useAchievementsStore.getState().update(created.id, { ...draft, score: 9.5, medal: 'silver' })

    expect(useAchievementsStore.getState().achievements).toEqual([expect.objectContaining({ id: created.id, createdAt: created.createdAt, updatedAt: '2026-04-11T10:00:00.000Z', score: 9.5, medal: 'silver' })])
  })

  it('clears only achievement data', () => {
    useAchievementsStore.getState().create(draft)
    localStorage.setItem('foreign:key', 'keep')

    useAchievementsStore.getState().clear()

    expect(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem('foreign:key')).toBe('keep')
  })

  it('recovers with an empty list when saved data is malformed', () => {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify([{ performedOn: 'future' }]))

    useAchievementsStore.getState().hydrate()

    expect(useAchievementsStore.getState().achievements).toEqual([])
    expect(useAchievementsStore.getState().storageStatus).toBe('recovered')
  })
})
