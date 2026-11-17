import { beforeEach, expect, it } from 'vitest'

import type { TrainingEntryDraft } from '../features/training-diary/training-diary-types'
import { TRAINING_DIARY_STORAGE_KEY, useTrainingDiaryStore } from './training-diary-store'

const draft: TrainingEntryDraft = { performedOn: '2026-11-16', types: ['water', 'acrobatics'], durationMinutes: 90, note: 'Поддержки стали увереннее', mood: 'good' }

beforeEach(() => { localStorage.clear(); useTrainingDiaryStore.setState({ entries: [], storageStatus: 'ready' }) })

it('stores, updates and safely hydrates training entries locally', () => {
  const created = useTrainingDiaryStore.getState().create(draft)
  expect(created).toMatchObject({ performedOn: '2026-11-16', types: ['water', 'acrobatics'], mood: 'good' })
  expect(JSON.parse(localStorage.getItem(TRAINING_DIARY_STORAGE_KEY) ?? '[]')).toHaveLength(1)
  useTrainingDiaryStore.getState().update(created!.id, { ...draft, note: 'Завершили уверенно' })
  useTrainingDiaryStore.setState({ entries: [] })
  useTrainingDiaryStore.getState().hydrate()
  expect(useTrainingDiaryStore.getState().entries).toEqual([expect.objectContaining({ id: created!.id, note: 'Завершили уверенно' })])
})

it('clears diary data without deleting unrelated local data', () => {
  useTrainingDiaryStore.getState().create(draft)
  localStorage.setItem('foreign', 'keep')
  useTrainingDiaryStore.getState().clear()
  expect(localStorage.getItem(TRAINING_DIARY_STORAGE_KEY)).toBeNull()
  expect(localStorage.getItem('foreign')).toBe('keep')
})
