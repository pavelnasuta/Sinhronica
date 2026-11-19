import { expect, test } from '@playwright/test'

test('collects an athlete profile locally before opening the existing athlete workspace', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()

  await page.goto('/starter-kit/')
  await expect(page.getByRole('heading', { name: 'Кто будет пользоваться Синхроникой?' })).toBeVisible()
  await page.getByRole('radio', { name: 'Спортсменка' }).click()
  await page.getByRole('button', { name: 'Продолжить' }).click()

  await page.getByLabel('Как тебя зовут?').fill('Алина')
  await page.getByLabel('Дата рождения').fill('2014-11-16')
  await page.getByLabel('Город').fill('Казань')
  await page.getByLabel('Спортивный разряд').selectOption('дельфиник')
  await page.getByRole('button', { name: 'Открыть Синхронику' }).click()
  await expect(page.getByRole('heading', { name: 'Установи Синхронику' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Акви подсказывает, как установить приложение' })).toBeVisible()
  await page.getByRole('button', { name: 'Открыть Синхронику' }).click()

  await expect(page.getByRole('heading', { name: 'Привет, Алина' })).toBeVisible()
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('sinhronica:athlete-profile:v2'))).toBe(JSON.stringify({
    version: 2,
    profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' },
  }))
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('sinhronica:role-profile:v1'))).toBe(JSON.stringify({
    version: 2,
    role: 'athlete',
    profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' },
  }))

  await context.close()
})

test('collects a parent profile without creating athlete data', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()

  await page.goto('/starter-kit/')
  await page.getByRole('radio', { name: 'Родитель' }).click()
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await page.getByLabel('Как тебя зовут?').fill('Елена')
  await page.getByLabel('Как зовут ребёнка?').fill('Алина')
  await page.getByLabel('Город').fill('Казань')
  await page.getByRole('button', { name: 'Открыть Синхронику' }).click()
  await expect(page.getByRole('heading', { name: 'Установи Синхронику' })).toBeVisible()
  await page.getByRole('button', { name: 'Открыть Синхронику' }).click()

  await expect(page.getByRole('heading', { name: 'Привет, Елена' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Мобильная навигация' }).getByRole('link', { name: 'Бюджет' }).click()
  await expect(page.getByRole('heading', { name: 'Бюджет' })).toBeVisible()
  await page.getByRole('button', { name: 'Добавить', exact: true }).click()
  await page.getByLabel('Дата').fill('2026-11-18')
  await page.getByLabel('Сумма').fill('3500')
  await page.getByLabel('Комментарий').fill('Абонемент')
  await page.getByRole('button', { name: 'Сохранить расход' }).click()
  await expect(page.getByText('Абонемент')).toBeVisible()
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('sinhronica:parent-budget:v1'))).toContain('3500')
  await page.getByLabel('Изменить расход').click()
  await page.getByLabel('Комментарий').fill('Ноябрьский абонемент')
  await page.getByRole('button', { name: 'Сохранить расход' }).click()
  await expect(page.getByText('Ноябрьский абонемент')).toBeVisible()
  await page.getByLabel('Удалить расход').click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Удалить расход' }).click()
  await expect(page.getByText('Добавь первый расход')).toBeVisible()
  await page.getByRole('navigation', { name: 'Мобильная навигация' }).getByRole('link', { name: 'Главная' }).click()
  await page.getByRole('button', { name: 'Открыть настройки профиля' }).click()
  await expect(page.getByRole('heading', { name: 'Настройки' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('sinhronica:athlete-profile:v2'))).toBeNull()

  await context.close()
})
