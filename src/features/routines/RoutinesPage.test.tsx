import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { RoutinesPage } from './RoutinesPage'

it('shows a calm in-development state for routines with Aqui', () => {
  render(<RoutinesPage />)

  expect(screen.getByRole('heading', { name: 'Номера' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Акви тренируется перед новыми номерами' })).toHaveAttribute('src', expect.stringContaining('onboarding/practice.webp'))
  expect(screen.getByText('Раздел в разработке')).toBeInTheDocument()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
