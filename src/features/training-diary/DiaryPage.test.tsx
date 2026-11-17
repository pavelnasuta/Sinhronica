import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useTrainingDiaryStore } from '../../stores/training-diary-store'
import { DiaryPage } from './DiaryPage'

beforeEach(() => { localStorage.clear(); useTrainingDiaryStore.setState({ entries: [], storageStatus: 'ready' }) })
afterEach(cleanup)

it('creates an editable local training entry with types, note and optional feeling', async () => {
  const user = userEvent.setup()
  render(<DiaryPage onBack={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: 'Добавить тренировку' }))
  await user.click(screen.getByRole('button', { name: 'Вода' }))
  await user.click(screen.getByRole('button', { name: 'Акробатика' }))
  await user.type(screen.getByLabelText(/Длительность/), '90')
  await user.type(screen.getByLabelText(/Заметка/), 'Поддержки стали увереннее')
  await user.click(screen.getByRole('button', { name: 'Хорошо' }))
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))

  expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent?.includes('Вода · Акробатика') && element.children.length === 0)).toBeVisible()
  expect(screen.getByText('Поддержки стали увереннее')).toBeVisible()
  expect(screen.getByText('После: Хорошо')).toBeVisible()

  await user.click(screen.getByRole('button', { name: 'Изменить тренировку' }))
  await user.clear(screen.getByLabelText(/Заметка/))
  await user.type(screen.getByLabelText(/Заметка/), 'Закрепили поддержки')
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))
  expect(screen.getByText('Закрепили поддержки')).toBeVisible()
})

it('requires a training date and keeps the entry dialog open', async () => {
  const user = userEvent.setup()
  render(<DiaryPage onBack={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: 'Добавить тренировку' }))
  await user.click(screen.getByRole('button', { name: 'Вода' }))
  await user.clear(screen.getByLabelText('Когда была тренировка?'))
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Укажи дату тренировки.')
  expect(screen.getByRole('dialog', { name: 'Новая тренировка' })).toBeVisible()
})

it('warns if browser storage cannot save a diary entry', () => {
  useTrainingDiaryStore.setState({ storageStatus: 'unsaved' })
  render(<DiaryPage onBack={vi.fn()} />)
  expect(screen.getByRole('status', { name: 'Состояние хранения' })).toHaveTextContent('Изменения сохранены только в памяти')
})

it('uses a red mood badge for a hard training session', () => {
  useTrainingDiaryStore.setState({ entries: [{ id: 'practice', performedOn: '2026-11-16', types: ['water'], mood: 'heavy', createdAt: '2026-11-16T10:00:00.000Z', updatedAt: '2026-11-16T10:00:00.000Z' }], storageStatus: 'unsaved' })
  render(<DiaryPage onBack={vi.fn()} />)
  expect(screen.getByText((_, element) => element?.textContent === 'После: Тяжело')).toHaveClass('bg-red-500/15')
})

it('shows all, water and dryland totals in diary summary tiles', () => {
  useTrainingDiaryStore.setState({ entries: [
    { id: 'one', performedOn: '2026-11-16', types: ['water', 'dryland'], createdAt: '2026-11-16T10:00:00.000Z', updatedAt: '2026-11-16T10:00:00.000Z' },
    { id: 'two', performedOn: '2026-11-15', types: ['water'], createdAt: '2026-11-15T10:00:00.000Z', updatedAt: '2026-11-15T10:00:00.000Z' },
    { id: 'three', performedOn: '2026-11-14', types: ['acrobatics'], createdAt: '2026-11-14T10:00:00.000Z', updatedAt: '2026-11-14T10:00:00.000Z' },
  ] })
  useTrainingDiaryStore.setState({ storageStatus: 'unsaved' })
  render(<DiaryPage onBack={vi.fn()} />)
  const summary = screen.getByLabelText('Сводка тренировок')
  expect(summary).toHaveTextContent('Всего3')
  expect(summary).toHaveTextContent('Вода2')
  expect(summary).toHaveTextContent('Суша1')
})

it('requires a practice type instead of saving an empty entry', async () => {
  const user = userEvent.setup()
  render(<DiaryPage onBack={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: 'Добавить тренировку' }))
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Выбери хотя бы один тип тренировки.')
  expect(screen.getByRole('dialog', { name: 'Новая тренировка' })).toBeVisible()
})
