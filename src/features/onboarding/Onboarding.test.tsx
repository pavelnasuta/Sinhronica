import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { Onboarding } from './Onboarding'

describe('Onboarding', () => {
  beforeEach(() => window.localStorage.clear())

  it('moves through five introduction screens before saving the athlete profile locally', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    expect(screen.getByRole('heading', { name: 'Привет, это Синхроника' })).toBeVisible()
    for (let step = 0; step < 5; step += 1) {
      await user.click(screen.getByRole('button', { name: 'Продолжить' }))
    }

    expect(screen.getByRole('heading', { name: 'Расскажи немного о себе' })).toBeVisible()
    await user.type(screen.getByLabelText('Как тебя зовут?'), 'Алина')
    await user.type(screen.getByLabelText('Дата рождения'), '2014-11-16')
    await user.type(screen.getByLabelText('Город'), 'Казань')
    await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' }))

    expect(JSON.parse(window.localStorage.getItem('sinhronica:athlete-profile:v1') ?? 'null')).toEqual({
      version: 1,
      profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань' },
    })
  })
})
