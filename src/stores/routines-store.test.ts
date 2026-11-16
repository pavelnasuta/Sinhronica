import { beforeEach, describe, expect, it } from 'vitest'

import { ROUTINES_STORAGE_KEY, useRoutinesStore } from './routines-store'

const draft = { title: 'Лазурь', context: 'training' as const, discipline: 'group' as const, programType: 'free' as const, ageGroup: 'Девушки 13–15 лет', activeAthleteCount: 8, reserveAthleteCount: 2, athleteNames: [], blocks: [] }

beforeEach(() => { localStorage.clear(); useRoutinesStore.setState({ routines: [], storageStatus: 'ready' }) })

describe('routines store', () => {
  it('persists local cards and safely hydrates them', () => {
    const routine = useRoutinesStore.getState().create(draft)
    expect(routine).toMatchObject({ title: 'Лазурь' })
    expect(JSON.parse(localStorage.getItem(ROUTINES_STORAGE_KEY) ?? '[]')).toHaveLength(1)
    useRoutinesStore.setState({ routines: [] })
    useRoutinesStore.getState().hydrate()
    expect(useRoutinesStore.getState().routines).toEqual([expect.objectContaining({ id: routine?.id, title: 'Лазурь' })])
  })

  it('updates block order and clears only the routine key', () => {
    const routine = useRoutinesStore.getState().create({ ...draft, blocks: [{ id: 'one', type: 'element', title: 'A' }, { id: 'two', type: 'transition', title: 'B' }] })!
    localStorage.setItem('foreign', 'keep')
    useRoutinesStore.getState().update(routine.id, { ...draft, blocks: [routine.blocks[1], routine.blocks[0]] })
    expect(useRoutinesStore.getState().routines[0].blocks.map((block) => block.id)).toEqual(['two', 'one'])
    useRoutinesStore.getState().clear()
    expect(localStorage.getItem(ROUTINES_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem('foreign')).toBe('keep')
  })
})
