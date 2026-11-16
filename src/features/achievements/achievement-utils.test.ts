import { describe, expect, it } from 'vitest'

import type { Achievement } from './achievement-types'
import { getPreviousAchievement, getScoreChange, normalizeAchievementDraft, sortAchievements } from './achievement-utils'

function achievement(overrides: Partial<Achievement>): Achievement {
  return {
    id: 'record',
    performedOn: '2026-03-05',
    eventName: 'Кубок Федерации',
    discipline: 'combo',
    score: 8,
    medal: 'none',
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z',
    ...overrides,
  }
}

describe('achievement chronology', () => {
  it('sorts results by performance date instead of addition time', () => {
    const records = [
      achievement({ id: 'march', performedOn: '2026-03-05', score: 8, createdAt: '2026-04-20T10:00:00.000Z' }),
      achievement({ id: 'april', performedOn: '2026-04-10', score: 9.25, createdAt: '2026-04-01T10:00:00.000Z' }),
      achievement({ id: 'january', performedOn: '2026-01-15', discipline: 'figures', score: 7.8 }),
    ]

    expect(sortAchievements(records).map((record) => record.id)).toEqual(['april', 'march', 'january'])
  })

  it('compares a result with the nearest earlier result in the same discipline', () => {
    const march = achievement({ id: 'march', performedOn: '2026-03-05', score: 8 })
    const april = achievement({ id: 'april', performedOn: '2026-04-10', score: 9.25 })
    const february = achievement({ id: 'february', performedOn: '2026-02-02', score: 6.5, createdAt: '2026-05-01T10:00:00.000Z' })

    expect(getPreviousAchievement(april, [march, april, february])).toMatchObject({ id: 'march' })
    expect(getScoreChange(april, [march, april, february])).toEqual({ direction: 'up', difference: 1.25 })
  })

  it('reports equal score without a direction and excludes same-day results', () => {
    const march = achievement({ id: 'march', performedOn: '2026-03-05', score: 8 })
    const sameDate = achievement({ id: 'same-day', performedOn: '2026-03-05', score: 7.5, createdAt: '2026-03-05T11:00:00.000Z' })
    const april = achievement({ id: 'april', performedOn: '2026-04-10', score: 8 })

    expect(getScoreChange(april, [march, sameDate, april])).toEqual({ direction: 'same', difference: 0 })
    expect(getScoreChange(march, [march, sameDate, april])).toBeNull()
  })

  it('normalizes custom discipline names before comparison', () => {
    const older = achievement({ id: 'older', performedOn: '2026-03-05', discipline: 'custom', customDiscipline: ' Аква-шоу ', score: 7 })
    const newer = achievement({ id: 'newer', performedOn: '2026-04-10', discipline: 'custom', customDiscipline: 'аква-шоу', score: 7.5 })

    expect(getScoreChange(newer, [older, newer])).toEqual({ direction: 'up', difference: 0.5 })
  })

  it('keeps score precision through thousandths', () => {
    const normalized = normalizeAchievementDraft({ performedOn: '2026-04-10', eventName: 'Кубок Федерации', discipline: 'combo', score: 9.123, medal: 'gold' })

    expect(normalized).toMatchObject({ score: 9.123 })
    expect(getScoreChange(achievement({ id: 'newer', performedOn: '2026-04-10', score: 9.123 }), [achievement({ id: 'older', score: 8.001 }), achievement({ id: 'newer', performedOn: '2026-04-10', score: 9.123 })])).toEqual({ direction: 'up', difference: 1.122 })
  })
})
