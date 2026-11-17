import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { MetronomePage } from './MetronomePage'

it('lets an athlete set a tempo and start a four-beat metronome', async () => {
  const user = userEvent.setup()
  render(<MetronomePage onBack={vi.fn()} />)

  expect(screen.getByRole('heading', { name: 'Метроном' })).toBeInTheDocument()
  expect(screen.getByLabelText('Темп в ударах в минуту')).toHaveValue(100)
  expect(screen.getByLabelText('Доля 1, сильная')).toBeInTheDocument()
  expect(screen.getByText('Метроном остановлен')).toHaveAttribute('aria-live', 'polite')
  await user.click(screen.getByRole('button', { name: 'Увеличить темп' }))
  expect(screen.getByLabelText('Темп в ударах в минуту')).toHaveValue(101)
  await user.clear(screen.getByLabelText('Темп в ударах в минуту'))
  await user.type(screen.getByLabelText('Темп в ударах в минуту'), '120')
  expect(screen.getByLabelText('Темп в ударах в минуту')).toHaveValue(120)
  await user.click(screen.getByRole('button', { name: 'Запустить метроном' }))
  expect(screen.getByRole('button', { name: 'Приостановить метроном' })).toBeInTheDocument()
  expect(screen.getByText('4/4 · сильная первая доля')).toBeInTheDocument()
})
