import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { RoleReadyPage } from './RoleReadyPage'

it('uses the full athlete sticker banner in the parent workspace', () => {
  render(<RoleReadyPage roleProfile={{ role: 'parent', profile: { name: 'Елена', city: 'Казань', children: [{ id: 'child-1', name: 'Алина', sportRank: 'дельфиник' }] } }} onNavigate={vi.fn()} />)

  expect(screen.getByRole('heading', { name: 'Акви теперь в MAX' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Открыть стикерпак в MAX' })).toHaveAttribute('href', 'https://max.ru/stickerset/5nMnC50r-zfjveuv8tiRMN_2IaZYDdnEz4bTjJ8m2e0')
})
