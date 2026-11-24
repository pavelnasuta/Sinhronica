import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { BoxBreathingPage } from './BoxBreathingPage'

it('guides an athlete through square breathing with a lotus-pose Aqui mascot', async () => {
  const user = userEvent.setup()
  render(<BoxBreathingPage onBack={vi.fn()} />)

  expect(screen.getByRole('heading', { name: 'Квадратное дыхание' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'К полезному' })).not.toHaveClass('-ml-3')
  expect(screen.getByRole('img', { name: 'Акви в позе лотоса' })).toHaveAttribute('src', '/mascots/aqui-lotus.png')
  expect(screen.getAllByText('Вдох')).toHaveLength(2)
  expect(screen.getAllByText((_, element) => element?.textContent?.includes('4 цикла · 1 минута 4 секунды') ?? false).some((element) => element.tagName === 'P')).toBe(true)

  await user.click(screen.getByRole('button', { name: 'Начать дыхание' }))
  expect(screen.getByRole('button', { name: 'Приостановить дыхание' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Приостановить дыхание' }))
  expect(screen.getByRole('button', { name: 'Продолжить дыхание' })).toBeInTheDocument()
})
