import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useAthleteProfileStore } from '../../stores/athlete-profile-store'
import { useRoleProfileStore } from '../../stores/role-profile-store'
import { ACHIEVEMENTS_STORAGE_KEY, useAchievementsStore } from '../../stores/achievements-store'
import { FIGURE_PROGRESS_STORAGE_KEY, useFigureProgressStore } from '../../stores/figure-progress-store'
import { ROUTINES_STORAGE_KEY, useRoutinesStore } from '../../stores/routines-store'
import { TRAINING_DIARY_STORAGE_KEY, useTrainingDiaryStore } from '../../stores/training-diary-store'
import { BUDGET_STORAGE_KEY, useBudgetStore } from '../../stores/budget-store'
import { SettingsPage } from './SettingsPage'

beforeEach(() => {
  localStorage.clear()
  useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' } })
  useRoleProfileStore.setState({ profile: null })
  useAchievementsStore.setState({ achievements: [], storageStatus: 'ready' })
  useFigureProgressStore.setState({ progress: [], storageStatus: 'ready' })
  useRoutinesStore.setState({ routines: [], storageStatus: 'ready' })
  useTrainingDiaryStore.setState({ entries: [], storageStatus: 'ready' })
})

afterEach(cleanup)

it('renders the same sharing card for a parent profile', () => {
  useRoleProfileStore.setState({ profile: { role: 'parent', profile: { name: 'Елена', city: 'Казань', children: [{ id: 'child-1', name: 'Алина', sportRank: 'дельфиник' }] } } })

  render(<SettingsPage onBack={vi.fn()} />)

  expect(screen.getByRole('heading', { name: 'Поделиться Синхроникой' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Поделиться приложением с друзьями' })).toBeVisible()
  expect(screen.getByRole('presentation')).toHaveAttribute('src', expect.stringContaining('onboarding/practice.webp'))
  expect(screen.getByRole('heading', { name: 'Авторы' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Предложить доработку' })).toHaveAttribute('href', 'https://t.me/pavelnasuta')
})

it('confirms deletion of only parent profile data including budget and achievements', async () => {
  const user = userEvent.setup()
  const parent = { role: 'parent' as const, profile: { name: 'Елена', city: 'Казань', children: [{ id: 'child-1' as const, name: 'Алина', sportRank: 'дельфиник' as const }] } }
  useRoleProfileStore.setState({ profile: parent })
  useBudgetStore.setState({ entries: [{ id: 'budget', spentOn: '2026-11-10', amount: 500, category: 'training', comment: '', childId: 'child-1', createdAt: '2026-11-10T00:00:00.000Z', updatedAt: '2026-11-10T00:00:00.000Z' }], storageStatus: 'ready' })
  useAchievementsStore.setState({ achievements: [{ id: 'achievement', performedOn: '2026-11-10', eventName: 'Старт', discipline: 'solo', score: 8, medal: 'gold', childId: 'child-1', createdAt: '2026-11-10T00:00:00.000Z', updatedAt: '2026-11-10T00:00:00.000Z' }], storageStatus: 'ready' })
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(useBudgetStore.getState().entries))
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(useAchievementsStore.getState().achievements))

  render(<SettingsPage onBack={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: 'Удалить профиль семьи' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent('Удалить профиль семьи?')
  await user.click(screen.getByRole('button', { name: 'Удалить данные семьи' }))

  expect(useRoleProfileStore.getState().profile).toBeNull()
  expect(useBudgetStore.getState().entries).toEqual([])
  expect(useAchievementsStore.getState().achievements).toEqual([])
  expect(localStorage.getItem(BUDGET_STORAGE_KEY)).toBeNull()
  expect(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY)).toBeNull()
  expect(useAthleteProfileStore.getState().profile).toMatchObject({ name: 'Алина' })
})

it('updates athlete profile and links feedback to Pavel', async () => {
  render(<SettingsPage onBack={vi.fn()} />)
  expect(screen.queryByLabelText('Тема оформления')).not.toBeInTheDocument()
  expect(screen.getByText('Роль на этом устройстве')).toBeVisible()
  expect(screen.getByText(/Спортсменка\. Чтобы выбрать другую роль/)).toBeVisible()
  expect(screen.getByRole('button', { name: 'Начать новый профиль' })).toBeVisible()
  expect(screen.queryByText('Алина')).not.toBeInTheDocument()
  expect(document.querySelector('.sinhronica-header')).toBeNull()
  expect(screen.getByRole('link', { name: 'Предложить доработку' })).toHaveAttribute('href', 'https://t.me/pavelnasuta')
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText('Как тебя зовут?'))
  await user.type(screen.getByLabelText('Как тебя зовут?'), 'Маша')
  await user.selectOptions(screen.getByLabelText('Спортивный разряд'), 'КМС')
  await user.click(screen.getByRole('button', { name: 'Сохранить профиль' }))
  expect(useAthleteProfileStore.getState().profile).toMatchObject({ name: 'Маша', sportRank: 'КМС' })
  expect(useRoleProfileStore.getState().profile).toMatchObject({ role: 'athlete', profile: { name: 'Маша', sportRank: 'КМС' } })
  expect(screen.getByLabelText('Как тебя зовут?')).toHaveValue('Маша')
  expect(screen.getByLabelText('Спортивный разряд')).toHaveValue('КМС')
  expect(screen.getByRole('link', { name: 'Предложить доработку' })).toHaveAttribute('href', 'https://t.me/pavelnasuta')
  expect(screen.getByTestId('settings-screen-transition')).toHaveClass('sinhronica-screen')
  expect(screen.queryByRole('link', { name: 'Настройки' })).not.toBeInTheDocument()
  expect(screen.getByRole('presentation')).toHaveClass('object-contain')
})

it('hydrates stored achievements before creating a local backup', () => {
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify([{
    id: 'combo-april', performedOn: '2026-04-10', eventName: 'Кубок Федерации', discipline: 'combo', score: 9.25, medal: 'gold', createdAt: '2026-04-10T10:00:00.000Z', updatedAt: '2026-04-10T10:00:00.000Z',
  }]))

  render(<SettingsPage onBack={vi.fn()} />)

  expect(useAchievementsStore.getState().achievements).toEqual([expect.objectContaining({ id: 'combo-april' })])
})

it('hydrates local figure study statuses before creating a local backup', () => {
  localStorage.setItem(FIGURE_PROGRESS_STORAGE_KEY, JSON.stringify([{
    figureCode: '106', status: 'learning', updatedAt: '2026-11-16T00:00:00.000Z',
  }]))

  render(<SettingsPage onBack={vi.fn()} />)

  expect(useFigureProgressStore.getState().progress).toEqual([expect.objectContaining({ figureCode: '106', status: 'learning' })])
})

it('hydrates local diary entries before creating a local backup', () => {
  localStorage.setItem(TRAINING_DIARY_STORAGE_KEY, JSON.stringify([{
    id: 'practice', performedOn: '2026-11-16', types: ['water'], mood: 'good', createdAt: '2026-11-16T00:00:00.000Z', updatedAt: '2026-11-16T00:00:00.000Z',
  }]))

  render(<SettingsPage onBack={vi.fn()} />)

  expect(useTrainingDiaryStore.getState().entries).toEqual([expect.objectContaining({ id: 'practice', mood: 'good' })])
})

it('hydrates local routine cards before creating a local backup', () => {
  localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify([{
    id: 'azure', title: 'Лазурь', context: 'training', discipline: 'group', programType: 'free', ageGroup: 'Девушки 13–15 лет', activeAthleteCount: 8, reserveAthleteCount: 0, athleteNames: [], blocks: [], createdAt: '2026-11-16T00:00:00.000Z', updatedAt: '2026-11-16T00:00:00.000Z',
  }]))

  render(<SettingsPage onBack={vi.fn()} />)

  expect(useRoutinesStore.getState().routines).toEqual([expect.objectContaining({ id: 'azure', title: 'Лазурь' })])
})
