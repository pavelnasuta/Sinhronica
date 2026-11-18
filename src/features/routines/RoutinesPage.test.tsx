import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'

import { useRoutinesStore } from '../../stores/routines-store'
import { RoutinesPage } from './RoutinesPage'

afterEach(() => { cleanup(); localStorage.clear(); useRoutinesStore.setState({ routines: [], storageStatus: 'ready' }) })

it('uses coach copy for a working routine card', () => {
  render(<RoutinesPage audience="coach" />)
  expect(screen.getByText('Тренерская работа')).toBeVisible()
  expect(screen.getByRole('heading', { name: 'Карточка номера — в одном месте' })).toBeVisible()
  expect(screen.getByText('Добавь состав, блоки, таймлайн и заметки для работы в бассейне.')).toBeVisible()
})

it('creates, opens, edits and deletes a local routine card', async () => {
  const user = userEvent.setup()
  render(<RoutinesPage />)
  await user.click(screen.getByRole('button', { name: 'Создать номер' }))
  await user.type(screen.getByLabelText('Название номера'), 'Лазурь')
  await user.clear(screen.getByLabelText('Участниц в номере'))
  await user.type(screen.getByLabelText('Участниц в номере'), '8')
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))
  expect(screen.getByRole('heading', { name: 'Лазурь' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Редактировать номер' }))
  await user.clear(screen.getByLabelText('Название номера'))
  await user.type(screen.getByLabelText('Название номера'), 'Волна')
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))
  expect(screen.getByRole('heading', { name: 'Волна' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Удалить номер' }))
  await user.click(screen.getByRole('button', { name: 'Удалить номер' }))
  expect(screen.getByRole('button', { name: 'Создать номер' })).toBeVisible()
})
