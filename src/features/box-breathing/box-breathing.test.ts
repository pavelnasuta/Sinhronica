import { expect, it } from 'vitest'

import { getBreathingStep } from './box-breathing'

it('moves through all four square-breathing phases and completes four cycles', () => {
  expect(getBreathingStep(0)).toMatchObject({ phase: 'inhale', secondsRemaining: 4, cycle: 1, complete: false })
  expect(getBreathingStep(4_000)).toMatchObject({ phase: 'hold-in', secondsRemaining: 4, cycle: 1, complete: false, cycleProgress: 0.25 })
  expect(getBreathingStep(8_000)).toMatchObject({ phase: 'exhale', secondsRemaining: 4, cycle: 1, complete: false, cycleProgress: 0.5 })
  expect(getBreathingStep(12_000)).toMatchObject({ phase: 'hold-out', secondsRemaining: 4, cycle: 1, complete: false, cycleProgress: 0.75 })
  expect(getBreathingStep(16_000)).toMatchObject({ phase: 'inhale', secondsRemaining: 4, cycle: 2, complete: false, cycleProgress: 0 })
  expect(getBreathingStep(63_999)).toMatchObject({ phase: 'hold-out', secondsRemaining: 1, cycle: 4, complete: false })
  expect(getBreathingStep(64_000)).toMatchObject({ cycle: 4, complete: true })
})
