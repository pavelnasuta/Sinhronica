import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const updateServiceWorker = vi.fn()
const setNeedRefresh = vi.fn()
let needRefresh = false

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [false, vi.fn()],
    updateServiceWorker,
  }),
}))

import { PwaUpdateNotice } from './pwa-update-notice'

describe('PwaUpdateNotice', () => {
  afterEach(cleanup)

  beforeEach(() => {
    needRefresh = false
    updateServiceWorker.mockReset().mockResolvedValue(undefined)
    setNeedRefresh.mockReset()
  })

  it('stays hidden until a new version is ready', () => {
    render(<PwaUpdateNotice />)

    expect(screen.queryByRole('dialog', { name: 'Доступно обновление приложения' })).not.toBeInTheDocument()
  })

  it('lets the user reload into a ready update', async () => {
    needRefresh = true
    const user = userEvent.setup()
    render(<PwaUpdateNotice />)

    const dialog = screen.getByRole('dialog', { name: 'Есть кое-что новое' })
    expect(dialog).toHaveClass('fixed', 'inset-0')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent('Есть кое-что новое')
    expect(screen.getByRole('img', { name: 'Акви задумалась об обновлении' })).toHaveAttribute('src', expect.stringContaining('aqui-thinking.png'))
    await user.click(screen.getByRole('button', { name: 'Обновить' }))

    expect(updateServiceWorker).toHaveBeenCalledOnce()
  })

  it('can dismiss the notice without updating', async () => {
    needRefresh = true
    const user = userEvent.setup()
    render(<PwaUpdateNotice />)

    await user.click(screen.getByRole('button', { name: 'Позже' }))

    expect(setNeedRefresh).toHaveBeenCalledWith(false)
    expect(updateServiceWorker).not.toHaveBeenCalled()
  })
})
