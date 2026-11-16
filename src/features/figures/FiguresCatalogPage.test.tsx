import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'

import { useFigureProgressStore } from '../../stores/figure-progress-store'
import { FiguresCatalogPage } from './FiguresCatalogPage'

afterEach(() => useFigureProgressStore.setState({ progress: [], storageStatus: 'ready' }))

it('labels non-official technique descriptions as editorial reference material', async () => {
  const user = userEvent.setup()
  render(<FiguresCatalogPage onBack={() => undefined} />)

  await user.click(screen.getByRole('button', { name: /106.*Прямая балетная нога/i }))

  expect(screen.getByText('Описание из справочного пакета 2025; сверяй технику с актуальными правилами.')).toBeVisible()
  expect(screen.queryByText(/проверенный текст 2026/i)).not.toBeInTheDocument()
})
