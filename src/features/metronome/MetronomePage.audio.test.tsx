import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

const unlockAudio = vi.fn()

vi.mock('./use-metronome-audio', () => ({
  useMetronomeAudio: () => unlockAudio,
}))

import { MetronomePage } from './MetronomePage'

it('unlocks audio directly from the Start button gesture', () => {
  render(<MetronomePage onBack={vi.fn()} />)

  fireEvent.click(screen.getByRole('button', { name: 'Запустить метроном' }))

  expect(unlockAudio).toHaveBeenCalledTimes(1)
})
