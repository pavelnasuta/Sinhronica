import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ACHIEVEMENTS_STORAGE_KEY, useAchievementsStore } from './achievements-store'
import { useAthleteProfileStore } from './athlete-profile-store'
import { useRoleProfileStore } from './role-profile-store'

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
  useAthleteProfileStore.setState({ profile: null })
  useRoleProfileStore.setState({ profile: null })
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

  it('persists an optional awarded sport rank with an achievement', () => {
    const created = useAchievementsStore.getState().create({ ...draft, awardedRank: 'I спортивный разряд' })

    expect(created).toMatchObject({ awardedRank: 'I спортивный разряд' })
    expect(JSON.parse(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY) ?? '[]')).toEqual([expect.objectContaining({ awardedRank: 'I спортивный разряд' })])
  })

  it('recalculates the athlete rank after editing and deleting verified awards without lowering a manual rank', () => {
    useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'МС', manualSportRank: 'МС' } })
    const higher = useAchievementsStore.getState().create({ ...draft, awardedRank: 'КМС' })
    const lower = useAchievementsStore.getState().create({ ...draft, eventName: 'Весенний старт', awardedRank: 'I спортивный разряд' })
    if (!higher || !lower) throw new Error('expected awards')

    expect(useAthleteProfileStore.getState().profile).toMatchObject({ sportRank: 'МС', verifiedAwardRank: 'КМС' })
    useAchievementsStore.getState().update(higher.id, { ...draft, awardedRank: 'I спортивный разряд' })
    expect(useAthleteProfileStore.getState().profile).toMatchObject({ sportRank: 'МС', verifiedAwardRank: 'I спортивный разряд' })
    useAchievementsStore.getState().remove(lower.id)
    useAchievementsStore.getState().remove(higher.id)
    expect(useAthleteProfileStore.getState().profile).toMatchObject({ sportRank: 'МС' })
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
