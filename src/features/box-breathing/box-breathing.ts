export const PHASE_DURATION_SECONDS = 4
export const TOTAL_CYCLES = 4

export type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

const phases: BreathingPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out']
const phaseDurationMs = PHASE_DURATION_SECONDS * 1_000
const cycleDurationMs = phaseDurationMs * phases.length
export const TOTAL_DURATION_MS = cycleDurationMs * TOTAL_CYCLES

export function getBreathingStep(elapsedMs: number) {
  if (elapsedMs >= TOTAL_DURATION_MS) {
    return { phase: 'hold-out' as const, secondsRemaining: 0, cycle: TOTAL_CYCLES, complete: true, phaseProgress: 1, totalProgress: 1 }
  }

  const safeElapsed = Math.max(0, elapsedMs)
  const cycle = Math.floor(safeElapsed / cycleDurationMs) + 1
  const elapsedInCycle = safeElapsed % cycleDurationMs
  const phaseIndex = Math.floor(elapsedInCycle / phaseDurationMs)
  const elapsedInPhase = elapsedInCycle % phaseDurationMs

  return {
    phase: phases[phaseIndex],
    secondsRemaining: Math.max(1, Math.ceil((phaseDurationMs - elapsedInPhase) / 1_000)),
    cycle,
    complete: false,
    phaseProgress: elapsedInPhase / phaseDurationMs,
    totalProgress: safeElapsed / TOTAL_DURATION_MS,
  }
}
