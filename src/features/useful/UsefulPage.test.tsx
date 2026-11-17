import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { UsefulPage } from './UsefulPage'

it('opens the catalog and calculator from Useful', async () => {
  const onNavigate = vi.fn()
  const user = userEvent.setup()
  render(<UsefulPage onNavigate={onNavigate} />)

  expect(screen.getByRole('heading', { name: 'Полезное' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Калькулятор баллов/i }))
  await user.click(screen.getByRole('button', { name: /Каталог фигур/i }))
  await user.click(screen.getByRole('button', { name: /Метроном/i }))
  await user.click(screen.getByRole('button', { name: /Квадратное дыхание/i }))

  expect(onNavigate).toHaveBeenNthCalledWith(1, 'figures-calculator')
  expect(onNavigate).toHaveBeenNthCalledWith(2, 'figures-catalog')
  expect(onNavigate).toHaveBeenNthCalledWith(3, 'metronome')
  expect(onNavigate).toHaveBeenNthCalledWith(4, 'box-breathing')
  expect(screen.getByText('Скоро ещё больше полезного')).toBeInTheDocument()
  expect(screen.getAllByText('В разработке')).toHaveLength(1)
})
