import { ChevronDown, Plus, Search, SlidersHorizontal, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { type ParentChild } from '../../stores/role-profile-store'
import { useAchievementsStore } from '../../stores/achievements-store'
import { AchievementCard } from './AchievementCard'
import { AchievementForm } from './AchievementForm'
import { DISCIPLINES, DISCIPLINE_LABELS, type Achievement, type AchievementDiscipline, type AchievementDraft } from './achievement-types'
import { getScoreChange, sortAchievements } from './achievement-utils'

const allDisciplines = 'all' as const
type AchievementsPageProps = { parentChildren?: ParentChild[] }

export function AchievementsPage({ parentChildren }: AchievementsPageProps) {
  const isParent = Boolean(parentChildren?.length)
  const [child, setChild] = useState<'all' | 'child-1' | 'child-2'>('all')
  const achievements = useAchievementsStore((state) => state.achievements)
  const storageStatus = useAchievementsStore((state) => state.storageStatus)
  const create = useAchievementsStore((state) => state.create)
  const update = useAchievementsStore((state) => state.update)
  const remove = useAchievementsStore((state) => state.remove)
  const hydrate = useAchievementsStore((state) => state.hydrate)
  const [query, setQuery] = useState('')
  const [discipline, setDiscipline] = useState<typeof allDisciplines | AchievementDiscipline>(allDisciplines)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Achievement>()
  const [deleting, setDeleting] = useState<Achievement>()

  useEffect(() => { hydrate() }, [hydrate])
  const filtered = useMemo(() => sortAchievements(achievements.filter((achievement) => {
    const matchesDiscipline = discipline === allDisciplines || achievement.discipline === discipline
    const matchesChild = !isParent || child === 'all' || (achievement.childId ?? 'child-1') === child
    const needle = query.trim().toLocaleLowerCase()
    const matchesQuery = !needle || [achievement.eventName, achievement.customDiscipline ?? '', DISCIPLINE_LABELS[achievement.discipline]].join(' ').toLocaleLowerCase().includes(needle)
    return matchesDiscipline && matchesChild && matchesQuery
  })), [achievements, child, discipline, isParent, query])
  const medalCount = filtered.filter((achievement) => achievement.medal !== 'none').length
  const bestScore = filtered.length ? Math.max(...filtered.map((achievement) => achievement.score)) : null
  const activeFilterCount = Number(Boolean(query.trim())) + Number(child !== 'all') + Number(discipline !== allDisciplines)
  const closeForm = () => { setFormOpen(false); setEditing(undefined) }
  const storageNotice = storageStatus === 'unsaved' ? 'Изменения сохранены только в памяти: хранилище браузера недоступно.' : storageStatus === 'recovered' ? 'Повреждённые локальные данные были пропущены. Новые результаты можно сохранить.' : null
  const save = (draft: AchievementDraft) => { if (editing) update(editing.id, draft); else create(draft); closeForm() }
  const title = isParent ? 'Достижения' : 'Твои достижения'
  const intro = isParent ? 'Сохраняйте результаты после стартов, чтобы легко видеть прогресс каждого ребёнка.' : 'Каждый результат — шаг к новой цели.'

  if (achievements.length === 0) return <section className="mx-auto grid max-w-md justify-items-center gap-5 py-6 text-center" aria-labelledby="achievements-title"><div className="h-64 w-full"><img src={`${import.meta.env.BASE_URL}onboarding/progress.webp`} alt="" className="h-full w-full object-contain" /></div><div className="space-y-2"><h1 id="achievements-title" className="text-3xl font-extrabold tracking-[-.04em]">{isParent ? 'Достижения' : 'Здесь будут твои победы'}</h1><p className="text-base leading-7 text-muted-foreground">{isParent ? 'Добавляйте результаты соревнований и нормативов после старта — так прогресс каждого ребёнка всегда под рукой.' : 'Сохраняй результаты соревнований и нормативов — они останутся на этом устройстве.'}</p></div>{storageNotice ? <p role="status" aria-label="Состояние хранения" className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground">{storageNotice}</p> : null}<Button type="button" onClick={() => setFormOpen(true)}><Plus aria-hidden="true" />Добавить достижение</Button><AchievementDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSubmit={save} onCancel={closeForm} parentChildren={parentChildren} /></section>

  return <section className="space-y-5" aria-labelledby="achievements-title"><header className="flex items-center gap-3 rounded-[var(--radius-xl)] border bg-card p-4 shadow-[var(--shadow-card)]"><div className="h-20 w-20 shrink-0"><img src={`${import.meta.env.BASE_URL}onboarding/progress.webp`} alt="" className="h-full w-full object-contain" /></div><div className="min-w-0">{isParent ? null : <p className="text-xs font-extrabold uppercase tracking-[.09em] text-[color:var(--eyebrow)]">Моя траектория</p>}<h1 id="achievements-title" className="mt-1 text-2xl font-extrabold tracking-[-.04em]">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{intro}</p></div></header>{storageNotice ? <p role="status" aria-label="Состояние хранения" className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground">{storageNotice}</p> : null}<div className="grid grid-cols-3 gap-2"><Summary label="Результаты" value={filtered.length} /><Summary label="Медали" value={medalCount} /><Summary label="Лучший балл" value={bestScore?.toLocaleString('ru-RU') ?? '—'} /></div><section className="rounded-[var(--radius-xl)] border bg-card shadow-[var(--shadow-card)]" aria-label="Фильтры достижений"><button type="button" className="flex min-h-11 w-full items-center justify-between gap-3 p-4 text-left" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><span className="inline-flex items-center gap-2 font-extrabold"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" />Фильтры достижений{activeFilterCount ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{activeFilterCount}</span> : null}</span><ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} aria-hidden="true" /></button>{filtersOpen ? <div className="grid gap-3 border-t p-4 pt-3 sm:grid-cols-2"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="achievement-search">Поиск достижений</Label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="achievement-search" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Соревнование или дисциплина" /></div></div>{isParent ? <div className="grid gap-2"><Label htmlFor="achievement-child-filter">Ребёнок</Label><select id="achievement-child-filter" className="h-11 min-w-0 w-full rounded-md border bg-background px-3" value={child} onChange={(event) => setChild(event.target.value as typeof child)}><option value="all">Все дети</option>{parentChildren?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div> : null}<div className="grid gap-2"><Label htmlFor="achievement-filter">Дисциплина</Label><select id="achievement-filter" className="h-11 min-w-0 w-full rounded-md border bg-background px-3" value={discipline} onChange={(event) => setDiscipline(event.target.value as typeof allDisciplines | AchievementDiscipline)}><option value="all">Все дисциплины</option>{DISCIPLINES.map((item) => <option key={item} value={item}>{DISCIPLINE_LABELS[item]}</option>)}</select></div></div> : null}</section><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold">Хронология</h2><Button type="button" size="sm" onClick={() => { setEditing(undefined); setFormOpen(true) }}><Trophy aria-hidden="true" />Добавить достижение</Button></div>{filtered.length ? <div className="grid gap-3">{filtered.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} childName={isParent ? parentChildren?.find((item) => item.id === (achievement.childId ?? 'child-1'))?.name : undefined} comparison={getScoreChange(achievement, achievements)} onEdit={(item) => { setEditing(item); setFormOpen(true) }} onDelete={setDeleting} />)}</div> : <p className="rounded-[var(--radius-lg)] border border-dashed p-5 text-center text-sm text-muted-foreground">Подходящих достижений нет.</p>}<AchievementDialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); else setFormOpen(true) }} editing={editing} onSubmit={save} onCancel={closeForm} parentChildren={parentChildren} /><AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(undefined) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить достижение?</AlertDialogTitle><AlertDialogDescription>Результат «{deleting?.eventName}» будет удалён только с этого устройства.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleting) remove(deleting.id); setDeleting(undefined) }}>Удалить достижение</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>
}

function Summary({ label, value }: { label: string; value: string | number }) { return <div className="sinhronica-home-progress-card rounded-[var(--radius-md)] border bg-card p-3 shadow-[var(--shadow-card)]"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-1 truncate text-2xl font-extrabold tracking-[-.03em]">{value}</p></div> }
type AchievementDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; editing?: Achievement; onSubmit: (draft: AchievementDraft) => void; onCancel: () => void; parentChildren?: ParentChild[] }
function AchievementDialog({ open, onOpenChange, editing, onSubmit, onCancel, parentChildren }: AchievementDialogProps) { return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Изменить достижение' : 'Новое достижение'}</DialogTitle><DialogDescription>Результат сохранится только на этом устройстве.</DialogDescription></DialogHeader><AchievementForm key={editing?.id ?? 'new'} initialValue={editing} onSubmit={onSubmit} onCancel={onCancel} parentChildren={parentChildren} /></DialogContent></Dialog> }