import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { PostProfileInstallGuide } from './PostProfileInstallGuide'

it('shows Android and iOS installation instructions with the supplied mascot', async () => {
  const user = userEvent.setup()
  const onFinish = vi.fn()
  render(<PostProfileInstallGuide onFinish={onFinish} />)

  expect(screen.getByRole('img', { name: 'Акви подсказывает, как установить приложение' })).toHaveAttribute('src', '/onboarding/install-guide.png')
  expect(screen.getByText(/Android/i)).toBeVisible()
  expect(screen.getByText(/iPhone и iPad/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' }))
  expect(onFinish).toHaveBeenCalledOnce()
})
