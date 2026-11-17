import { type FormEvent, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { TRAINING_MOOD_LABELS, TRAINING_MOODS, TRAINING_TYPE_LABELS, TRAINING_TYPES, type TrainingEntry, type TrainingEntryDraft, type TrainingMood, type TrainingType } from './training-diary-types'

type TrainingEntryFormProps = { initialValue?: TrainingEntry; onSubmit: (draft: TrainingEntryDraft) => void; onCancel: () => void }
const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }

export function TrainingEntryForm({ initialValue, onSubmit, onCancel }: TrainingEntryFormProps) {
  const [draft, setDraft] = useState({ performedOn: initialValue?.performedOn ?? today(), types: initialValue?.types ?? [] as TrainingType[], durationMinutes: initialValue?.durationMinutes?.toString() ?? '', note: initialValue?.note ?? '', mood: initialValue?.mood ?? '' as TrainingMood | '' })
  const [error, setError] = useState('')
  const toggleType = (type: TrainingType) => setDraft((current) => ({ ...current, types: current.types.includes(type) ? current.types.filter((item) => item !== type) : [...current.types, type] }))
  const submit = (event: FormEvent) => { event.preventDefault(); if (!draft.performedOn || draft.performedOn > today()) { setError(!draft.performedOn ? 'Укажи дату тренировки.' : 'Дата тренировки не может быть в будущем.'); return }; if (!draft.types.length) { setError('Выбери хотя бы один тип тренировки.'); return }; const note = draft.note.trim(); const durationMinutes = draft.durationMinutes === '' ? undefined : Number(draft.durationMinutes); if (note.length > 1200 || (durationMinutes !== undefined && (!Number.isInteger(durationMinutes) || durationMinutes < 0))) { setError(note.length > 1200 ? 'Заметка может быть до 1200 символов.' : 'Проверь длительность тренировки.'); return }; onSubmit({ performedOn: draft.performedOn, types: draft.types, durationMinutes, note: note || undefined, mood: draft.mood || undefined }) }
  return <form className="grid gap-5" onSubmit={submit}>
    <div className="grid gap-2"><Label htmlFor="training-date">Когда была тренировка?</Label><Input id="training-date" type="date" max={today()} value={draft.performedOn} onChange={(event) => setDraft((current) => ({ ...current, performedOn: event.target.value }))} /></div>
    <fieldset className="grid gap-2"><legend className="text-sm font-semibold leading-none">Что было?</legend><div className="flex flex-wrap gap-2">{TRAINING_TYPES.map((type) => <button key={type} type="button" aria-pressed={draft.types.includes(type)} onClick={() => toggleType(type)} className={`min-h-10 rounded-full border px-3 text-sm font-bold transition-colors ${draft.types.includes(type) ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:border-primary/50'}`}>{TRAINING_TYPE_LABELS[type]}</button>)}</div></fieldset>
    <div className="grid gap-2"><Label htmlFor="training-duration">Длительность, минут <span className="font-normal text-muted-foreground">(необязательно)</span></Label><Input id="training-duration" type="number" min="0" inputMode="numeric" value={draft.durationMinutes} onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: event.target.value }))} placeholder="Например, 90" /></div>
    <div className="grid gap-2"><Label htmlFor="training-note">Заметка <span className="font-normal text-muted-foreground">(необязательно)</span></Label><Textarea id="training-note" value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Что получилось, что хочется запомнить?" rows={4} /></div>
    <fieldset className="grid gap-2"><legend className="text-sm font-semibold leading-none">Как ощущалось после?</legend><p className="text-sm text-muted-foreground">Можно не отмечать.</p><div className="grid grid-cols-2 gap-2">{TRAINING_MOODS.map((mood) => <button key={mood} type="button" aria-pressed={draft.mood === mood} onClick={() => setDraft((current) => ({ ...current, mood: current.mood === mood ? '' : mood }))} className={`min-h-11 rounded-[var(--radius-md)] border px-3 text-left text-sm font-bold transition-colors ${draft.mood === mood ? 'border-primary bg-primary/10 text-foreground' : 'bg-background text-muted-foreground hover:border-primary/50'}`}>{TRAINING_MOOD_LABELS[mood]}</button>)}</div></fieldset>
    {error ? <p role="alert" className="text-sm font-semibold text-destructive">{error}</p> : null}
    <div className="grid grid-cols-2 gap-3"><Button type="button" variant="outline" onClick={onCancel}>Отмена</Button><Button type="submit">Сохранить</Button></div>
  </form>
}
