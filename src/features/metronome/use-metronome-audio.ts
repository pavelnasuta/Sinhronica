import { useEffect } from 'react'

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

export function useMetronomeAudio({ running, bpm, startedAt }: MetronomeAudioProps): void {
  useEffect(() => {
    if (!running || startedAt === null) return undefined

    const AudioContextConstructor = window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext
    if (!AudioContextConstructor) return undefined

    const context = new AudioContextConstructor()
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
      if (nextBeatAt < context.currentTime - SCHEDULE_AHEAD_SECONDS) resync()
      while (nextBeatAt < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
        scheduleClick(nextBeatAt, beat === 0)
        nextBeatAt += 60 / bpm
        beat = (beat + 1) % 4
      }
    }

    void context.resume().then(schedule).catch(() => undefined)
    const handleVisibilityChange = () => {
      if (!document.hidden) resync()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const interval = window.setInterval(schedule, SCHEDULER_INTERVAL_MS)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(interval)
      void context.close()
    }
  }, [bpm, running, startedAt])
}
