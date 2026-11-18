import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { useAthleteProfileStore } from '../stores/athlete-profile-store'
import { App } from './App'

const scrollTo = vi.fn()
Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo })

afterEach(() => {
  cleanup()
  scrollTo.mockClear()
  useAthleteProfileStore.setState({ profile: null })
  window.location.hash = ''
})

it('uses the expanded personal header only on the home page', () => {
  useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' } })
  window.location.hash = 'home'

  render(<App />)

  expect(screen.getByRole('heading', { name: 'Привет, Алина' })).toBeVisible()
  expect(screen.getByText('дельфиник')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Открыть настройки профиля' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Настройки' })).not.toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Акви рядом с твоими планами' })).toBeVisible()
})

it('returns to the top when the active screen changes', async () => {
  useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' } })
  window.location.hash = 'home'
  render(<App />)
  scrollTo.mockClear()

  await act(async () => {
    window.location.hash = 'useful'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })

  await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0))
})
