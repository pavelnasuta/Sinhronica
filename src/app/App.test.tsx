import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { useAthleteProfileStore } from '../stores/athlete-profile-store'
import { App } from './App'

afterEach(() => {
  cleanup()
  useAthleteProfileStore.setState({ profile: null })
  window.location.hash = ''
})

it('uses the expanded personal header only on the home page', () => {
  useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' } })
  window.location.hash = 'home'

  render(<App />)

  expect(screen.getByRole('heading', { name: 'Привет, Алина' })).toBeVisible()
  expect(screen.getByText('дельфиник')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Настройки' })).toBeVisible()
  expect(screen.getByRole('img', { name: 'Акви рядом с твоими планами' })).toBeVisible()
})
