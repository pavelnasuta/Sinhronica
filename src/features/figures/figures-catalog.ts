import { bpBmReferenceData, figureBpBmLinksData, figuresReferenceData } from '../../data/figures/reference-data'

export type FigureAgeGroup = 'under_13' | 'girls_13_15'

export type FigureRotation = {
  type: string
  degrees: number | null
  direction?: string
  componentsDegrees?: number[]
}

export type FigureCatalogEntry = {
  code: string
  name_ru: string
  name_en: string
  dd: number
  age_group: FigureAgeGroup
  figure_type: string
  section: string | null
  group: number | null
  description_ru: string
  execution_steps_ru: string[]
  key_positions_ru: string[]
  rotations: FigureRotation[]
  tempo_requirement_ru: string | null
  technical_description_type: string
  technique_source: {
    document: string
    url: string
    pdf_pages_1_based: number[]
    verified_official_text_2026: boolean
  }
}

export type FigureReference = {
  id: string
  code: string
  type: 'position' | 'movement'
  name_ru_display: string
  description_ru: string
  key_checks_ru?: string
  execution_steps_ru?: string[]
  from_position_refs?: string[]
  to_position_refs?: string[]
  wa_manual_page_1_based?: number
  review_status: string
}

export type FigureLink = {
  figure_code: string
  position_refs: string[]
  movement_refs_verified_from_full_figure_description: string[]
  movement_mapping_status: 'checked_against_figure_text' | 'not_mapped_needs_figure_by_figure_review'
  needs_review: boolean
  unmapped_position_terms_ru: string[]
}

type RawRecord = Record<string, unknown>

type RawReference = FigureReference & { variants?: RawReference[] }

function isRecord(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asStrings(value: unknown): string[] {
  return asArray(value).filter((item): item is string => typeof item === 'string')
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

function parseRotation(value: unknown): FigureRotation | null {
  if (!isRecord(value) || typeof value.type !== 'string' || (typeof value.degrees !== 'number' && value.degrees !== null)) return null

  return {
    type: value.type,
    degrees: value.degrees,
    direction: typeof value.direction === 'string' ? value.direction : undefined,
    componentsDegrees: asArray(value.components_degrees).filter((degree): degree is number => typeof degree === 'number'),
  }
}

function parseFigure(value: unknown): FigureCatalogEntry | null {
  if (!isRecord(value) || typeof value.code !== 'string' || typeof value.name_ru !== 'string' || typeof value.name_en !== 'string' || typeof value.dd !== 'number' || (value.age_group !== 'under_13' && value.age_group !== 'girls_13_15') || typeof value.figure_type !== 'string' || typeof value.description_ru !== 'string' || typeof value.technical_description_type !== 'string' || !isRecord(value.technique_source)) return null

  const source = value.technique_source
  if (typeof source.document !== 'string' || typeof source.url !== 'string' || typeof source.verified_official_text_2026 !== 'boolean') return null

  return {
    code: value.code,
    name_ru: value.name_ru,
    name_en: value.name_en,
    dd: value.dd,
    age_group: value.age_group,
    figure_type: value.figure_type,
    section: asNullableString(value.section),
    group: asNullableNumber(value.group),
    description_ru: value.description_ru,
    execution_steps_ru: asStrings(value.execution_steps_ru),
    key_positions_ru: asStrings(value.key_positions_ru),
    rotations: asArray(value.rotations).map(parseRotation).filter((rotation): rotation is FigureRotation => rotation !== null),
    tempo_requirement_ru: asNullableString(value.tempo_requirement_ru),
    technical_description_type: value.technical_description_type,
    technique_source: {
      document: source.document,
      url: source.url,
      pdf_pages_1_based: asArray(source.pdf_pages_1_based).filter((page): page is number => typeof page === 'number'),
      verified_official_text_2026: source.verified_official_text_2026,
    },
  }
}

function parseReference(value: unknown, type: FigureReference['type']): RawReference | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.code !== 'string' || typeof value.name_ru_display !== 'string' || typeof value.description_ru !== 'string' || typeof value.review_status !== 'string') return null

  return {
    id: value.id,
    code: value.code,
    type,
    name_ru_display: value.name_ru_display,
    description_ru: value.description_ru,
    key_checks_ru: typeof value.key_checks_ru === 'string' ? value.key_checks_ru : undefined,
    execution_steps_ru: asStrings(value.execution_steps_ru),
    from_position_refs: asStrings(value.from_position_refs),
    to_position_refs: asStrings(value.to_position_refs),
    wa_manual_page_1_based: typeof value.wa_manual_page_1_based === 'number' ? value.wa_manual_page_1_based : undefined,
    review_status: value.review_status,
    variants: asArray(value.variants).map((variant) => parseReference({ ...value, ...(isRecord(variant) ? variant : {}), variants: [] }, type)).filter((variant): variant is RawReference => variant !== null),
  }
}

function parseLink(value: unknown): FigureLink | null {
  if (!isRecord(value) || typeof value.figure_code !== 'string' || (value.movement_mapping_status !== 'checked_against_figure_text' && value.movement_mapping_status !== 'not_mapped_needs_figure_by_figure_review') || typeof value.needs_review !== 'boolean') return null

  return {
    figure_code: value.figure_code,
    position_refs: asStrings(value.position_refs),
    movement_refs_verified_from_full_figure_description: asStrings(value.movement_refs_verified_from_full_figure_description),
    movement_mapping_status: value.movement_mapping_status,
    needs_review: value.needs_review,
    unmapped_position_terms_ru: asStrings(value.unmapped_position_terms_ru),
  }
}

function payloadItems(payload: unknown, key: string): unknown[] {
  return isRecord(payload) ? asArray(payload[key]) : []
}

function flattenReferences(references: RawReference[]): FigureReference[] {
  return references.flatMap(({ variants, ...reference }) => [reference, ...flattenReferences(variants ?? [])])
}

const rawFigures = payloadItems(figuresReferenceData, 'figures')
const rawRotationCount = rawFigures.reduce<number>((count, figure) => count + (isRecord(figure) ? asArray(figure.rotations).length : 0), 0)
const rawNumberedGroupCount = rawFigures.filter((figure) => isRecord(figure) && typeof figure.group === 'number').length

export const figuresCatalog = rawFigures.map(parseFigure).filter((figure): figure is FigureCatalogEntry => figure !== null)
const positionReferences = payloadItems(bpBmReferenceData, 'positions').map((reference) => parseReference(reference, 'position')).filter((reference): reference is RawReference => reference !== null)
const movementReferences = payloadItems(bpBmReferenceData, 'movements').map((reference) => parseReference(reference, 'movement')).filter((reference): reference is RawReference => reference !== null)
export const figureReferences = flattenReferences([...positionReferences, ...movementReferences])
export const figureLinks = payloadItems(figureBpBmLinksData, 'figure_links').map(parseLink).filter((link): link is FigureLink => link !== null)

const figuresByCode = new Map(figuresCatalog.map((figure) => [figure.code, figure]))
const referencesById = new Map(figureReferences.map((reference) => [reference.id, reference]))
const linksByFigureCode = new Map(figureLinks.map((link) => [link.figure_code, link]))

export const figuresCatalogSourceStatus = 'Русские названия и описания сверены с опубликованным приложением РФ 2025; приложение РФ 2026 требует окончательной сверки.'

export function getFigureByCode(code: string): FigureCatalogEntry | undefined {
  return figuresByCode.get(code)
}

export function getFigureReferenceById(id: string): FigureReference | undefined {
  return referencesById.get(id)
}

export function getFigureReferences(figureCode: string) {
  const link = linksByFigureCode.get(figureCode)
  if (!link) return undefined

  return {
    positionIds: link.position_refs,
    movementIds: link.movement_refs_verified_from_full_figure_description,
    positions: link.position_refs.map(getFigureReferenceById).filter((reference): reference is FigureReference => reference !== undefined),
    movements: link.movement_refs_verified_from_full_figure_description.map(getFigureReferenceById).filter((reference): reference is FigureReference => reference !== undefined),
    movementMappingStatus: link.movement_mapping_status,
    needsReview: link.needs_review,
    unmappedPositionTermsRu: link.unmapped_position_terms_ru,
  }
}

export function validateFiguresReferenceData(): string[] {
  const errors: string[] = []
  const figureCodes = new Set<string>()
  const referenceIds = new Set<string>()

  if (figuresCatalog.length !== 20) errors.push('Ожидалось 20 фигур в каталоге.')
  if (figuresCatalog.reduce((count, figure) => count + figure.rotations.length, 0) !== rawRotationCount) errors.push('Вращения фигур были потеряны при разборе справочника.')
  if (figuresCatalog.filter((figure) => figure.group !== null).length !== rawNumberedGroupCount) errors.push('Группы фигур были потеряны при разборе справочника.')
  if (positionReferences.length !== 18) errors.push('Ожидалось 18 базовых позиций BP.')
  if (movementReferences.length !== 19) errors.push('Ожидалось 19 переходов BM, включая BM 1B.')
  if (figureReferences.some((reference) => reference.id === 'BP_12')) errors.push('BP 12 не должен появляться в справочнике.')

  for (const figure of figuresCatalog) {
    if (figureCodes.has(figure.code)) errors.push(`Повторный код фигуры: ${figure.code}.`)
    figureCodes.add(figure.code)
    if (figure.dd <= 0) errors.push(`Недопустимый DD фигуры ${figure.code}.`)
  }

  for (const reference of figureReferences) {
    if (referenceIds.has(reference.id)) errors.push(`Повторная ссылка BP/BM: ${reference.id}.`)
    referenceIds.add(reference.id)
  }

  for (const link of figureLinks) {
    if (!figureCodes.has(link.figure_code)) errors.push(`Связь с неизвестной фигурой: ${link.figure_code}.`)
    for (const referenceId of [...link.position_refs, ...link.movement_refs_verified_from_full_figure_description]) {
      if (!referenceIds.has(referenceId)) errors.push(`Связь ${link.figure_code} содержит неизвестный BP/BM: ${referenceId}.`)
    }
  }

  return errors
}
