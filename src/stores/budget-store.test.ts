import { beforeEach, describe, expect, it } from 'vitest'

import { BUDGET_STORAGE_KEY, useBudgetStore } from './budget-store'

describe('parent budget store', () => {
  beforeEach(() => {
    localStorage.clear()
    useBudgetStore.setState({ entries: [], storageStatus: 'ready' })
  })

  it('stores a dated parent expense for one child or both children', () => {
    const first = useBudgetStore.getState().create({ spentOn: '2026-11-18', amount: 3500, category: 'training', comment: 'Абонемент', childId: 'child-1' })
    const shared = useBudgetStore.getState().create({ spentOn: '2026-11-18', amount: 800, category: 'transport', comment: 'Такси', childId: 'both' })

    expect(first).toMatchObject({ spentOn: '2026-11-18', amount: 3500, category: 'training', comment: 'Абонемент', childId: 'child-1' })
    expect(shared).toMatchObject({ amount: 800, childId: 'both' })
    expect(JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY) ?? '[]')).toEqual([expect.objectContaining({ id: first?.id, amount: 3500, childId: 'child-1' }), expect.objectContaining({ id: shared?.id, childId: 'both' })])
  })

  it('rejects an expense with an invalid amount or date', () => {
    expect(useBudgetStore.getState().create({ spentOn: '2026-02-30', amount: 3500, category: 'training', comment: '', childId: 'child-1' })).toBeNull()
    expect(useBudgetStore.getState().create({ spentOn: '2026-11-18', amount: 0, category: 'training', comment: '', childId: 'child-1' })).toBeNull()
  })
})
