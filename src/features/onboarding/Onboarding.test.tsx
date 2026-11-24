import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAthleteProfileStore } from '../../stores/athlete-profile-store'
import { useRoleProfileStore } from '../../stores/role-profile-store'
import { Onboarding } from './Onboarding'

describe('Onboarding', () => {
  beforeEach(() => { window.localStorage.clear(); useAthleteProfileStore.setState({ profile: null }); useRoleProfileStore.setState({ profile: null }) })
  afterEach(cleanup)
  it('shows a distinct supplied avatar on every role tile', () => { render(<Onboarding />); expect(screen.getByRole('img', { name: 'Родитель с экипировкой и бюджетом' })).toHaveAttribute('src', '/onboarding/role-parent.png') })
  it('accepts delfinik as a real selected sport rank for an existing athlete', async () => { const user = userEvent.setup(); render(<Onboarding initialProfile={{ name: 'Алина', birthDate: '2014-11-16', city: 'Казань' }} />); await user.selectOptions(screen.getByLabelText('Спортивный разряд'), 'дельфиник'); await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' })); expect(JSON.parse(localStorage.getItem('sinhronica:role-profile:v1') ?? 'null')).toEqual(expect.objectContaining({ version: 3, role: 'athlete', profile: expect.objectContaining({ sportRank: 'дельфиник' }) })) })
  it('creates a one-child parent profile without asking for a birth date', async () => { const user = userEvent.setup(); render(<Onboarding />); await user.click(screen.getByRole('radio', { name: 'Родитель' })); await user.click(screen.getByRole('button', { name: 'Продолжить' })); await user.type(screen.getByLabelText('Как тебя зовут?'), 'Елена'); await user.type(screen.getByLabelText('Как зовут ребёнка?'), 'Алина'); expect(screen.queryByLabelText('Дата рождения ребёнка')).not.toBeInTheDocument(); await user.type(screen.getByLabelText('Город'), 'Казань'); await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' })); expect(useRoleProfileStore.getState().profile).toMatchObject({ role: 'parent', profile: { children: [{ id: 'child-1', name: 'Алина', sportRank: 'Не указан' }] } }) })
  it('saves a coach profile with storage v3', async () => { const user = userEvent.setup(); const onProfileCreated = vi.fn(); render(<Onboarding onProfileCreated={onProfileCreated} />); await user.click(screen.getByRole('radio', { name: 'Тренер' })); await user.click(screen.getByRole('button', { name: 'Продолжить' })); await user.type(screen.getByLabelText('Как тебя зовут?'), 'Ольга'); await user.click(screen.getByRole('button', { name: 'Открыть Синхронику' })); expect(JSON.parse(localStorage.getItem('sinhronica:role-profile:v1') ?? 'null')).toEqual({ version: 3, role: 'coach', profile: { name: 'Ольга' } }); expect(onProfileCreated).toHaveBeenCalledOnce() })
})
