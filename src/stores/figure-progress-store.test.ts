import { beforeEach, describe, expect, it } from 'vitest'

import { FIGURE_PROGRESS_STORAGE_KEY, useFigureProgressStore } from './figure-progress-store'

describe('figure progress store', () => {
  beforeEach(() => {
    localStorage.clear()
    useFigureProgressStore.getState().clear()
  })

  it('stores a local study status by a stable catalog figure code', () => {
    const record = useFigureProgressStore.getState().setStatus('106', 'learning')

    expect(record).toMatchObject({ figureCode: '106', status: 'learning' })
    expect(JSON.parse(localStorage.getItem(FIGURE_PROGRESS_STORAGE_KEY) ?? '[]')).toEqual([
      expect.objectContaining({ figureCode: '106', status: 'learning' }),
    ])
  })

  it('updates rather than duplicates the status of one figure', () => {
    useFigureProgressStore.getState().setStatus('106', 'learning')
    useFigureProgressStore.getState().setStatus('106', 'mastered')

    expect(useFigureProgressStore.getState().progress).toEqual([
      expect.objectContaining({ figureCode: '106', status: 'mastered' }),
    ])
  })

  it('does not persist a status for a figure outside the supplied catalog', () => {
    expect(useFigureProgressStore.getState().setStatus('unknown', 'learning')).toBeNull()
    expect(useFigureProgressStore.getState().progress).toEqual([])
  })
})
