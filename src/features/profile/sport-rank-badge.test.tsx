import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { SportRankBadge } from './sport-rank-badge'

it('maps each rank group to a readable non-gold tag', () => {
  const { rerender } = render(<SportRankBadge rank="дельфиник" />)
  expect(screen.getByText('дельфиник')).toHaveClass('bg-cyan-400/15')

  rerender(<SportRankBadge rank="III юношеский разряд" />)
  expect(screen.getByText('III юношеский разряд')).toHaveClass('bg-blue-500/15')

  rerender(<SportRankBadge rank="II спортивный разряд" />)
  expect(screen.getByText('II спортивный разряд')).toHaveClass('bg-indigo-500/15')

  rerender(<SportRankBadge rank="КМС" />)
  expect(screen.getByText('КМС')).toHaveClass('bg-violet-500/15')
})

it('keeps the entry-level rank readable on a light personal header', () => {
  render(<SportRankBadge rank="дельфиник" />)

  expect(screen.getByText('дельфиник')).toHaveClass('text-cyan-800')
  expect(screen.getByText('дельфиник')).toHaveClass('dark:text-cyan-100')
})
