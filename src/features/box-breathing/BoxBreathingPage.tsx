import { ArrowLeft, Pause, Play } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '../../components/ui/button'
import { getBreathingStep, TOTAL_CYCLES, TOTAL_DURATION_MS } from './box-breathing'

const PHASE_LABELS = {
  inhale: 'Вдох',
  'hold-in': 'Задержка',
  exhale: 'Выдох',
  'hold-out': 'Пауза',
} as const

type BreathingMode = 'idle' | 'running' | 'paused' | 'complete'

function mascotScale(phase: keyof typeof PHASE_LABELS, progress: number): number {
  if (phase === 'inhale') return 1 + progress * 0.08
  if (phase === 'hold-in') return 1.08
  if (phase === 'exhale') return 1.08 - progress * 0.08
  return 1
}

export function BoxBreathingPage({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<BreathingMode>('idle')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [pausedElapsed, setPausedElapsed] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (mode !== 'running' || startedAt === null) return undefined

    const update = () => {
      const timestamp = Date.now()
      if (pausedElapsed + timestamp - startedAt >= TOTAL_DURATION_MS) {
        setPausedElapsed(TOTAL_DURATION_MS)
        setStartedAt(null)
        setMode('complete')
        return
      }
      setNow(timestamp)
    }
    const timer = window.setInterval(update, 200)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
    }
  }, [mode, pausedElapsed, startedAt])

  const elapsed = mode === 'running' && startedAt !== null ? pausedElapsed + now - startedAt : pausedElapsed
  const step = useMemo(() => getBreathingStep(elapsed), [elapsed])

  const startOrResume = () => {
    if (mode === 'idle' || mode === 'complete') setPausedElapsed(0)
    setStartedAt(Date.now())
    setNow(Date.now())
    setMode('running')
  }

  const pause = () => {
    setPausedElapsed(elapsed)
    setStartedAt(null)
    setMode('paused')
  }

  const isComplete = mode === 'complete'
  const buttonLabel = mode === 'running' ? 'Приостановить дыхание' : mode === 'paused' ? 'Продолжить дыхание' : isComplete ? 'Повторить дыхание' : 'Начать дыхание'
  const instruction = isComplete ? 'Ты готова' : PHASE_LABELS[step.phase]
  const progressLength = Math.round(step.cycleProgress * 400)

  return (
    <div className="sinhronica-settings-shell flex flex-col bg-background">
      <main className="sinhronica-screen mx-auto w-full max-w-xl px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-8 sm:pt-4">
        <section className="space-y-5" aria-labelledby="box-breathing-title">
      <Button type="button" variant="ghost" className="gap-2" onClick={onBack}><ArrowLeft className="h-4 w-4" aria-hidden="true" />К полезному</Button>
      <header className="space-y-2"><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Перед стартом</p><h1 id="box-breathing-title" className="text-3xl font-extrabold tracking-[-0.04em]">Квадратное дыхание</h1><p className="text-base leading-7 text-muted-foreground">Короткий спокойный ритм, чтобы собраться перед выступлением или соревнованиями.</p></header>

      <article className="sinhronica-breathing-card overflow-hidden rounded-[var(--radius-xl)] border p-5 text-center shadow-[var(--shadow-card)] sm:p-6">
        <p className="text-sm font-bold text-muted-foreground">{isComplete ? 'Практика завершена' : mode === 'paused' ? 'На паузе' : mode === 'running' ? 'Следуй за квадратом' : 'Готова начать'}</p>
        <div className="relative mx-auto mt-5 aspect-square w-full max-w-[19rem]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="84" height="84" rx="10" pathLength="400" stroke="currentColor" strokeWidth="3" className="text-secondary" />
            <rect x="8" y="8" width="84" height="84" rx="10" pathLength="400" stroke="url(#breathing-gradient)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progressLength} 400`} />
            <defs><linearGradient id="breathing-gradient" x1="8" y1="8" x2="92" y2="92" gradientUnits="userSpaceOnUse"><stop stopColor="#37ddf4" /><stop offset="1" stopColor="#9b4dff" /></linearGradient></defs>
          </svg>
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2 text-xs font-extrabold text-muted-foreground">Вдох</span>
          <span className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 text-xs font-extrabold text-muted-foreground">Задержка</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-xs font-extrabold text-muted-foreground">Выдох</span>
          <span className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 text-xs font-extrabold text-muted-foreground">Пауза</span>
          <div className="sinhronica-breathing-mascot-slot absolute inset-[12%] grid place-items-center" style={{ transform: `scale(${mascotScale(step.phase, step.phaseProgress)})` }}>
            <img src={`${import.meta.env.BASE_URL}mascots/aqui-lotus.png`} alt="Акви в позе лотоса" className="h-full w-full object-contain" />
          </div>
        </div>

        <div className="mt-6 grid gap-1">
          <p className="text-4xl font-extrabold tracking-[-0.05em]">{instruction}</p>
          <p className="text-lg font-bold text-muted-foreground">{isComplete ? 'Дыши спокойно и делай своё' : `${step.secondsRemaining} секунды`}</p>
          {!isComplete ? <p className="text-sm font-semibold text-muted-foreground">Цикл {step.cycle} из {TOTAL_CYCLES}</p> : null}
        </div>

        <Button type="button" className="mt-6 w-full" size="lg" aria-label={buttonLabel} onClick={mode === 'running' ? pause : startOrResume}>{mode === 'running' ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}{mode === 'running' ? 'Пауза' : isComplete ? 'Повторить' : mode === 'paused' ? 'Продолжить' : 'Начать'}</Button>
      </article>

      <p className="px-2 text-center text-xs leading-5 text-muted-foreground">{TOTAL_CYCLES} цикла · 1 минута 4 секунды. Дыши в комфортном для себя темпе.</p>
        </section>
      </main>
    </div>
  )
}
