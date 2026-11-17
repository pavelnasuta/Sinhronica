import { beforeEach, describe, expect, it } from 'vitest'

import type { TrainingEntry } from '../features/training-diary/training-diary-types'
import { parseUserDataImport, restoreUserData, serializeUserData } from './user-data'

describe('user data export', () => {
  beforeEach(() => localStorage.clear())
  it('serializes a versioned local backup without unrelated browser data', () => {
    const profile = { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' as const }
    const achievement = { id: 'combo-april', performedOn: '2026-04-10', eventName: 'Кубок Федерации', discipline: 'combo' as const, score: 9.25, medal: 'gold' as const, createdAt: '2026-04-10T10:00:00.000Z', updatedAt: '2026-04-10T10:00:00.000Z' }
    const figureProgress = [{ figureCode: '106', status: 'learning' as const, updatedAt: '2026-11-16T00:00:00.000Z' }]
    const routines = [{ id: 'azure', title: 'Лазурь', context: 'training' as const, discipline: 'group' as const, programType: 'free' as const, ageGroup: 'Девушки 13–15 лет', activeAthleteCount: 8, reserveAthleteCount: 0, athleteNames: [], blocks: [{ id: 'hybrid', type: 'element' as const, title: 'Гибрид', manualDifficulty: 3.2 }], createdAt: '2026-11-16T00:00:00.000Z', updatedAt: '2026-11-16T00:00:00.000Z' }]
    const trainingDiary: TrainingEntry[] = [{ id: 'practice', performedOn: '2026-11-16', types: ['water'], mood: 'good', createdAt: '2026-11-16T00:00:00.000Z', updatedAt: '2026-11-16T00:00:00.000Z' }]
    const payload = JSON.parse(serializeUserData({ profile, ideas: [], achievements: [achievement], figureProgress, routines, trainingDiary, theme: 'dark' }))

    expect(payload).toMatchObject({ version: 5, profile, ideas: [], achievements: [achievement], figureProgress, routines, trainingDiary, preferences: { theme: 'dark' } })
    expect(payload).toHaveProperty('exportedAt')
    expect(payload).not.toHaveProperty('other-product:key')
  })

  it('accepts a version 4 backup and restores its data shape without a diary', () => {
    const backup = JSON.stringify({ version: 4, exportedAt: '2026-11-16T12:00:00.000Z', profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }, ideas: [], achievements: [], figureProgress: [{ figureCode: '106', status: 'learning', updatedAt: '2026-11-16T00:00:00.000Z' }], routines: [], preferences: { theme: 'dark' } })
    expect(parseUserDataImport(backup)).toMatchObject({ version: 4, profile: { name: 'Алина' }, trainingDiary: [], preferences: { theme: 'dark' } })
  })

  it('replaces namespaced local data from a validated backup without touching unrelated storage', () => {
    const backup = parseUserDataImport(JSON.stringify({ version: 5, exportedAt: '2026-11-16T12:00:00.000Z', profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }, ideas: [], achievements: [], figureProgress: [], routines: [], trainingDiary: [{ id: 'practice', performedOn: '2026-11-16', types: ['water'], mood: 'good', createdAt: '2026-11-16T00:00:00.000Z', updatedAt: '2026-11-16T00:00:00.000Z' }], preferences: { theme: 'dark' } }))
    localStorage.setItem('sinhronica:training-diary:v1', 'old')
    localStorage.setItem('foreign', 'keep')

    expect(restoreUserData(backup)).toBe(true)
    expect(JSON.parse(localStorage.getItem('sinhronica:training-diary:v1') ?? '[]')).toEqual([expect.objectContaining({ id: 'practice' })])
    expect(localStorage.getItem('sinhronica:preferences:v1')).toBe('dark')
    expect(localStorage.getItem('foreign')).toBe('keep')
  })

  it('rolls back already written keys when browser storage rejects an import', () => {
    const backup = parseUserDataImport(JSON.stringify({ version: 5, exportedAt: '2026-11-16T12:00:00.000Z', profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }, ideas: [], achievements: [], figureProgress: [], routines: [], trainingDiary: [], preferences: { theme: 'dark' } }))
    const values = new Map<string, string>([['sinhronica:athlete-profile:v2', 'before']])
    let writes = 0
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { writes += 1; if (writes === 3) throw new Error('full'); values.set(key, value) }, removeItem: (key: string) => values.delete(key) }

    expect(restoreUserData(backup, storage)).toBe(false)
    expect(values.get('sinhronica:athlete-profile:v2')).toBe('before')
  })

  it('returns false when browser storage is inaccessible', () => {
    const backup = parseUserDataImport(JSON.stringify({ version: 5, exportedAt: '2026-11-16T12:00:00.000Z', profile: { name: 'Алина', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }, ideas: [], achievements: [], figureProgress: [], routines: [], trainingDiary: [], preferences: { theme: 'dark' } }))
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => { throw new Error('blocked') } })
    try { expect(restoreUserData(backup)).toBe(false) } finally {
      if (descriptor) Object.defineProperty(window, 'localStorage', descriptor)
      else delete (window as { localStorage?: Storage }).localStorage
    }
  })

  it('rejects a backup that contains invalid athlete data instead of replacing local data', () => {
    const backup = JSON.stringify({ version: 5, exportedAt: '2026-11-16T12:00:00.000Z', profile: { name: '', birthDate: '2014-11-16', city: 'Казань', sportRank: 'дельфиник' }, ideas: [], achievements: [], figureProgress: [], routines: [], trainingDiary: [], preferences: { theme: 'dark' } })
    expect(() => parseUserDataImport(backup)).toThrow('Неверный файл резервной копии')
  })
})
