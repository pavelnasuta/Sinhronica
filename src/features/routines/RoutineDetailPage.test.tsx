import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

import { RoutineDetailPage } from './RoutineDetailPage'

const routine = { id: 'routine-1', title: 'Лазурь', context: 'training' as const, discipline: 'group' as const, programType: 'free' as const, ageGroup: 'Девушки 13–15 лет', activeAthleteCount: 8, reserveAthleteCount: 0, athleteNames: [], blocks: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }

afterEach(cleanup)

it('adds timed element blocks and labels their sum as draft difficulty', async () => {
  const user = userEvent.setup()
  const onUpdate = vi.fn()
  render(<RoutineDetailPage routine={routine} onBack={vi.fn()} onEdit={vi.fn()} onRemove={vi.fn()} onUpdate={onUpdate} />)
  await user.click(screen.getByRole('button', { name: 'Блок' }))
  await user.type(screen.getByLabelText('Название'), 'Гибрид 1')
  await user.type(screen.getByLabelText('Начало, сек.'), '30')
  await user.type(screen.getByLabelText('Конец, сек.'), '45')
  await user.type(screen.getByLabelText('Ручная сложность'), '3,2')
  await user.click(screen.getByRole('button', { name: 'Сохранить блок' }))
  expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ blocks: [expect.objectContaining({ type: 'element', manualDifficulty: 3.2 })] }))
  expect(screen.getByText('Черновая сложность')).toBeVisible()
})

it('keeps an invalid timed block open and explains the input error', async () => {
  const user = userEvent.setup()
  const onUpdate = vi.fn()
  render(<RoutineDetailPage routine={routine} onBack={vi.fn()} onEdit={vi.fn()} onRemove={vi.fn()} onUpdate={onUpdate} />)
  await user.click(screen.getByRole('button', { name: 'Блок' }))
  await user.type(screen.getByLabelText('Название'), 'Гибрид 1')
  await user.type(screen.getByLabelText('Начало, сек.'), '45')
  await user.type(screen.getByLabelText('Конец, сек.'), '30')
  await user.click(screen.getByRole('button', { name: 'Сохранить блок' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Конец не может быть раньше начала.')
  expect(onUpdate).not.toHaveBeenCalled()
})
