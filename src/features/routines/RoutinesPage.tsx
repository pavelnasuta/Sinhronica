import { Music2, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { useRoutinesStore } from '../../stores/routines-store'
import { RoutineCard } from './RoutineCard'
import { RoutineDetailPage } from './RoutineDetailPage'
import { RoutineForm } from './RoutineForm'
import type { Routine, RoutineDraft } from './routine-types'

type RoutinesPageProps = { audience?: 'athlete' | 'coach' }

export function RoutinesPage({ audience = 'athlete' }: RoutinesPageProps) {
  const coach = audience === 'coach'
  const copy = coach ? { eyebrow: 'Тренерская работа', intro: 'Состав, блоки, таймлайн и заметки для работы в бассейне.', emptyTitle: 'Карточка номера — в одном месте', emptyDescription: 'Добавь состав, блоки, таймлайн и заметки для работы в бассейне.', cardDescription: 'Это рабочая карточка для подготовки, не официальная заявка.' } : { eyebrow: 'Мои программы', intro: 'Собирай структуру номера и держи описание всегда под рукой.', emptyTitle: 'Твой номер — в одном месте', emptyDescription: 'Добавь состав, хронометраж и структуру. Всё сохранится только на этом устройстве.', cardDescription: 'Это твоя личная карточка, не официальная заявка.' }
  const routines = useRoutinesStore((state) => state.routines)
  const hydrate = useRoutinesStore((state) => state.hydrate)
  const create = useRoutinesStore((state) => state.create)
  const update = useRoutinesStore((state) => state.update)
  const remove = useRoutinesStore((state) => state.remove)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Routine | 'new' | null>(null)
  const [deleteRoutine, setDeleteRoutine] = useState<Routine | null>(null)
  useEffect(() => hydrate(), [hydrate])
  const ordered = useMemo(() => [...routines].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)), [routines])
  const selected = routines.find((routine) => routine.id === selectedId)
  const save = (draft: RoutineDraft) => { const created = editing === 'new' ? create(draft) : null; if (editing && editing !== 'new') update(editing.id, draft); setEditing(null); if (created) setSelectedId(created.id) }

  if (selected) return <><RoutineDetailPage routine={selected} onBack={() => setSelectedId(null)} onEdit={() => setEditing(selected)} onUpdate={(draft) => update(selected.id, draft)} onRemove={() => setDeleteRoutine(selected)} /><Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>Редактировать номер</DialogTitle><DialogDescription>{copy.cardDescription}</DialogDescription></DialogHeader><RoutineForm initialValue={editing && editing !== 'new' ? editing : selected} onSubmit={save} onCancel={() => setEditing(null)} /></DialogContent></Dialog><AlertDialog open={Boolean(deleteRoutine)} onOpenChange={(open) => !open && setDeleteRoutine(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить номер?</AlertDialogTitle><AlertDialogDescription>Карточка и её структура будут удалены с этого устройства.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteRoutine) { remove(deleteRoutine.id); setSelectedId(null) }; setDeleteRoutine(null) }}>Удалить номер</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>

  return <section className="mx-auto max-w-3xl space-y-5" aria-labelledby="routines-title"><header className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">{copy.eyebrow}</p><h1 id="routines-title" className="mt-1 text-3xl font-extrabold tracking-[-0.04em]">Номера</h1><p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">{copy.intro}</p></div>{routines.length ? <Button type="button" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" />Новый</Button> : null}</header>{routines.length ? <div className="grid gap-3">{ordered.map((routine) => <RoutineCard key={routine.id} routine={routine} onOpen={() => setSelectedId(routine.id)} />)}</div> : <div className="overflow-hidden rounded-[var(--radius-xl)] border bg-card text-center shadow-[var(--shadow-card)]"><div className="relative min-h-64 overflow-hidden bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.18),transparent_64%)] px-5 pt-5"><img src={`${import.meta.env.BASE_URL}onboarding/practice.webp`} alt="Акви тренируется перед новым номером" className="mx-auto h-56 w-full max-w-md object-contain object-bottom" /></div><div className="p-5"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary"><Music2 className="h-5 w-5" aria-hidden="true" /></div><h2 className="mt-4 text-xl font-extrabold">{copy.emptyTitle}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{copy.emptyDescription}</p><Button type="button" className="mt-5" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" />Создать номер</Button></div></div>}<Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>{editing === 'new' ? 'Новый номер' : 'Редактировать номер'}</DialogTitle><DialogDescription>{copy.cardDescription}</DialogDescription></DialogHeader><RoutineForm key={editing === 'new' ? 'new' : editing?.id} initialValue={editing === 'new' ? undefined : editing ?? undefined} onSubmit={save} onCancel={() => setEditing(null)} /></DialogContent></Dialog><AlertDialog open={Boolean(deleteRoutine)} onOpenChange={(open) => !open && setDeleteRoutine(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить номер?</AlertDialogTitle><AlertDialogDescription>Карточка и её структура будут удалены с этого устройства.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteRoutine) { remove(deleteRoutine.id); setSelectedId(null) }; setDeleteRoutine(null) }}>Удалить номер</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>
}
