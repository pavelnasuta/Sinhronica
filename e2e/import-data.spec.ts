import { expect, test } from '@playwright/test'

test('imports a validated backup only after confirmation and restores local data', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await context.addInitScript(() => {
    if (!localStorage.getItem('sinhronica:athlete-profile:v2')) localStorage.setItem('sinhronica:athlete-profile:v2', JSON.stringify({ version: 2, profile: { name: 'Старая', birthDate: '2014-11-16', city: 'Москва', sportRank: 'III юношеский разряд' } }))
  })
  const page = await context.newPage()
  await page.goto('/starter-kit/#settings')
  await expect(page.getByRole('heading', { name: 'Настройки' })).toBeVisible()

  await page.setInputFiles('input[type="file"]', 'e2e/fixtures/import-data.json')
  await expect(page.getByRole('heading', { name: 'Заменить данные из резервной копии?' })).toBeVisible()
  await page.getByRole('button', { name: 'Заменить данные' }).click()

  await expect(page.getByRole('heading', { name: 'Настройки' })).toBeVisible()
  await expect(page.getByLabel('Как тебя зовут?')).toHaveValue('Алина')
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('sinhronica:training-diary:v1'))).toContain('practice')
  await context.close()
})
