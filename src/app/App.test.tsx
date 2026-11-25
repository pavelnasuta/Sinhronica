import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { useAthleteProfileStore } from '../stores/athlete-profile-store'
import { ROLE_PROFILE_STORAGE_KEY, useRoleProfileStore } from '../stores/role-profile-store'
import { App } from './App'

const scrollTo = vi.fn()
Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo })

afterEach(() => {
  cleanup()
  scrollTo.mockClear()
  window.localStorage.clear()
  useAthleteProfileStore.setState({ profile: null })
  useRoleProfileStore.setState({ profile: null })
  window.location.hash = ''
})

it('uses the expanded personal header only on the home page', () => {
  useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' } })
  window.location.hash = 'home'

  render(<App />)

  expect(screen.getByRole('heading', { name: 'Привет, Алина' })).toBeVisible()
  expect(screen.getByText('дельфиник')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Открыть настройки профиля' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Настройки' })).not.toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Акви рядом с твоими планами' })).toBeVisible()
})

it('migrates an existing athlete to the role profile without sending them through onboarding', async () => {
  useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' } })

  render(<App />)

  expect(screen.getByRole('heading', { name: 'Привет, Алина' })).toBeVisible()
  await waitFor(() => expect(JSON.parse(localStorage.getItem(ROLE_PROFILE_STORAGE_KEY) ?? 'null')).toEqual({
    version: 3,
    role: 'athlete',
    profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' },
  }))
})

it('opens a parent workspace with only parent navigation', async () => {
  useRoleProfileStore.setState({ profile: { role: 'parent', profile: { name: 'Елена', city: 'Казань', children: [{ id: 'child-1', name: 'Алина', sportRank: 'Не указан' }] } } })

  render(<App />)

  expect(screen.getByRole('heading', { name: 'Привет, Елена' })).toBeVisible()
  expect(screen.getAllByRole('link', { name: 'Бюджет' })).toHaveLength(2)
  expect(screen.queryAllByRole('link', { name: 'Фигуры' })).toHaveLength(0)
  expect(screen.queryByRole('link', { name: 'Номера' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Начать новый профиль' })).not.toBeInTheDocument()
  expect(screen.getByText('Алина · Не указан')).toBeVisible()
})

it('keeps parent settings inside the standard single horizontal gutter', () => {
  useRoleProfileStore.setState({ profile: { role: 'parent', profile: { name: 'Елена', city: 'Казань', children: [{ id: 'child-1', name: 'Алина', sportRank: 'Не указан' }] } } })
  window.location.hash = 'settings'

  const { container } = render(<App />)

  expect(screen.getByRole('heading', { name: 'Настройки' })).toBeVisible()
  expect(container.querySelectorAll('main')).toHaveLength(1)
})

it('routes a parent through every useful tool and returns each tool to Useful', async () => {
  const user = userEvent.setup()
  useRoleProfileStore.setState({ profile: { role: 'parent', profile: { name: 'Елена', city: 'Казань', children: [{ id: 'child-1', name: 'Алина', sportRank: 'Не указан' }] } } })
  window.location.hash = 'useful'

  render(<App />)

  await user.click(screen.getByRole('button', { name: /Калькулятор баллов/i }))
  expect(screen.getByRole('heading', { name: 'Калькулятор баллов' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'К полезному' }))
  expect(screen.getByRole('heading', { name: 'Полезное' })).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Каталог фигур/i }))
  expect(screen.getByRole('heading', { name: 'Каталог фигур' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'К полезному' }))
  expect(screen.getByRole('heading', { name: 'Полезное' })).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Метроном/i }))
  expect(screen.getByRole('heading', { name: 'Метроном' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'К полезному' }))
  expect(screen.getByRole('heading', { name: 'Полезное' })).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Квадратное дыхание/i }))
  expect(screen.getByRole('heading', { name: 'Квадратное дыхание' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'К полезному' }))
  expect(screen.getByRole('heading', { name: 'Полезное' })).toBeVisible()
})

it('opens a coach workspace without athlete diary or parent budget', async () => {
  const user = userEvent.setup()
  useRoleProfileStore.setState({ profile: { role: 'coach', profile: { name: 'Ольга' } } })

  render(<App />)

  expect(screen.getByRole('heading', { name: 'Ольга, рабочие инструменты под рукой' })).toBeVisible()
  expect(screen.getAllByRole('link', { name: 'Фигуры' })).toHaveLength(2)
  expect(screen.getAllByRole('link', { name: 'Номера' })).toHaveLength(2)
  expect(screen.queryAllByRole('link', { name: 'Бюджет' })).toHaveLength(0)
  expect(screen.queryByText('Дневник тренировок')).not.toBeInTheDocument()
  await user.click(screen.getAllByRole('link', { name: 'Номера' })[0])
  expect(screen.getByText('Тренерская работа')).toBeVisible()
  expect(screen.getByRole('heading', { name: 'Карточка номера — в одном месте' })).toBeVisible()
})

it('routes a coach through every useful tool instead of falling back to home', async () => {
  const user = userEvent.setup()
  useRoleProfileStore.setState({ profile: { role: 'coach', profile: { name: 'Ольга' } } })
  window.location.hash = 'useful'
  render(<App />)

  await user.click(screen.getByRole('button', { name: /Метроном/i }))
  expect(screen.getByRole('heading', { name: 'Метроном' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'К полезному' }))
  await user.click(screen.getByRole('button', { name: /Калькулятор баллов/i }))
  expect(screen.getByRole('heading', { name: 'Калькулятор баллов' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'К полезному' }))
  await user.click(screen.getByRole('button', { name: /Каталог фигур/i }))
  expect(screen.getByRole('heading', { name: 'Каталог фигур' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'К полезному' }))
  await user.click(screen.getByRole('button', { name: /Квадратное дыхание/i }))
  expect(screen.getByRole('heading', { name: 'Квадратное дыхание' })).toBeVisible()
})

it('returns to the top when the active screen changes', async () => {
  useAthleteProfileStore.setState({ profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' } })
  window.location.hash = 'home'
  render(<App />)
  scrollTo.mockClear()

  await act(async () => {
    window.location.hash = 'useful'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })

  await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0))
})
