import { beforeEach, expect, it } from 'vitest'

import { usePreferencesStore } from './preferences-store'

const STORAGE_KEY = 'sinhronica:preferences:v1'

beforeEach(() => {
  window.localStorage.clear()
  usePreferencesStore.getState().setTheme('dark')
  window.localStorage.clear()
})

it('defaults to dark even when the device preference is different', () => {
  expect(usePreferencesStore.getState().theme).toBe('dark')
  expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
})
