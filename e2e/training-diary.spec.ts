import { expect, test } from '@playwright/test'

const athleteProfile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profile }) => {
    window.localStorage.setItem('sinhronica:athlete-profile:v2', JSON.stringify({ version: 2, profile }))
  }, { profile: athleteProfile })
})

test('records a local training diary entry and reflects its gentle mood trace on home', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/starter-kit/')
  await page.getByRole('button', { name: 'Открыть дневник тренировок' }).click()
  await expect(page.getByRole('heading', { name: 'Дневник тренировок' })).toBeVisible()
  await page.getByRole('button', { name: 'Добавить тренировку' }).click()
  await page.getByRole('button', { name: 'Вода', exact: true }).click()
  await page.getByRole('button', { name: 'Хореография', exact: true }).click()
  await page.getByLabel(/Длительность/).fill('90')
  await page.getByLabel(/Заметка/).fill('Собрали переходы')
  await page.getByRole('button', { name: 'Хорошо', exact: true }).click()
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await expect(page.getByText('Собрали переходы')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Собрали переходы')).toBeVisible()
  await page.getByRole('button', { name: 'Назад' }).click()
  await expect(page.getByText('1 тренировка на этой неделе')).toBeVisible()
  await expect(page.getByLabel('Последние отмеченные ощущения после тренировок')).toBeVisible()

  const layout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(layout.scrollWidth).toBe(layout.clientWidth)
})
