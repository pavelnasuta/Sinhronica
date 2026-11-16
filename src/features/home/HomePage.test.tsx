import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { HomePage } from './HomePage'

const profile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' as const }
const routine = { id: 'routine-1', title: 'Лазурь', context: 'training' as const, discipline: 'group' as const, programType: 'free' as const, ageGroup: 'Девушки 13–15 лет', activeAthleteCount: 8, reserveAthleteCount: 0, athleteNames: [], targetDurationSeconds: 180, blocks: [{ id: 'block-1', type: 'element' as const, title: 'Гибрид 1' }], createdAt: '2026-11-16T10:00:00.000Z', updatedAt: '2026-11-16T12:00:00.000Z' }
const achievement = { id: 'achievement-1', performedOn: '2026-11-10', eventName: 'Первенство города', discipline: 'team' as const, score: 82.5, medal: 'gold' as const, createdAt: '2026-11-10T12:00:00.000Z', updatedAt: '2026-11-10T12:00:00.000Z' }

it('shows a personal home header, current focus and local progress', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  render(<HomePage profile={profile} routines={[routine]} figureProgress={[{ figureCode: '101', status: 'mastered', updatedAt: '2026-11-12T12:00:00.000Z' }]} achievements={[achievement]} onNavigate={onNavigate} />)

  expect(screen.getByRole('heading', { name: 'Привет, Алина' })).toBeVisible()
  expect(screen.getByText('дельфиник')).toBeVisible()
  expect(screen.getByRole('img', { name: 'Акви рядом с твоими планами' })).toBeVisible()
  expect(screen.getByRole('banner')).not.toHaveClass('border')
  expect(screen.getByRole('banner')).not.toHaveClass('rounded-[var(--radius-xl)]')
  expect(screen.queryByText('Синхроника')).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Прогресс' })).toBeVisible()
  expect(screen.getByText('Медали')).toBeVisible()
  expect(screen.getByText('Освоены')).toBeVisible()
  expect(screen.getByText('Макс. балл')).toBeVisible()
  expect(screen.getByRole('heading', { name: 'Фокус сейчас' })).toBeVisible()
  expect(screen.getByText('Лазурь')).toBeVisible()
  expect(screen.getByText('Дневник тренировок')).toBeVisible()
  expect(screen.queryByText('На сегодня')).not.toBeInTheDocument()
  expect(screen.queryByText('Моя траектория')).not.toBeInTheDocument()
  expect(screen.queryByText('Под рукой')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Дневник тренировок/i })).not.toBeInTheDocument()

  const focusCard = screen.getByRole('button', { name: /Продолжи номер Лазурь/i })
  expect(focusCard).toHaveClass('border')
  expect(focusCard).toHaveClass('bg-card')

  await user.click(focusCard)
  expect(onNavigate).toHaveBeenCalledWith('routines')
  await user.click(screen.getByRole('button', { name: 'Настройки' }))
  expect(onNavigate).toHaveBeenCalledWith('settings')
})
