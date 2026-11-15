import { expect, test } from '@playwright/test'

test('collects the athlete profile locally before opening the app', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()

  await page.goto('/starter-kit/')
  await expect(page.getByRole('heading', { name: 'Привет, это Синхроника' })).toBeVisible()

  for (let step = 0; step < 5; step += 1) {
    await page.getByRole('button', { name: 'Продолжить' }).click()
  }

  await page.getByLabel('Как тебя зовут?').fill('Алина')
  await page.getByLabel('Дата рождения').fill('2014-11-16')
  await page.getByLabel('Город').fill('Казань')
  await page.getByRole('button', { name: 'Открыть Синхронику' }).click()

  await expect(page.getByRole('heading', { name: 'Привет, Алина' })).toBeVisible()
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('sinhronica:athlete-profile:v1'))).toBe(JSON.stringify({
    version: 1,
    profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань' },
  }))

  await context.close()
})
