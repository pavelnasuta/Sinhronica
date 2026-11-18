import { useCallback, useEffect, useRef } from 'react'

type MetronomeAudioProps = {
  running: boolean
  bpm: number
  startedAt: number | null
}

type AudioContextWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

const SCHEDULE_AHEAD_SECONDS = 0.12
const SCHEDULER_INTERVAL_MS = 25

export function useMetronomeAudio({ running, bpm, startedAt }: MetronomeAudioProps): () => void {
  const contextRef = useRef<AudioContext | null>(null)

  const getContext = useCallback(() => {
    if (contextRef.current) return contextRef.current

    const AudioContextConstructor = window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext
    if (!AudioContextConstructor) return null

    const context = new AudioContextConstructor()
    contextRef.current = context
    return context
  }, [])

  const unlockAudio = useCallback(() => {
    const context = getContext()
    if (context && context.state !== 'running') void context.resume().catch(() => undefined)
  }, [getContext])

  useEffect(() => () => {
    const context = contextRef.current
    contextRef.current = null
    if (context && context.state !== 'closed') void context.close()
  }, [])

  useEffect(() => {
    if (!running || startedAt === null) return undefined

    const context = contextRef.current
    if (!context) return undefined

    let nextBeatAt = context.currentTime
    let beat = 0

    const scheduleClick = (time: number, accent: boolean) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = accent ? 1_200 : 800
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(accent ? 0.22 : 0.12, time + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(time)
      oscillator.stop(time + 0.05)
    }

    const resync = () => {
      nextBeatAt = context.currentTime
      beat = Math.floor((performance.now() - startedAt) / (60_000 / bpm)) % 4
    }

    const schedule = () => {
      if (context.state !== 'running') return
      if (nextBeatAt < context.currentTime - SCHEDULE_AHEAD_SECONDS) resync()
      while (nextBeatAt < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
        scheduleClick(nextBeatAt, beat === 0)
        nextBeatAt += 60 / bpm
        beat = (beat + 1) % 4
      }
    }

    const resumeAndSchedule = () => {
      if (context.state === 'running') {
        schedule()
        return
      }
      void context.resume().then(schedule).catch(() => undefined)
    }

    resumeAndSchedule()
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resync()
        resumeAndSchedule()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const interval = window.setInterval(schedule, SCHEDULER_INTERVAL_MS)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(interval)
    }
  }, [bpm, running, startedAt])

  return unlockAudio
}
