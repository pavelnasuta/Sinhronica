import { afterEach, expect, it, vi } from 'vitest'

import { METRICA_COUNTER_ID, trackRouteView } from './metrica'

afterEach(() => {
  delete window.ym
  window.history.replaceState({}, '', '/')
})

it('sends a route view without personal profile or diary data', () => {
  const ym = vi.fn()
  window.ym = ym
  window.history.replaceState({}, '', '/Sinhronica/')

  trackRouteView('metronome')

  expect(ym).toHaveBeenCalledWith(METRICA_COUNTER_ID, 'hit', `${window.location.origin}/Sinhronica/#metronome`)
  expect(ym).toHaveBeenCalledTimes(1)
})

it('does nothing until the Metrica bootstrap is available', () => {
  expect(() => trackRouteView('diary')).not.toThrow()
})
