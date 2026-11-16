import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { AppShell } from './AppShell'

it('renders a personal header and labelled mobile bottom navigation', () => {
  render(
    <AppShell activeRoute="useful" athleteProfile={{ name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }} onNavigate={vi.fn()}>
      <p>Содержимое</p>
    </AppShell>,
  )

  const navigation = screen.getByRole('navigation', { name: 'Мобильная навигация' })

  expect(screen.getByText('Алина')).toBeVisible()
  expect(screen.getByText('дельфиник')).toBeVisible()
  expect(screen.getByTestId('screen-transition')).toHaveClass('sinhronica-screen')
  expect(screen.getByRole('link', { name: 'Настройки' })).toHaveAttribute('href', '#settings')
  expect(screen.queryByRole('link', { name: 'Синхроника, перейти на главную' })).not.toBeInTheDocument()
  expect(navigation).toHaveTextContent('Главная')
  expect(navigation).toHaveTextContent('Полезное')
  expect(navigation).toHaveTextContent('Номера')
  expect(navigation).toHaveTextContent('Достижения')
  expect(screen.getAllByRole('link', { name: 'Полезное' }).some((link) => link.getAttribute('aria-current') === 'page')).toBe(true)
})
