import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it } from 'vitest'

import { useAchievementsStore } from '../../stores/achievements-store'
import { type ParentChild, useRoleProfileStore } from '../../stores/role-profile-store'
import { type Achievement } from './achievement-types'
import { AchievementsPage } from './AchievementsPage'

const parentChildren: ParentChild[] = [
  { id: 'child-1', name: 'Алина', sportRank: 'КМС' },
  { id: 'child-2', name: 'Маша', sportRank: 'I спортивный разряд' },
]

beforeEach(() => {
  localStorage.clear()
  useRoleProfileStore.setState({ profile: { role: 'parent', profile: { name: 'Елена', city: 'Казань', children: parentChildren } } })
  const achievements: Achievement[] = [
    { id: 'alina', performedOn: '2026-05-01', eventName: 'Кубок Алины', discipline: 'solo', score: 8.2, medal: 'gold', childId: 'child-1', createdAt: '2026-05-01T10:00:00.000Z', updatedAt: '2026-05-01T10:00:00.000Z' },
    { id: 'masha', performedOn: '2026-05-02', eventName: 'Кубок Маши', discipline: 'duet', score: 8.4, medal: 'silver', childId: 'child-2', createdAt: '2026-05-02T10:00:00.000Z', updatedAt: '2026-05-02T10:00:00.000Z' },
  ]
  localStorage.setItem('sinhronica:achievements:v1', JSON.stringify(achievements))
  useAchievementsStore.setState({ achievements, storageStatus: 'ready' })
})
afterEach(cleanup)

it('filters parent achievements by child and assigns a child on create', async () => {
  const user = userEvent.setup()
  render(<AchievementsPage parentChildren={parentChildren} />)

  expect(screen.getByRole('heading', { name: 'Достижения детей' })).toBeVisible()
  await user.selectOptions(screen.getByLabelText('Ребёнок'), 'child-2')
  expect(screen.getByText('Кубок Маши')).toBeVisible()
  expect(screen.queryByText('Кубок Алины')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Добавить достижение' }))
  expect(screen.getByLabelText('Для ребёнка')).toHaveValue('child-1')
  await user.selectOptions(screen.getByLabelText('Для ребёнка'), 'child-2')
  await user.type(screen.getByLabelText('Соревнование или событие'), 'Старт Маши')
  await user.type(screen.getByLabelText('Балл'), '9')
  await user.click(screen.getByRole('button', { name: 'Сохранить достижение' }))

  expect(useAchievementsStore.getState().achievements.at(-1)).toMatchObject({ eventName: 'Старт Маши', childId: 'child-2' })
})

it('shows each child name on a parent card and awards a selected rank to that child', async () => {
  const user = userEvent.setup()
  render(<AchievementsPage parentChildren={parentChildren} />)

  expect(screen.getAllByTestId('achievement-card').map((card) => card.textContent).join(' ')).toContain('Алина')
  expect(screen.getAllByTestId('achievement-card').map((card) => card.textContent).join(' ')).toContain('Маша')
  await user.click(screen.getByRole('button', { name: 'Добавить достижение' }))
  await user.selectOptions(screen.getByLabelText('Для ребёнка'), 'child-2')
  await user.type(screen.getByLabelText('Соревнование или событие'), 'Кубок Маши — разряд')
  await user.type(screen.getByLabelText('Балл'), '9')
  await user.selectOptions(screen.getByLabelText('Получен новый разряд'), 'КМС')
  await user.click(screen.getByRole('button', { name: 'Сохранить достижение' }))

  expect(useRoleProfileStore.getState().profile).toMatchObject({ role: 'parent', profile: { children: [
    { id: 'child-1', sportRank: 'КМС' },
    { id: 'child-2', sportRank: 'КМС' },
  ] } })
})
