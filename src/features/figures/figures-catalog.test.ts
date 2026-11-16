import { describe, expect, it } from 'vitest'

import { figuresCatalog, getFigureByCode, getFigureReferences, validateFiguresReferenceData } from './figures-catalog'

describe('figures catalog', () => {
  it('keeps all 20 supplied figures with usable DD values', () => {
    expect(figuresCatalog).toHaveLength(20)
    expect(figuresCatalog.every((figure) => figure.dd > 0)).toBe(true)
    expect(figuresCatalog.map((figure) => figure.code)).toContain('106')
    expect(figuresCatalog.map((figure) => figure.code)).toContain('307e')
  })

  it('resolves a figure and its verified BP/BM references without inventing phases', () => {
    expect(getFigureByCode('106')).toMatchObject({ name_ru: 'Прямая балетная нога', dd: 1.6 })
    expect(getFigureByCode('363')).toMatchObject({
      group: 2,
      rotations: [
        { type: 'твист', degrees: 180 },
        { type: 'спин', degrees: 180, direction: 'то же направление' },
      ],
    })
    expect(getFigureByCode('unknown')).toBeUndefined()

    expect(getFigureReferences('106')).toMatchObject({
      movementMappingStatus: 'checked_against_figure_text',
      positionIds: ['BP_01', 'BP_03A', 'BP_14B'],
      movementIds: ['BM_01B', 'BM_02'],
    })
    expect(getFigureReferences('359')?.movementMappingStatus).toBe('not_mapped_needs_figure_by_figure_review')
  })

  it('validates the imported source package before it can drive catalog or calculator data', () => {
    expect(validateFiguresReferenceData()).toEqual([])
  })
})
