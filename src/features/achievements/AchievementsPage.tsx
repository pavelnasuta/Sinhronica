import { Plus, Search, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useAchievementsStore } from '../../stores/achievements-store'
import { AchievementCard } from './AchievementCard'
import { AchievementForm } from './AchievementForm'
import { DISCIPLINES, DISCIPLINE_LABELS, type Achievement, type AchievementDiscipline, type AchievementDraft } from './achievement-types'
import { getScoreChange, sortAchievements } from './achievement-utils'

const allDisciplines = 'all' as const

export function AchievementsPage() {
  const achievements = useAchievementsStore((state) => state.achievements)
  const create = useAchievementsStore((state) => state.create)
  const update = useAchievementsStore((state) => state.update)
  const remove = useAchievementsStore((state) => state.remove)
  const hydrate = useAchievementsStore((state) => state.hydrate)
  const [query, setQuery] = useState('')
  const [discipline, setDiscipline] = useState<typeof allDisciplines | AchievementDiscipline>(allDisciplines)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Achievement>()
  const [deleting, setDeleting] = useState<Achievement>()

  useEffect(() => { hydrate() }, [hydrate])

  const filtered = useMemo(() => sortAchievements(achievements.filter((achievement) => {
    const matchesDiscipline = discipline === allDisciplines || achievement.discipline === discipline
    const needle = query.trim().toLocaleLowerCase()
    const matchesQuery = !needle || [achievement.eventName, achievement.customDiscipline ?? '', DISCIPLINE_LABELS[achievement.discipline]].join(' ').toLocaleLowerCase().includes(needle)
    return matchesDiscipline && matchesQuery
  })), [achievements, discipline, query])

  const medalCount = filtered.filter((achievement) => achievement.medal !== 'none').length
  const bestScore = filtered.length ? Math.max(...filtered.map((achievement) => achievement.score)) : null
  const closeForm = () => { setFormOpen(false); setEditing(undefined) }
  const save = (draft: AchievementDraft) => {
    if (editing) update(editing.id, draft)
    else create(draft)
    closeForm()
  }

  if (achievements.length === 0) return <section className="mx-auto grid max-w-md justify-items-center gap-5 py-6 text-center" aria-labelledby="achievements-title"><div className="h-64 w-full"><img src={`${import.meta.env.BASE_URL}onboarding/progress.webp`} alt="" className="h-full w-full object-contain" /></div><div className="space-y-2"><h1 id="achievements-title" className="text-3xl font-extrabold tracking-[-.04em]">Здесь будут твои победы</h1><p className="text-base leading-7 text-muted-foreground">Сохраняй результаты соревнований и нормативов — они останутся на этом устройстве.</p></div><Button type="button" onClick={() => setFormOpen(true)}><Plus aria-hidden="true" />Добавить достижение</Button><AchievementDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSubmit={save} onCancel={closeForm} /></section>

  return <section className="space-y-5" aria-labelledby="achievements-title"><header className="flex items-center gap-3 rounded-[var(--radius-xl)] border bg-card p-4 shadow-[var(--shadow-card)]"><div className="h-20 w-20 shrink-0"><img src={`${import.meta.env.BASE_URL}onboarding/progress.webp`} alt="" className="h-full w-full object-contain" /></div><div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[.09em] text-[color:var(--eyebrow)]">Моя траектория</p><h1 id="achievements-title" className="mt-1 text-2xl font-extrabold tracking-[-.04em]">Твои достижения</h1><p className="mt-1 text-sm text-muted-foreground">Каждый результат — шаг к новой цели.</p></div></header><div className="grid grid-cols-3 gap-2"><Summary label="Результаты" value={filtered.length} /><Summary label="Медали" value={medalCount} /><Summary label="Лучший балл" value={bestScore?.toLocaleString('ru-RU') ?? '—'} /></div><div className="grid gap-3 rounded-[var(--radius-lg)] border bg-card p-4"><div className="grid gap-2"><Label htmlFor="achievement-search">Поиск достижений</Label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="achievement-search" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Соревнование или дисциплина" /></div></div><div className="grid gap-2"><Label htmlFor="achievement-filter">Дисциплина</Label><select id="achievement-filter" className="h-11 rounded-md border bg-background px-3" value={discipline} onChange={(event) => setDiscipline(event.target.value as typeof allDisciplines | AchievementDiscipline)}><option value="all">Все дисциплины</option>{DISCIPLINES.map((item) => <option key={item} value={item}>{DISCIPLINE_LABELS[item]}</option>)}</select></div></div><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold">Хронология</h2><Button type="button" size="sm" onClick={() => { setEditing(undefined); setFormOpen(true) }}><Trophy aria-hidden="true" />Добавить</Button></div>{filtered.length ? <div className="grid gap-3">{filtered.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} comparison={getScoreChange(achievement, achievements)} onEdit={(item) => { setEditing(item); setFormOpen(true) }} onDelete={setDeleting} />)}</div> : <p className="rounded-[var(--radius-lg)] border border-dashed p-5 text-center text-sm text-muted-foreground">Подходящих достижений нет.</p>}<AchievementDialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); else setFormOpen(true) }} editing={editing} onSubmit={save} onCancel={closeForm} /><AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(undefined) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить достижение?</AlertDialogTitle><AlertDialogDescription>Результат «{deleting?.eventName}» будет удалён только с этого устройства.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleting) remove(deleting.id); setDeleting(undefined) }}>Удалить достижение</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-[var(--radius-md)] border bg-card p-3"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-1 text-xl font-extrabold tracking-[-.03em]">{value}</p></div>
}

type AchievementDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; editing?: Achievement; onSubmit: (draft: AchievementDraft) => void; onCancel: () => void }
function AchievementDialog({ open, onOpenChange, editing, onSubmit, onCancel }: AchievementDialogProps) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Изменить достижение' : 'Новое достижение'}</DialogTitle><DialogDescription>Результат сохранится только на этом устройстве.</DialogDescription></DialogHeader><AchievementForm key={editing?.id ?? 'new'} initialValue={editing} onSubmit={onSubmit} onCancel={onCancel} /></DialogContent></Dialog>
}
