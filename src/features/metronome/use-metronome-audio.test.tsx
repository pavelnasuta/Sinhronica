import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { useMetronomeAudio } from './use-metronome-audio'

const resume = vi.fn(() => Promise.resolve())
const oscillatorStart = vi.fn()
const oscillatorStop = vi.fn()
const gainConnect = vi.fn()
const oscillatorConnect = vi.fn(() => ({ connect: gainConnect }))
const createOscillator = vi.fn(() => ({ connect: oscillatorConnect, start: oscillatorStart, stop: oscillatorStop }))
const createGain = vi.fn(() => ({ gain: { value: 1 } }))

class AudioContextStub {
  state = 'suspended' as AudioContextState
  currentTime = 0
  destination = {}
  resume = resume
  close = vi.fn(() => Promise.resolve())
  createOscillator = createOscillator
  createGain = createGain
}

function AudioUnlockButton() {
  const unlockAudio = useMetronomeAudio({ running: false, bpm: 100, startedAt: null })
  return <button type="button" onClick={unlockAudio}>Unlock</button>
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

it('warms up Web Audio synchronously from a user gesture for iOS', () => {
  vi.stubGlobal('AudioContext', AudioContextStub)
  render(<AudioUnlockButton />)

  fireEvent.click(screen.getByRole('button', { name: 'Unlock' }))

  expect(resume).toHaveBeenCalledTimes(1)
  expect(createOscillator).toHaveBeenCalledTimes(1)
  expect(oscillatorStart).toHaveBeenCalledTimes(1)
  expect(oscillatorStop).toHaveBeenCalledTimes(1)
})
