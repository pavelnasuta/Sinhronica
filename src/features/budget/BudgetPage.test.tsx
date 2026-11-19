import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it } from 'vitest'

import { useBudgetStore } from '../../stores/budget-store'
import { useRoleProfileStore } from '../../stores/role-profile-store'
import { BudgetPage } from './BudgetPage'

beforeEach(() => {
  localStorage.clear()
  useRoleProfileStore.setState({ profile: { role: 'parent', profile: { name: 'Елена', city: 'Казань', children: [
    { id: 'child-1', name: 'Алина', sportRank: 'КМС' },
    { id: 'child-2', name: 'Маша', sportRank: 'I спортивный разряд' },
  ] } } })
  const entries = [
    { id: 'one', spentOn: '2026-11-05', amount: 1000, category: 'training' as const, comment: '', childId: 'child-1' as const, createdAt: '2026-11-05T10:00:00.000Z', updatedAt: '2026-11-05T10:00:00.000Z' },
    { id: 'two', spentOn: '2026-11-10', amount: 500, category: 'transport' as const, comment: '', childId: 'child-2' as const, createdAt: '2026-11-10T10:00:00.000Z', updatedAt: '2026-11-10T10:00:00.000Z' },
    { id: 'both', spentOn: '2026-10-10', amount: 700, category: 'training' as const, comment: '', childId: 'both' as const, createdAt: '2026-10-10T10:00:00.000Z', updatedAt: '2026-10-10T10:00:00.000Z' },
  ]
  localStorage.setItem('sinhronica:parent-budget:v1', JSON.stringify(entries))
  useBudgetStore.setState({ entries, storageStatus: 'ready' })
})
afterEach(cleanup)

it('filters parent expenses by child and category and recalculates summaries', async () => {
  const user = userEvent.setup()
  render(<BudgetPage />)

  expect(screen.queryByText('Семейные финансы')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Фильтры расходов' })).toHaveAttribute('aria-expanded', 'false')
  await user.click(screen.getByRole('button', { name: 'Фильтры расходов' }))
  expect(screen.getByLabelText('Ребёнок')).toBeVisible()
  expect(screen.getByLabelText('Категория')).toBeVisible()
  expect(screen.getByText('Алина')).toBeVisible()
  expect(screen.getByText('Маша')).toBeVisible()
  expect(screen.getByText('Оба ребёнка')).toBeVisible()
  expect(screen.getByText('За этот месяц').parentElement).toHaveTextContent('1 500')

  await user.selectOptions(screen.getByLabelText('Ребёнок'), 'child-1')
  expect(screen.getByText('За этот месяц').parentElement).toHaveTextContent('1 000')
  expect(screen.queryByText(/Маша ·/)).not.toBeInTheDocument()

  await user.selectOptions(screen.getByLabelText('Категория'), 'transport')
  expect(screen.getByText('За этот месяц').parentElement).toHaveTextContent('0')
  expect(screen.getByText('Расходов по выбранным фильтрам пока нет')).toBeVisible()
})

it('selects the child or shared allocation while adding an expense', async () => {
  const user = userEvent.setup()
  render(<BudgetPage />)

  await user.click(screen.getByRole('button', { name: 'Расход' }))
  expect(screen.getByLabelText('Для кого расход')).toHaveValue('child-1')
  await user.selectOptions(screen.getByLabelText('Для кого расход'), 'both')
  await user.type(screen.getByLabelText('Сумма'), '800')
  await user.click(screen.getByRole('button', { name: 'Сохранить расход' }))

  expect(useBudgetStore.getState().entries.at(-1)).toMatchObject({ childId: 'both', amount: 800 })
})
