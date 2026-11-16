import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { UsefulPage } from './UsefulPage'

it('shows three non-interactive useful modules marked as in development', () => {
  render(<UsefulPage />)

  expect(screen.getByRole('heading', { name: 'Полезное' })).toBeInTheDocument()
  expect(screen.getByText('Калькулятор баллов')).toBeInTheDocument()
  expect(screen.getByText('Правила')).toBeInTheDocument()
  expect(screen.getByText('Скоро ещё больше полезного')).toBeInTheDocument()
  expect(screen.getAllByText('В разработке')).toHaveLength(3)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
