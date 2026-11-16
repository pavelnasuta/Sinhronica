import { expect, test } from '@playwright/test'

const athleteProfile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profile }) => {
    window.localStorage.setItem('sinhronica:athlete-profile:v2', JSON.stringify({ version: 2, profile }))
  }, { profile: athleteProfile })
})

test('shows useful modules as non-interactive in-development cards on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Полезное' }).click()

  await expect(page.getByRole('heading', { name: 'Полезное' })).toBeVisible()
  await expect(page.getByText('В разработке')).toHaveCount(3)
  await expect(page.getByText('Калькулятор баллов')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Правила' })).toBeVisible()
  await expect(page.getByText('Скоро ещё больше полезного')).toBeVisible()
  await expect(page.locator('main').getByRole('link')).toHaveCount(0)
  await expect(page.locator('main').getByRole('button')).toHaveCount(0)

  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(layout.scrollWidth).toBe(layout.clientWidth)
})

test('shows the routines in-development state with Aqui on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Номера' }).click()

  await expect(page.getByRole('heading', { name: 'Номера' })).toBeVisible()
  await expect(page.getByText('Раздел в разработке')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Акви тренируется перед новыми номерами' })).toHaveAttribute('src', /onboarding\/practice\.webp/)

  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    mascotFit: getComputedStyle(document.querySelector('img[src*="onboarding/practice.webp"]')!).objectFit,
  }))
  expect(layout.scrollWidth).toBe(layout.clientWidth)
  expect(layout.mascotFit).toBe('contain')
})
