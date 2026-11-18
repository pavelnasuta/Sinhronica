import { Download, Pencil, Plus, Trash2, Upload, WalletCards } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { BUDGET_CATEGORIES, BUDGET_CATEGORY_LABELS, type BudgetDraft, type BudgetEntry, useBudgetStore } from '../../stores/budget-store'
import { useRoleProfileStore } from '../../stores/role-profile-store'
import { downloadParentBudgetBackup, parseParentBudgetBackup, restoreParentBudgetBackup, serializeParentBudgetBackup, type ParentBudgetBackup } from '../../lib/parent-budget-data'
import { formatLocalDate } from '../../stores/athlete-profile-store'

const emptyDraft = (): BudgetDraft => ({ spentOn: formatLocalDate(), amount: Number.NaN, category: 'training', comment: '' })
const money = (value: number) => value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })

export function BudgetPage() {
  const entries = useBudgetStore((state) => state.entries)
  const storageStatus = useBudgetStore((state) => state.storageStatus)
  const hydrate = useBudgetStore((state) => state.hydrate)
  const create = useBudgetStore((state) => state.create)
  const update = useBudgetStore((state) => state.update)
  const remove = useBudgetStore((state) => state.remove)
  const roleProfile = useRoleProfileStore((state) => state.profile)
  const [editing, setEditing] = useState<BudgetEntry | 'new' | null>(null)
  const [deleting, setDeleting] = useState<BudgetEntry | null>(null)
  const [importCandidate, setImportCandidate] = useState<ParentBudgetBackup | null>(null)
  const [backupMessage, setBackupMessage] = useState('')
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { hydrate() }, [hydrate])
  const ordered = useMemo(() => [...entries].sort((left, right) => right.spentOn.localeCompare(left.spentOn) || right.updatedAt.localeCompare(left.updatedAt)), [entries])
  const yearPrefix = formatLocalDate().slice(0, 4)
  const yearTotal = useMemo(() => entries.filter((entry) => entry.spentOn.startsWith(yearPrefix)).reduce((sum, entry) => sum + entry.amount, 0), [entries, yearPrefix])
  const monthPrefix = formatLocalDate().slice(0, 7)
  const monthTotal = useMemo(() => entries.filter((entry) => entry.spentOn.startsWith(monthPrefix)).reduce((sum, entry) => sum + entry.amount, 0), [entries, monthPrefix])
  const categories = useMemo(() => BUDGET_CATEGORIES.map((category) => ({ category, amount: entries.filter((entry) => entry.category === category).reduce((sum, entry) => sum + entry.amount, 0) })).filter((item) => item.amount > 0).sort((left, right) => right.amount - left.amount), [entries])
  const storageNotice = storageStatus === 'unsaved' ? 'Изменения сохранены только в памяти: хранилище браузера недоступно.' : storageStatus === 'recovered' ? 'Повреждённые локальные записи были пропущены. Новые расходы можно сохранить.' : null
  const save = (draft: BudgetDraft) => {
    if (editing === 'new') create(draft)
    else if (editing) update(editing.id, draft)
    setEditing(null)
  }
  const exportBackup = () => {
    if (!roleProfile || roleProfile.role !== 'parent') return
    downloadParentBudgetBackup(serializeParentBudgetBackup(roleProfile.profile, entries))
    setBackupMessage('Резервная копия бюджета скачана.')
  }
  const selectBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try { setImportCandidate(parseParentBudgetBackup(await file.text())); setBackupMessage('') } catch { setBackupMessage('Не удалось прочитать резервную копию бюджета. Проверь файл и попробуй ещё раз.') }
  }
  const confirmImport = () => {
    if (!importCandidate) return
    if (!restoreParentBudgetBackup(importCandidate)) { setBackupMessage('Не удалось сохранить данные из копии в этом браузере.'); setImportCandidate(null); return }
    window.location.reload()
  }

  return <section className="mx-auto grid max-w-3xl gap-5" aria-labelledby="budget-title">
    <header className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Родитель</p><h1 id="budget-title" className="mt-1 text-3xl font-extrabold tracking-[-0.04em]">Бюджет</h1><p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">Расходы на синхронное плавание ребёнка — только на этом устройстве.</p></div><Button type="button" onClick={() => setEditing('new')}><Plus aria-hidden="true" />Добавить</Button></header>
    {storageNotice ? <p role="status" className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground">{storageNotice}</p> : null}
    <div className="grid grid-cols-2 gap-3"><Summary label="За этот месяц" value={money(monthTotal)} /><Summary label="За этот год" value={money(yearTotal)} /></div>
    {categories.length ? <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]" aria-labelledby="budget-categories-title"><h2 id="budget-categories-title" className="text-lg font-extrabold">По категориям</h2><div className="mt-4 grid gap-3">{categories.map(({ category, amount }) => <div key={category} className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{BUDGET_CATEGORY_LABELS[category]}</span><span className="shrink-0 text-muted-foreground">{money(amount)}</span></div>)}</div></section> : null}
    {ordered.length ? <section className="grid gap-3" aria-label="Расходы">{ordered.map((entry) => <article key={entry.id} className="rounded-[var(--radius-xl)] border bg-card p-4 shadow-[var(--shadow-card)]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-extrabold">{BUDGET_CATEGORY_LABELS[entry.category]}</p><p className="mt-1 text-sm text-muted-foreground">{new Date(`${entry.spentOn}T12:00:00`).toLocaleDateString('ru-RU')}</p>{entry.comment ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.comment}</p> : null}</div><div className="grid justify-items-end gap-2"><strong>{money(entry.amount)}</strong><div className="flex gap-1"><Button type="button" variant="ghost" size="icon" aria-label="Изменить расход" onClick={() => setEditing(entry)}><Pencil className="h-4 w-4" aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon" aria-label="Удалить расход" onClick={() => setDeleting(entry)}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button></div></div></div></article>)}</section> : <section className="rounded-[var(--radius-xl)] border bg-card p-6 text-center shadow-[var(--shadow-card)]"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><WalletCards className="h-6 w-6" aria-hidden="true" /></span><h2 className="mt-4 text-xl font-extrabold">Добавь первый расход</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Например, занятия, сборы, экипировку или дорогу на старт.</p><Button type="button" className="mt-5" onClick={() => setEditing('new')}><Plus aria-hidden="true" />Добавить расход</Button></section>}
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-lg font-extrabold">Резервная копия</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Сохрани расходы и профиль родителя в файл, чтобы перенести их на другое устройство.</p><Button type="button" variant="outline" className="mt-4 w-full" onClick={exportBackup}><Download aria-hidden="true" />Скачать копию бюджета</Button><input ref={importInputRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Выбрать копию бюджета" onChange={(event) => void selectBackup(event)} /><Button type="button" variant="outline" className="mt-3 w-full" onClick={() => importInputRef.current?.click()}><Upload aria-hidden="true" />Загрузить копию бюджета</Button>{backupMessage ? <p role="status" className="mt-3 text-sm text-muted-foreground">{backupMessage}</p> : null}</section>
    <BudgetDialog editing={editing} onOpenChange={(open) => !open && setEditing(null)} onSave={save} />
    <AlertDialog open={Boolean(importCandidate)} onOpenChange={(open) => { if (!open) setImportCandidate(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Заменить бюджет из копии?</AlertDialogTitle><AlertDialogDescription>Текущие расходы и профиль родителя на этом устройстве будут заменены. Найдено расходов: {importCandidate?.entries.length ?? 0}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={confirmImport}>Заменить бюджет</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить расход?</AlertDialogTitle><AlertDialogDescription>Эта запись будет удалена только с этого устройства.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleting) remove(deleting.id); setDeleting(null) }}>Удалить расход</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[var(--radius-lg)] border bg-card p-4 shadow-[var(--shadow-card)]"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-2 truncate text-xl font-extrabold tracking-[-0.03em]">{value}</p></div>
}

function BudgetDialog({ editing, onOpenChange, onSave }: { editing: BudgetEntry | 'new' | null; onOpenChange: (open: boolean) => void; onSave: (draft: BudgetDraft) => void }) {
  const initial = editing === 'new' ? emptyDraft() : editing ? { spentOn: editing.spentOn, amount: editing.amount, category: editing.category, comment: editing.comment } : null
  const formKey = editing && editing !== 'new' ? editing.id : 'new'
  return <Dialog open={editing !== null} onOpenChange={onOpenChange}><DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>{editing === 'new' ? 'Новый расход' : 'Изменить расход'}</DialogTitle><DialogDescription>Запись сохранится только на этом устройстве.</DialogDescription></DialogHeader>{initial ? <BudgetForm key={formKey} initial={initial} onSave={onSave} /> : null}</DialogContent></Dialog>
}

function BudgetForm({ initial, onSave }: { initial: BudgetDraft; onSave: (draft: BudgetDraft) => void }) {
  const [draft, setDraft] = useState<BudgetDraft>(initial)
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => { event.preventDefault(); if (!Number.isFinite(draft.amount) || draft.amount <= 0) { setError('Введи сумму больше нуля.'); return } onSave(draft) }
  return <form className="grid gap-4" onSubmit={submit}><div className="grid gap-2"><Label htmlFor="budget-date">Дата</Label><Input id="budget-date" type="date" max={formatLocalDate()} value={draft.spentOn} onChange={(event) => setDraft((value) => ({ ...value, spentOn: event.target.value }))} /></div><div className="grid gap-2"><Label htmlFor="budget-amount">Сумма</Label><Input id="budget-amount" type="number" inputMode="decimal" min="0.01" step="0.01" value={Number.isFinite(draft.amount) ? String(draft.amount) : ''} onChange={(event) => setDraft((value) => ({ ...value, amount: Number(event.target.value) }))} /></div><div className="grid gap-2"><Label htmlFor="budget-category">Категория</Label><select id="budget-category" className="h-11 rounded-md border bg-background px-3" value={draft.category} onChange={(event) => setDraft((value) => ({ ...value, category: event.target.value as BudgetDraft['category'] }))}>{BUDGET_CATEGORIES.map((category) => <option key={category} value={category}>{BUDGET_CATEGORY_LABELS[category]}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="budget-comment">Комментарий</Label><textarea id="budget-comment" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" maxLength={500} value={draft.comment} onChange={(event) => setDraft((value) => ({ ...value, comment: event.target.value }))} /></div>{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}<Button type="submit">Сохранить расход</Button></form>
}
