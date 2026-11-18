import { beforeEach, describe, expect, it } from 'vitest'

import { BUDGET_STORAGE_KEY, useBudgetStore } from './budget-store'

describe('parent budget store', () => {
  beforeEach(() => {
    localStorage.clear()
    useBudgetStore.setState({ entries: [], storageStatus: 'ready' })
  })

  it('stores a dated parent expense locally', () => {
    const entry = useBudgetStore.getState().create({ spentOn: '2026-11-18', amount: 3500, category: 'training', comment: 'Абонемент' })

    expect(entry).toMatchObject({ spentOn: '2026-11-18', amount: 3500, category: 'training', comment: 'Абонемент' })
    expect(JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY) ?? '[]')).toEqual([expect.objectContaining({ id: entry?.id, amount: 3500 })])
  })

  it('rejects an expense with an invalid amount or date', () => {
    expect(useBudgetStore.getState().create({ spentOn: '2026-02-30', amount: 3500, category: 'training', comment: '' })).toBeNull()
    expect(useBudgetStore.getState().create({ spentOn: '2026-11-18', amount: 0, category: 'training', comment: '' })).toBeNull()
  })
})
