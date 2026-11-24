import { ArrowLeft, Minus, Pause, Play, Plus, TimerReset } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useMetronomeAudio } from './use-metronome-audio'

const MIN_BPM = 30
const MAX_BPM = 240
const PRESETS = [60, 80, 100, 120] as const

function clampBpm(value: number): number {
  if (!Number.isFinite(value)) return 100
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)))
}

export function MetronomePage({ onBack }: { onBack: () => void }) {
  const [bpm, setBpm] = useState(100)
  const [tempoInput, setTempoInput] = useState('100')
  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [activeBeat, setActiveBeat] = useState(0)
  const unlockAudio = useMetronomeAudio({ running, bpm, startedAt })

  useEffect(() => {
    if (!running || startedAt === null) return undefined

    let animationFrame = 0
    const renderBeat = () => {
      const beat = Math.floor((performance.now() - startedAt) / (60_000 / bpm)) % 4
      setActiveBeat(beat)
      animationFrame = requestAnimationFrame(renderBeat)
    }
    renderBeat()
    return () => cancelAnimationFrame(animationFrame)
  }, [bpm, running, startedAt])

  const changeBpm = (next: number) => {
    const normalized = clampBpm(next)
    setBpm(normalized)
    setTempoInput(String(normalized))
    if (running) {
      setActiveBeat(0)
      setStartedAt(performance.now())
    }
  }
  const updateTempoInput = (value: string) => {
    setTempoInput(value)
    const parsed = Number(value)
    if (value && Number.isFinite(parsed)) {
      setBpm(clampBpm(parsed))
      if (running) {
        setActiveBeat(0)
        setStartedAt(performance.now())
      }
    }
  }
  const commitTempoInput = () => changeBpm(Number(tempoInput))
  const toggleRunning = () => {
    if (running) {
      setActiveBeat(0)
      setStartedAt(null)
    } else {
      unlockAudio()
      setActiveBeat(0)
      setStartedAt(performance.now())
    }
    setRunning((current) => !current)
  }

  return (
    <div className="sinhronica-settings-shell flex flex-col bg-background">
      <main className="sinhronica-screen mx-auto w-full max-w-xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-8 sm:pt-4">
        <section className="space-y-5" aria-labelledby="metronome-title">
      <Button type="button" variant="ghost" className="-mt-4 gap-2" onClick={onBack}><ArrowLeft className="h-4 w-4" aria-hidden="true" />К полезному</Button>
      <header className="space-y-2"><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Тренировочный ритм</p><h1 id="metronome-title" className="text-3xl font-extrabold tracking-[-0.04em]">Метроном</h1><p className="text-base leading-7 text-muted-foreground">Держи темп на суше, в хореографии и при разучивании счёта.</p></header>

      <article className="rounded-[var(--radius-xl)] border bg-card p-5 text-center shadow-[var(--shadow-card)]">
        <p className="text-sm font-bold text-muted-foreground">{running ? 'Идёт счёт' : 'Готов к старту'}</p>
        <div className="mt-5 flex items-center justify-center gap-3"><Button type="button" variant="outline" size="icon" aria-label="Уменьшить темп" onClick={() => changeBpm(bpm - 1)}><Minus aria-hidden="true" /></Button><label className="grid gap-1"><span className="sr-only">Темп в ударах в минуту</span><Input aria-label="Темп в ударах в минуту" type="number" inputMode="numeric" min={MIN_BPM} max={MAX_BPM} value={tempoInput} onChange={(event) => updateTempoInput(event.target.value)} onBlur={commitTempoInput} className="h-auto w-32 border-0 bg-transparent p-0 text-center text-6xl font-extrabold tracking-[-0.07em] shadow-none focus-visible:ring-0" /></label><Button type="button" variant="outline" size="icon" aria-label="Увеличить темп" onClick={() => changeBpm(bpm + 1)}><Plus aria-hidden="true" /></Button></div>
        <p className="mt-1 text-sm font-bold text-muted-foreground">BPM</p>
        <div className="mt-6 grid grid-cols-4 gap-2" aria-label="Счёт на четыре">{[1, 2, 3, 4].map((beat) => <span key={beat} aria-label={beat === 1 ? 'Доля 1, сильная' : `Доля ${beat}`} aria-current={running && activeBeat === beat - 1 ? 'step' : undefined} className={`flex aspect-square items-center justify-center rounded-[var(--radius-md)] text-lg font-extrabold transition-colors ${running && activeBeat === beat - 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{beat}</span>)}</div>
        <p className="sr-only" aria-live="polite">{running ? `Доля ${activeBeat + 1} из 4` : 'Метроном остановлен'}</p>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">4/4 · сильная первая доля</p>
        <Button type="button" className="mt-6 w-full" size="lg" aria-label={running ? 'Приостановить метроном' : 'Запустить метроном'} onClick={toggleRunning}>{running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}{running ? 'Пауза' : 'Запустить'}</Button>
      </article>

      <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><div className="flex items-center gap-2"><TimerReset className="h-5 w-5 text-primary" aria-hidden="true" /><h2 className="text-lg font-extrabold">Быстрый темп</h2></div><div className="mt-4 grid grid-cols-4 gap-2">{PRESETS.map((preset) => <Button key={preset} type="button" variant={bpm === preset ? 'default' : 'outline'} className="h-12" onClick={() => changeBpm(preset)}>{preset}</Button>)}</div></section>
      <p className="px-2 text-center text-xs leading-5 text-muted-foreground">Звук включается только после нажатия «Запустить». Если устройство не даёт звук, счёт и подсветка продолжают работать на экране.</p>
        </section>
      </main>
    </div>
  )
}
