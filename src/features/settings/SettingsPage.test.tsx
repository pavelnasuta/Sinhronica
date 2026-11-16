import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

import { useAthleteProfileStore } from '../../stores/athlete-profile-store'
import { SettingsPage } from './SettingsPage'

beforeEach(() => {
  localStorage.clear()
  useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' } })
})

it('updates athlete profile and links feedback to Pavel', async () => {
  const user = userEvent.setup()
  render(<SettingsPage onBack={vi.fn()} />)
  await user.clear(screen.getByLabelText('Как тебя зовут?'))
  await user.type(screen.getByLabelText('Как тебя зовут?'), 'Маша')
  await user.selectOptions(screen.getByLabelText('Спортивный разряд'), 'КМС')
  await user.click(screen.getByRole('button', { name: 'Сохранить профиль' }))
  expect(useAthleteProfileStore.getState().profile).toMatchObject({ name: 'Маша', sportRank: 'КМС' })
  expect(screen.getByRole('link', { name: 'Предложить доработку' })).toHaveAttribute('href', 'https://t.me/pavelnasuta')
  expect(screen.getByRole('presentation')).toHaveClass('object-contain')
})
