import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { AppShell } from './AppShell'

it('renders section content without a repeated personal header and keeps labelled mobile navigation', () => {
  render(
    <AppShell activeRoute="useful" onNavigate={vi.fn()}>
      <p>Содержимое</p>
    </AppShell>,
  )

  const navigation = screen.getByRole('navigation', { name: 'Мобильная навигация' })

  expect(screen.queryByText('Алина')).not.toBeInTheDocument()
  expect(screen.queryByText('дельфиник')).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Настройки' })).not.toBeInTheDocument()
  expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Синхроника, перейти на главную' })).not.toBeInTheDocument()
  expect(navigation).toHaveTextContent('Главная')
  expect(navigation).toHaveTextContent('Полезное')
  expect(navigation).toHaveTextContent('Номера')
  expect(navigation).toHaveTextContent('Достижения')
  expect(screen.getAllByRole('link', { name: 'Полезное' }).some((link) => link.getAttribute('aria-current') === 'page')).toBe(true)
})
