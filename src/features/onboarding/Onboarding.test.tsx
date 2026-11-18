import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAthleteProfileStore } from '../../stores/athlete-profile-store'
import { useRoleProfileStore } from '../../stores/role-profile-store'
import { Onboarding } from './Onboarding'

describe('Onboarding', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useAthleteProfileStore.setState({ profile: null })
    useRoleProfileStore.setState({ profile: null })
  })
  afterEach(cleanup)

  it('shows a distinct supplied avatar on every role tile', () => {
    render(<Onboarding />)

    expect(screen.getByRole('img', { name: 'Спортсменка у воды' })).toHaveAttribute('src', '/onboarding/role-athlete.png')
    expect(screen.getByRole('img', { name: 'Родитель с экипировкой и бюджетом' })).toHaveAttribute('src', '/onboarding/role-parent.png')
    expect(screen.getByRole('img', { name: 'Тренер по синхронному плаванию' })).toHaveAttribute('src', '/onboarding/role-coach.png')
  })

  it('asks an existing athlete only for the missing sport rank', async () => {
    const user = userEvent.setup()
    render(<Onboarding initialProfile={{ name: 'Алина', birthDate: '2014-11-16', city: 'Казань' }} />)

    expect(screen.getByText('Профиль спортсменки')).toBeVisible()
    expect(screen.getByLabelText('Как тебя зовут?')).toHaveValue('Алина')
    await user.selectOptions(screen.getByLabelText('Спортивный разряд'), 'КМС')
    await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' }))

    expect(JSON.parse(window.localStorage.getItem('sinhronica:athlete-profile:v2') ?? 'null')).toEqual({
      version: 2,
      profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'КМС' },
    })
    expect(JSON.parse(window.localStorage.getItem('sinhronica:role-profile:v1') ?? 'null')).toEqual({
      version: 1,
      role: 'athlete',
      profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'КМС' },
    })
  })

  it('lets a new parent choose their role before saving a local profile', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    expect(screen.getByRole('heading', { name: 'Кто будет пользоваться Синхроникой?' })).toBeVisible()
    await user.click(screen.getByRole('radio', { name: 'Родитель' }))
    await user.click(screen.getByRole('button', { name: 'Продолжить' }))

    expect(screen.getByRole('heading', { name: 'Профиль родителя' })).toBeVisible()
    await user.type(screen.getByLabelText('Как тебя зовут?'), 'Елена')
    await user.type(screen.getByLabelText('Как зовут ребёнка?'), 'Алина')
    await user.type(screen.getByLabelText('Дата рождения ребёнка'), '2014-11-16')
    await user.type(screen.getByLabelText('Город'), 'Казань')
    await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' }))

    expect(JSON.parse(window.localStorage.getItem('sinhronica:role-profile:v1') ?? 'null')).toEqual({
      version: 1,
      role: 'parent',
      profile: { name: 'Елена', childName: 'Алина', childBirthDate: '2014-11-16', city: 'Казань' },
    })
    expect(window.localStorage.getItem('sinhronica:athlete-profile:v2')).toBeNull()
  })

  it('saves a coach profile without school or city fields', async () => {
    const user = userEvent.setup()
    const onProfileCreated = vi.fn()
    render(<Onboarding onProfileCreated={onProfileCreated} />)

    await user.click(screen.getByRole('radio', { name: 'Тренер' }))
    await user.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(screen.getByRole('heading', { name: 'Профиль тренера' })).toBeVisible()
    expect(screen.queryByLabelText('Город')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Как тебя зовут?'), 'Ольга')
    await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' }))

    expect(JSON.parse(window.localStorage.getItem('sinhronica:role-profile:v1') ?? 'null')).toEqual({
      version: 1,
      role: 'coach',
      profile: { name: 'Ольга' },
    })
    expect(onProfileCreated).toHaveBeenCalledOnce()
  })
})
