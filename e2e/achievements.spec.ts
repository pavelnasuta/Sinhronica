import { expect, test } from '@playwright/test'

const athleteProfile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profile }) => {
    window.localStorage.setItem('sinhronica:athlete-profile:v2', JSON.stringify({ version: 2, profile }))
  }, { profile: athleteProfile })
})

async function addAchievement(page: import('@playwright/test').Page, values: { date: string; event: string; score: string }) {
  await page.getByRole('button', { name: /Добавить достижение|Добавить$/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Дата проведения').fill(values.date)
  await dialog.getByLabel('Соревнование или событие').fill(values.event)
  await dialog.getByLabel('Дисциплина').selectOption('combo')
  await dialog.getByLabel('Балл').fill(values.score)
  await dialog.getByRole('button', { name: 'Сохранить достижение' }).click()
}

test('keeps achievements by performance date and compares the nearest earlier result', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Достижения' }).click()

  await addAchievement(page, { date: '2026-03-05', event: 'Весенний старт', score: '8' })
  await addAchievement(page, { date: '2026-04-10', event: 'Кубок Федерации', score: '9.25' })

  const cards = page.getByTestId('achievement-card')
  await expect(cards).toHaveCount(2)
  await expect(cards.nth(0)).toContainText('Кубок Федерации')
  await expect(cards.nth(0)).toContainText('Выше на 1,25')

  await page.reload()
  await expect(cards).toHaveCount(2)
  await expect(cards.nth(0)).toContainText('Кубок Федерации')

  await cards.nth(0).getByRole('button', { name: 'Изменить достижение Кубок Федерации' }).click()
  await page.getByRole('dialog').getByLabel('Балл').fill('9.5')
  await page.getByRole('dialog').getByRole('button', { name: 'Сохранить достижение' }).click()
  await expect(cards.nth(0)).toContainText('9,5')

  await cards.nth(1).getByRole('button', { name: 'Удалить достижение Весенний старт' }).click()
  await page.getByRole('button', { name: 'Удалить достижение' }).click()
  await expect(cards).toHaveCount(1)
})

test('keeps achievement navigation readable without horizontal overflow on narrow phones', async ({ page }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/starter-kit/')
    await page.getByRole('link', { name: 'Достижения' }).click()
    await expect(page.getByRole('heading', { name: 'Здесь будут твои победы' })).toBeVisible()
    const layout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, mascotFit: getComputedStyle(document.querySelector('img[src*="onboarding/progress.webp"]')!).objectFit }))
    expect(layout.scrollWidth).toBe(layout.clientWidth)
    expect(layout.mascotFit).toBe('contain')
  }
})

test('keeps parent achievements and useful tools inside 360 and 390 pixel viewports', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.localStorage.setItem('sinhronica:role-profile:v1', JSON.stringify({ version: 3, role: 'parent', profile: { name: 'Елена', city: 'Казань', children: [{ id: 'child-1', name: 'Алина', sportRank: 'КМС' }] } }))
    window.localStorage.setItem('sinhronica:achievements:v1', JSON.stringify([{ id: 'alina', performedOn: '2026-11-10', eventName: 'Кубок', discipline: 'solo', score: 8.5, medal: 'gold', childId: 'child-1', createdAt: '2026-11-10T00:00:00.000Z', updatedAt: '2026-11-10T00:00:00.000Z' }]))
  })

  for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/starter-kit/#achievements')
    await expect(page.getByRole('heading', { name: 'Достижения' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Фильтры достижений' })).toHaveAttribute('aria-expanded', 'false')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

    await page.goto('/starter-kit/#useful')
    await page.getByRole('button', { name: /Калькулятор баллов/i }).click()
    await expect(page.getByRole('heading', { name: 'Калькулятор баллов' })).toBeVisible()
    await page.getByRole('button', { name: 'К полезному' }).click()
    await expect(page.getByRole('heading', { name: 'Полезное' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  }
})
