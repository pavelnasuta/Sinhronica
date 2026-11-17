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

  expect(screen.getByText(/Вода/)).toBeVisible()
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

it('requires a practice type instead of saving an empty entry', async () => {
  const user = userEvent.setup()
  render(<DiaryPage onBack={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: 'Добавить тренировку' }))
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Выбери хотя бы один тип тренировки.')
  expect(screen.getByRole('dialog', { name: 'Новая тренировка' })).toBeVisible()
})
