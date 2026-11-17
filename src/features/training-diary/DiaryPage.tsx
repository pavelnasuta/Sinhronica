import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { useTrainingDiaryStore } from '../../stores/training-diary-store'
import { TrainingEntryForm } from './TrainingEntryForm'
import { TRAINING_MOOD_LABELS, TRAINING_TYPE_LABELS, type TrainingEntry, type TrainingEntryDraft } from './training-diary-types'

type DiaryPageProps = { onBack: () => void }
const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date(`${value}T12:00:00`))

export function DiaryPage({ onBack }: DiaryPageProps) {
  const entries = useTrainingDiaryStore((state) => state.entries)
  const storageStatus = useTrainingDiaryStore((state) => state.storageStatus)
  const hydrate = useTrainingDiaryStore((state) => state.hydrate)
  const create = useTrainingDiaryStore((state) => state.create)
  const update = useTrainingDiaryStore((state) => state.update)
  const remove = useTrainingDiaryStore((state) => state.remove)
  const [editing, setEditing] = useState<TrainingEntry | 'new' | null>(null)
  const [removing, setRemoving] = useState<TrainingEntry | null>(null)
  useEffect(() => hydrate(), [hydrate])
  const ordered = useMemo(() => [...entries].sort((left, right) => right.performedOn.localeCompare(left.performedOn) || right.updatedAt.localeCompare(left.updatedAt)), [entries])
  const storageNotice = storageStatus === 'unsaved' ? 'Изменения сохранены только в памяти: хранилище браузера недоступно.' : storageStatus === 'recovered' ? 'Повреждённые локальные записи были пропущены. Новые записи можно сохранить.' : null
  const save = (draft: TrainingEntryDraft) => { if (editing === 'new') create(draft); else if (editing) update(editing.id, draft); setEditing(null) }

  return <section className="mx-auto grid max-w-3xl gap-5" aria-labelledby="diary-title">
    <header className="flex items-start justify-between gap-3"><div><Button type="button" variant="ghost" size="icon" className="-ml-2 mb-2" onClick={onBack} aria-label="Назад"><ArrowLeft aria-hidden="true" /></Button><p className="text-xs font-extrabold uppercase tracking-[.09em] text-[color:var(--eyebrow)]">Мой ритм</p><h1 id="diary-title" className="mt-1 text-3xl font-extrabold tracking-[-.04em]">Дневник тренировок</h1><p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">Отмечай занятия и сохраняй то, что важно тебе.</p></div>{entries.length ? <Button type="button" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" />Записать</Button> : null}</header>
    {storageNotice ? <p role="status" aria-label="Состояние хранения" className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground">{storageNotice}</p> : null}
    {ordered.length ? <div className="grid gap-3">{ordered.map((entry) => <TrainingEntryCard key={entry.id} entry={entry} onEdit={() => setEditing(entry)} onRemove={() => setRemoving(entry)} />)}</div> : <div className="overflow-hidden rounded-[var(--radius-xl)] border bg-card text-center shadow-[var(--shadow-card)]"><div className="relative min-h-48 overflow-hidden bg-[radial-gradient(circle_at_50%_28%,hsl(var(--primary)/0.16),transparent_64%)] px-5 pt-4"><img src={`${import.meta.env.BASE_URL}mascots/aqui-thinking.png`} alt="Акви ждёт первую запись о тренировке" className="mx-auto h-44 w-full max-w-sm object-contain object-bottom" /></div><div className="p-5"><h2 className="text-xl font-extrabold">Тренировка — это твой след</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Вода, зал, хореография и маленькие победы — всё остаётся только на этом устройстве.</p><Button type="button" className="mt-5" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" />Добавить тренировку</Button></div></div>}
    <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>{editing === 'new' ? 'Новая тренировка' : 'Изменить тренировку'}</DialogTitle><DialogDescription>Все записи хранятся только на этом устройстве.</DialogDescription></DialogHeader><TrainingEntryForm initialValue={editing && editing !== 'new' ? editing : undefined} onSubmit={save} onCancel={() => setEditing(null)} /></DialogContent></Dialog>
    <AlertDialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить запись?</AlertDialogTitle><AlertDialogDescription>Эта тренировка и её заметка будут удалены с устройства.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { if (removing) remove(removing.id); setRemoving(null) }}>Удалить запись</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>
}

function TrainingEntryCard({ entry, onEdit, onRemove }: { entry: TrainingEntry; onEdit: () => void; onRemove: () => void }) {
  return <article className="rounded-[var(--radius-lg)] border bg-card p-4 shadow-[var(--shadow-card)]"><div className="flex items-start justify-between gap-3"><div><h2 className="capitalize text-lg font-extrabold tracking-[-.02em]">{formatDate(entry.performedOn)}</h2><p className="mt-1 text-sm text-muted-foreground">{entry.durationMinutes ? `${entry.durationMinutes} мин · ` : ''}{entry.types.map((type) => TRAINING_TYPE_LABELS[type]).join(' · ')}</p></div><div className="flex shrink-0 gap-1"><Button type="button" variant="ghost" size="icon" aria-label="Изменить тренировку" onClick={onEdit}><Pencil className="h-4 w-4" aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon" aria-label="Удалить тренировку" onClick={onRemove}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button></div></div>{entry.note ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{entry.note}</p> : null}{entry.mood ? <p className="mt-4 inline-flex rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-muted-foreground">После: {TRAINING_MOOD_LABELS[entry.mood]}</p> : null}</article>
}
