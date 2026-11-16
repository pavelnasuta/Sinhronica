import { describe, expect, it } from 'vitest'

import { calculateDraftDifficulty, formatRoutineTime, normalizeRoutineBlockDraft, normalizeRoutineDraft } from './routine-utils'

describe('routine drafts', () => {
  it('normalizes a valid local routine card', () => {
    expect(normalizeRoutineDraft({ title: '  Лазурь ', context: 'training', discipline: 'group', programType: 'free', ageGroup: 'Девушки 13–15 лет', activeAthleteCount: '8', reserveAthleteCount: '2', athleteNames: ' Аня, Маша ', targetDurationSeconds: '180', generalNote: '  Проверить выход ' })).toEqual({ title: 'Лазурь', context: 'training', discipline: 'group', programType: 'free', ageGroup: 'Девушки 13–15 лет', activeAthleteCount: 8, reserveAthleteCount: 2, athleteNames: ['Аня', 'Маша'], targetDurationSeconds: 180, generalNote: 'Проверить выход' })
  })

  it('keeps manual difficulty only for elements and validates block timing', () => {
    expect(normalizeRoutineBlockDraft({ type: 'element', title: 'Гибрид', startSecond: '30', endSecond: '45', manualDifficulty: '3,2', note: 'Чисто' })).toEqual({ type: 'element', title: 'Гибрид', startSecond: 30, endSecond: 45, manualDifficulty: 3.2, note: 'Чисто' })
    expect(normalizeRoutineBlockDraft({ type: 'transition', title: 'Переход', manualDifficulty: '3.2' })).toEqual({ type: 'transition', title: 'Переход' })
    expect(normalizeRoutineBlockDraft({ type: 'element', title: 'X', startSecond: '30', endSecond: '20' })).toBeNull()
  })

  it('formats timeline time and totals manual element complexity', () => {
    expect(formatRoutineTime(75)).toBe('1:15')
    expect(calculateDraftDifficulty([{ id: 'a', type: 'element', title: 'A', manualDifficulty: 1.2 }, { id: 'b', type: 'transition', title: 'Переход' }, { id: 'c', type: 'element', title: 'B', manualDifficulty: 2.3 }])).toBe(3.5)
  })
})
