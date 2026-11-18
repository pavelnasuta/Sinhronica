import { describe, expect, it } from 'vitest'

import { parseParentBudgetBackup, restoreParentBudgetBackup, serializeParentBudgetBackup } from './parent-budget-data'

const profile = { name: 'Елена', childName: 'Алина', childBirthDate: '2015-03-18', city: 'Москва' }
const entries = [{ id: 'training-1', spentOn: '2026-11-18', amount: 3500, category: 'training' as const, comment: 'Абонемент', createdAt: '2026-11-18T10:00:00.000Z', updatedAt: '2026-11-18T10:00:00.000Z' }]

describe('parent budget backup', () => {
  it('serializes and parses a validated parent profile with local expenses', () => {
    const backup = parseParentBudgetBackup(serializeParentBudgetBackup(profile, entries))
    expect(backup).toMatchObject({ version: 1, profile, entries })
  })

  it('rejects malformed profile and invalid budget records', () => {
    const malformedProfile = JSON.stringify({ version: 1, exportedAt: '2026-11-18T10:00:00.000Z', profile: { ...profile, childName: '' }, entries })
    const invalidAmount = JSON.stringify({ version: 1, exportedAt: '2026-11-18T10:00:00.000Z', profile, entries: [{ ...entries[0], amount: 0 }] })
    expect(() => parseParentBudgetBackup(malformedProfile)).toThrow('Неверный файл резервной копии бюджета')
    expect(() => parseParentBudgetBackup(invalidAmount)).toThrow('Неверный файл резервной копии бюджета')
  })

  it('replaces only parent profile and budget keys', () => {
    const values = new Map<string, string>([['foreign', 'keep'], ['sinhronica:parent-budget:v1', 'old']])
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) }
    const backup = parseParentBudgetBackup(serializeParentBudgetBackup(profile, entries))
    expect(restoreParentBudgetBackup(backup, storage)).toBe(true)
    expect(JSON.parse(values.get('sinhronica:role-profile:v1') ?? 'null')).toEqual(expect.objectContaining({ role: 'parent', profile }))
    expect(JSON.parse(values.get('sinhronica:parent-budget:v1') ?? '[]')).toEqual(entries)
    expect(values.get('foreign')).toBe('keep')
  })
})
