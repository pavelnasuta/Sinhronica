import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Onboarding } from './Onboarding'

describe('Onboarding', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(cleanup)

  it('asks an existing athlete only for the missing sport rank', async () => {
    const user = userEvent.setup()
    render(<Onboarding initialProfile={{ name: 'Алина', birthDate: '2014-11-16', city: 'Казань' }} />)

    expect(screen.getByText('Шаг 6 из 6')).toBeVisible()
    expect(screen.getByLabelText('Как тебя зовут?')).toHaveValue('Алина')
    await user.selectOptions(screen.getByLabelText('Спортивный разряд'), 'КМС')
    await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' }))

    expect(JSON.parse(window.localStorage.getItem('sinhronica:athlete-profile:v2') ?? 'null')).toEqual({
      version: 2,
      profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'КМС' },
    })
  })

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
    await user.selectOptions(screen.getByLabelText('Спортивный разряд'), 'дельфиник')
    await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' }))

    expect(JSON.parse(window.localStorage.getItem('sinhronica:athlete-profile:v2') ?? 'null')).toEqual({
      version: 2,
      profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' },
    })
  })
})
