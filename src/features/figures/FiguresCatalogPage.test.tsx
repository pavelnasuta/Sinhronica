import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'

import { useFigureProgressStore } from '../../stores/figure-progress-store'
import { FiguresCatalogPage } from './FiguresCatalogPage'

afterEach(() => { cleanup(); useFigureProgressStore.setState({ progress: [], storageStatus: 'ready' }) })

it('keeps figures as a read-only reference for parent and coach roles', async () => {
  const user = userEvent.setup()
  render(<FiguresCatalogPage audience="coach" onBack={() => undefined} />)

  await user.click(screen.getByRole('button', { name: /106.*Прямая балетная нога/i }))

  expect(screen.getAllByText(/DD 1,6/).length).toBeGreaterThan(0)
  expect(screen.queryByText('Освоение')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Изучаю' })).not.toBeInTheDocument()
})

it('labels non-official technique descriptions as editorial reference material', async () => {
  const user = userEvent.setup()
  render(<FiguresCatalogPage onBack={() => undefined} />)

  await user.click(screen.getByRole('button', { name: /106.*Прямая балетная нога/i }))

  expect(screen.getByText('Описание из справочного пакета 2025; сверяй технику с актуальными правилами.')).toBeVisible()
  expect(screen.queryByText(/проверенный текст 2026/i)).not.toBeInTheDocument()
})
