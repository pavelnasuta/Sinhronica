import { describe, expect, it } from 'vitest'

import { calculateFigure, calculateFigureSet, formatScore } from './figure-scoring'

describe('figure scoring', () => {
  it('uses the required calculated fifth score for a four-judge panel', () => {
    const outcome = calculateFigure({ judgeCount: 4, scores: ['5.0', '6.0', '7.0', '9.0'], dd: '2.0' })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok || !outcome.value.average) return
    expect(formatScore(outcome.value.calculatedFifthScore!, 2)).toBe('6,75')
    expect(formatScore(outcome.value.average, 6)).toBe('6,583333')
    expect(formatScore(outcome.value.weightedScore, 6)).toBe('13,166667')
  })

  it('replaces exactly one missing judge score before applying the five-judge algorithm', () => {
    const outcome = calculateFigure({ judgeCount: 5, scores: ['7,0', '7,1', '7,4', '7,4', null], dd: '2,0' })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok || !outcome.value.average) return
    expect(formatScore(outcome.value.replacementScore!, 1)).toBe('7,2')
    expect(formatScore(outcome.value.average, 6)).toBe('7,233333')
    expect(formatScore(outcome.value.weightedScore, 6)).toBe('14,466667')
  })

  it('matches the official four-figure result and applies penalties after normalization', () => {
    const figures = [
      { judgeCount: 6 as const, scores: ['7.3', '7.1', '6.7', '7.3', '6.8', '7.0'], dd: '2.2' },
      { judgeCount: 6 as const, scores: ['7.6', '7.7', '7.5', '7.7', '7.5', '7.6'], dd: '2.2' },
      { judgeCount: 6 as const, scores: ['7.2', '7.0', '7.2', '7.3', '7.3', '7.4'], dd: '2.2' },
      { judgeCount: 6 as const, scores: ['7.1', '7.1', '7.0', '7.3', '7.3', '7.5'], dd: '2.4' },
    ]

    const initial = calculateFigureSet({ figures, penalties: '0', official: true })
    const withPenalty = calculateFigureSet({ figures, penalties: '1', official: true })

    expect(initial.ok).toBe(true)
    expect(withPenalty.ok).toBe(true)
    if (!initial.ok || !withPenalty.ok) return
    expect(formatScore(initial.value.result, 4)).toBe('72,7333')
    expect(formatScore(withPenalty.value.result, 4)).toBe('71,7333')
  })

  it('keeps a forced-zero figure DD in the official set denominator', () => {
    const outcome = calculateFigureSet({
      official: true,
      penalties: '0',
      figures: [
        { judgeCount: 6, scores: ['7.3', '7.1', '6.7', '7.3', '6.8', '7.0'], dd: '2.2' },
        { judgeCount: 6, scores: [], dd: '2.2', invalidFigure: true },
        { judgeCount: 6, scores: ['7.2', '7.0', '7.2', '7.3', '7.3', '7.4'], dd: '2.2' },
        { judgeCount: 6, scores: ['7.1', '7.1', '7.0', '7.3', '7.3', '7.5'], dd: '2.4' },
      ],
    })

    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(formatScore(outcome.value.result, 4)).toBe('54,1556')
  })

  it('rejects unsupported judging inputs and incomplete official sets', () => {
    expect(calculateFigure({ judgeCount: 5, scores: ['7.35', '7.0', '7.0', '7.0', '7.0'], dd: '1.8' }).ok).toBe(false)
    expect(calculateFigure({ judgeCount: 3 as 4, scores: ['7.0', '7.0', '7.0'], dd: '1.8' }).ok).toBe(false)
    expect(calculateFigure({ judgeCount: 5, scores: ['7.0', '7.0', '7.0', null, null], dd: '1.8' }).ok).toBe(false)
    expect(calculateFigureSet({ official: true, figures: [{ judgeCount: 5, scores: ['7.0', '7.0', '7.0', '7.0', '7.0'], dd: '1.8' }], penalties: '0' }).ok).toBe(false)
  })
})
