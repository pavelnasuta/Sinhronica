import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it } from 'vitest'

import { ACHIEVEMENTS_STORAGE_KEY, useAchievementsStore } from '../../stores/achievements-store'
import { AchievementsPage } from './AchievementsPage'

beforeEach(() => {
  localStorage.clear()
  useAchievementsStore.setState({ achievements: [], storageStatus: 'ready' })
})

afterEach(() => {
  cleanup()
})

it('shows Acqui and creates an achievement from the empty state', async () => {
  const user = userEvent.setup()
  render(<AchievementsPage />)

  expect(screen.getByRole('heading', { name: 'Здесь будут твои победы' })).toBeVisible()
  expect(screen.getByRole('presentation')).toHaveAttribute('src', expect.stringContaining('onboarding/progress.webp'))

  await user.click(screen.getByRole('button', { name: 'Добавить достижение' }))
  expect(screen.getByLabelText('Балл')).toHaveValue('')
  await user.type(screen.getByLabelText('Соревнование или событие'), 'Кубок Федерации')
  await user.selectOptions(screen.getByLabelText('Дисциплина'), 'combo')
  await user.clear(screen.getByLabelText('Балл'))
  await user.type(screen.getByLabelText('Балл'), '9,123')
  await user.selectOptions(screen.getByLabelText('Медаль'), 'gold')
  await user.click(screen.getByRole('button', { name: 'Сохранить достижение' }))

  expect(screen.getByRole('heading', { name: 'Твои достижения' })).toBeVisible()
  expect(screen.getByText('Кубок Федерации')).toBeVisible()
  expect(screen.getAllByText('9,123').length).toBeGreaterThan(0)
  expect(screen.getByText('1 место')).toBeVisible()
})

it('sorts by performance date, compares nearest earlier record, edits and deletes', async () => {
  const user = userEvent.setup()
  const seeded = [
    { id: 'march', performedOn: '2026-03-05', eventName: 'Весенний старт', discipline: 'combo', score: 8, medal: 'none', createdAt: '2026-05-01T10:00:00.000Z', updatedAt: '2026-05-01T10:00:00.000Z' },
    { id: 'april', performedOn: '2026-04-10', eventName: 'Кубок Федерации', discipline: 'combo', score: 9.25, medal: 'gold', createdAt: '2026-04-01T10:00:00.000Z', updatedAt: '2026-04-01T10:00:00.000Z' },
  ]
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(seeded))
  render(<AchievementsPage />)

  const cards = screen.getAllByTestId('achievement-card')
  expect(cards[0]).toHaveTextContent('Кубок Федерации')
  expect(cards[0]).toHaveTextContent('Выше на 1,25')
  expect(screen.getByRole('button', { name: 'Изменить достижение Кубок Федерации' }).querySelector('svg')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Удалить достижение Кубок Федерации' }).querySelector('svg')).toBeTruthy()
  expect(screen.queryByText('Изменить')).not.toBeInTheDocument()
  expect(screen.queryByText('Удалить')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Изменить достижение Кубок Федерации' }))
  await user.clear(screen.getByLabelText('Балл'))
  await user.type(screen.getByLabelText('Балл'), '9.5')
  await user.click(screen.getByRole('button', { name: 'Сохранить достижение' }))
  expect(screen.getAllByTestId('achievement-card')[0]).toHaveTextContent('9,5')

  await user.click(screen.getByRole('button', { name: 'Удалить достижение Весенний старт' }))
  await user.click(screen.getByRole('button', { name: 'Удалить достижение' }))
  expect(screen.queryByText('Весенний старт')).not.toBeInTheDocument()
  expect(screen.getByText('Кубок Федерации')).toBeVisible()
})

it('explains when saved achievement data had to be recovered', () => {
  localStorage.setItem('sinhronica:achievements:v1', '{invalid json')

  render(<AchievementsPage />)

  expect(screen.getByRole('status', { name: 'Состояние хранения' })).toHaveTextContent('Повреждённые локальные данные были пропущены.')
})
