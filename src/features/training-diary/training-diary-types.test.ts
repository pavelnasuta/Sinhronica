import { expect, it } from 'vitest'

import { getMoodLabel, normalizeTrainingEntryDraft } from './training-diary-types'

it('normalizes a local training entry with several practice types and an optional feeling', () => {
  expect(normalizeTrainingEntryDraft({ performedOn: '2026-11-16', types: ['water', 'acrobatics'], durationMinutes: '90', note: 'Поработали над поддержками', mood: 'good' }, new Date(2026, 10, 16))).toEqual({ performedOn: '2026-11-16', types: ['water', 'acrobatics'], durationMinutes: 90, note: 'Поработали над поддержками', mood: 'good' })
})

it('rejects a training entry without a type or with a future date', () => {
  expect(normalizeTrainingEntryDraft({ performedOn: '2026-11-16', types: [], durationMinutes: '', note: '' }, new Date(2026, 10, 16))).toBeNull()
  expect(normalizeTrainingEntryDraft({ performedOn: '2026-11-17', types: ['water'], durationMinutes: '', note: '' }, new Date(2026, 10, 16))).toBeNull()
})

it('uses calm labels for optional post-training feeling', () => {
  expect(getMoodLabel('heavy')).toBe('Тяжело')
  expect(getMoodLabel('energized')).toBe('На подъёме')
})
