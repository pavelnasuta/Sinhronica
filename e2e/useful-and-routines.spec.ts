import { expect, test } from '@playwright/test'

const athleteProfile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profile }) => {
    window.localStorage.setItem('sinhronica:athlete-profile:v2', JSON.stringify({ version: 2, profile }))
  }, { profile: athleteProfile })
})

test('opens the figures catalog and score calculator from Useful without mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Полезное' }).click()

  await expect(page.getByRole('heading', { name: 'Полезное' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Калькулятор баллов/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Каталог фигур/i })).toBeVisible()
  await expect(page.getByText('В разработке')).toHaveCount(1)

  await page.getByRole('button', { name: /Каталог фигур/i }).click()
  await expect(page.getByRole('heading', { name: 'Каталог фигур' })).toBeVisible()
  await page.getByRole('button', { name: /106.*Прямая балетная нога/i }).click()
  await page.getByRole('button', { name: 'Освоено' }).click()
  await expect(page.getByText('Освоено').first()).toBeVisible()

  await page.getByRole('button', { name: 'К полезному' }).click()
  await page.getByRole('button', { name: /Калькулятор баллов/i }).click()
  await expect(page.getByRole('heading', { name: 'Калькулятор баллов' })).toBeVisible()
  await page.getByLabel('Фигура 1, судья 1').fill('7,0')
  await expect(page.getByText('Можно заменить только одну отсутствующую оценку судьи.')).toBeVisible()

  const layout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(layout.scrollWidth).toBe(layout.clientWidth)
})

test('returns to the top when switching app screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  await page.getByRole('link', { name: 'Полезное' }).click()

  await expect(page.getByRole('heading', { name: 'Полезное' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('opens the metronome from Useful and keeps its controls readable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Полезное' }).click()
  await page.getByRole('button', { name: /Метроном/i }).click()

  await expect(page.getByRole('heading', { name: 'Метроном' })).toBeVisible()
  const backButtonBox = await page.getByRole('button', { name: 'К полезному' }).boundingBox()
  expect(backButtonBox?.x).toBeGreaterThanOrEqual(16)
  await expect(page.getByLabel('Темп в ударах в минуту')).toHaveValue('100')
  await page.getByRole('button', { name: 'Увеличить темп' }).click()
  await expect(page.getByLabel('Темп в ударах в минуту')).toHaveValue('101')
  await page.getByRole('button', { name: 'Запустить метроном' }).click()
  await expect(page.getByRole('button', { name: 'Приостановить метроном' })).toBeVisible()

  const layout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(layout.scrollWidth).toBe(layout.clientWidth)
})

test('opens square breathing from Useful and keeps it usable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Полезное' }).click()
  await page.getByRole('button', { name: /Квадратное дыхание/i }).click()

  await expect(page.getByRole('heading', { name: 'Квадратное дыхание' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Акви в позе лотоса' })).toHaveAttribute('src', /mascots\/aqui-lotus\.png$/)
  await page.getByRole('button', { name: 'Начать дыхание' }).click()
  await expect(page.getByRole('button', { name: 'Приостановить дыхание' })).toBeVisible()
  await page.getByRole('button', { name: 'Приостановить дыхание' }).click()
  await expect(page.getByRole('button', { name: 'Продолжить дыхание' })).toBeVisible()

  const layout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(layout.scrollWidth).toBe(layout.clientWidth)
})

test('creates a persistent routine structure without mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Номера' }).click()

  await expect(page.getByRole('heading', { name: 'Номера' })).toBeVisible()
  await page.getByRole('button', { name: 'Создать номер' }).click()
  await page.getByLabel('Название номера').fill('Лазурь')
  await page.getByLabel('Участниц в номере').fill('8')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByRole('heading', { name: 'Лазурь' })).toBeVisible()
  await page.getByRole('button', { name: 'Блок' }).click()
  await page.getByLabel('Название').fill('Гибрид 1')
  await page.getByLabel('Начало, сек.').fill('30')
  await page.getByLabel('Конец, сек.').fill('45')
  await page.getByLabel('Ручная сложность').fill('3,2')
  await page.getByRole('button', { name: 'Сохранить блок' }).click()
  await expect(page.getByText('Гибрид 1')).toBeVisible()
  await expect(page.getByText('Сложность: 3,2')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: /Лазурь/i })).toBeVisible()

  const layout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(layout.scrollWidth).toBe(layout.clientWidth)
})
