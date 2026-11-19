import { describe, expect, it } from 'vitest'

import { parseParentBudgetBackup, restoreParentBudgetBackup, serializeParentBudgetBackup } from './parent-budget-data'

const profile = { name: 'Елена', city: 'Москва', children: [{ id: 'child-1' as const, name: 'Алина', sportRank: 'КМС' as const }] }
const entries = [{ id: 'training-1', spentOn: '2026-11-18', amount: 3500, category: 'training' as const, comment: 'Абонемент', childId: 'child-1' as const, createdAt: '2026-11-18T10:00:00.000Z', updatedAt: '2026-11-18T10:00:00.000Z' }]

describe('parent budget backup', () => {
  it('serializes and parses the current parent profile and child-aware expenses', () => {
    expect(parseParentBudgetBackup(serializeParentBudgetBackup(profile, entries))).toMatchObject({ version: 1, profile, entries })
  })
  it('migrates a legacy parent backup and child-less expense to child one', () => {
    const legacy = JSON.stringify({ version: 1, exportedAt: '2026-11-18T10:00:00.000Z', profile: { name: 'Елена', childName: 'Алина', childBirthDate: '2015-03-18', city: 'Москва' }, entries: [{ ...entries[0], childId: undefined }] })
    expect(parseParentBudgetBackup(legacy)).toMatchObject({ profile: { ...profile, children: [{ id: 'child-1', name: 'Алина', sportRank: 'Не указан' }] }, entries: [expect.objectContaining({ childId: 'child-1' })] })
  })
  it('rejects malformed profile and invalid budget records', () => {
    expect(() => parseParentBudgetBackup(JSON.stringify({ version: 1, exportedAt: '2026-11-18T10:00:00.000Z', profile: { ...profile, children: [] }, entries }))).toThrow('Неверный файл резервной копии бюджета')
    expect(() => parseParentBudgetBackup(JSON.stringify({ version: 1, exportedAt: '2026-11-18T10:00:00.000Z', profile, entries: [{ ...entries[0], amount: 0 }] }))).toThrow('Неверный файл резервной копии бюджета')
  })
  it('replaces only parent profile and budget keys using profile storage v2', () => {
    const values = new Map<string, string>([['foreign', 'keep'], ['sinhronica:parent-budget:v1', 'old']]); const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) }
    expect(restoreParentBudgetBackup(parseParentBudgetBackup(serializeParentBudgetBackup(profile, entries)), storage)).toBe(true)
    expect(JSON.parse(values.get('sinhronica:role-profile:v1') ?? 'null')).toEqual(expect.objectContaining({ version: 2, role: 'parent', profile }))
    expect(JSON.parse(values.get('sinhronica:parent-budget:v1') ?? '[]')).toEqual(entries); expect(values.get('foreign')).toBe('keep')
  })
})
