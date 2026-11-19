import { useState, type FormEvent } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { DISCIPLINES, DISCIPLINE_LABELS, MEDALS, MEDAL_LABELS, type Achievement, type AchievementDraft } from './achievement-types'
import { SPORT_RANKS } from '../../stores/sport-ranks'
import type { ParentChild } from '../../stores/role-profile-store'
import { isValidPerformanceDate, normalizeAchievementDraft } from './achievement-utils'

type AchievementFormProps = {
  initialValue?: Achievement
  onSubmit: (draft: AchievementDraft) => void
  onCancel: () => void
  parentChildren?: ParentChild[]
}

function today(): string {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function initialDraft(value?: Achievement, parentChildren?: ParentChild[]): AchievementDraft {
  return value ? {
    performedOn: value.performedOn,
    eventName: value.eventName,
    discipline: value.discipline,
    customDiscipline: value.customDiscipline,
    score: value.score,
    medal: value.medal,
    awardedRank: value.awardedRank,
    childId: value.childId ?? (parentChildren?.[0]?.id as AchievementDraft['childId']),
  } : { performedOn: today(), eventName: '', discipline: 'figures', score: Number.NaN, medal: 'none', awardedRank: undefined, childId: parentChildren?.[0]?.id as AchievementDraft['childId'] }
}

export function AchievementForm({ initialValue, onSubmit, onCancel, parentChildren }: AchievementFormProps) {
  const [draft, setDraft] = useState<AchievementDraft>(() => initialDraft(initialValue, parentChildren))
  const [scoreInput, setScoreInput] = useState(() => initialValue ? String(initialValue.score) : '')
  const [error, setError] = useState('')
  const update = <Key extends keyof AchievementDraft>(key: Key, value: AchievementDraft[Key]) => setDraft((current) => ({ ...current, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalized = normalizeAchievementDraft({ ...draft, score: Number(scoreInput.replace(',', '.')) })
    if (!normalized) {
      setError(isValidPerformanceDate(draft.performedOn) ? 'Проверь соревнование, дисциплину и балл.' : 'Укажи корректную дату проведения без будущих дат.')
      return
    }
    onSubmit(normalized)
  }

  return <form className="grid gap-4" onSubmit={submit}>
    {parentChildren?.length ? <div className="grid gap-2"><Label htmlFor="achievement-child">Для ребёнка</Label><select id="achievement-child" className="h-11 rounded-md border bg-background px-3" value={draft.childId ?? parentChildren[0].id} onChange={(event) => update('childId', event.target.value as AchievementDraft['childId'])}>{parentChildren.map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}</select></div> : null}
    <div className="grid gap-2"><Label htmlFor="achievement-date">Дата проведения</Label><Input id="achievement-date" type="date" max={today()} value={draft.performedOn} onChange={(event) => update('performedOn', event.target.value)} /></div>
    <div className="grid gap-2"><Label htmlFor="achievement-event">Соревнование или событие</Label><Input id="achievement-event" value={draft.eventName} placeholder="Например, Кубок Федерации" onChange={(event) => update('eventName', event.target.value)} /></div>
    <div className="grid gap-2"><Label htmlFor="achievement-discipline">Дисциплина</Label><select id="achievement-discipline" className="h-11 rounded-md border bg-background px-3" value={draft.discipline} onChange={(event) => update('discipline', event.target.value as AchievementDraft['discipline'])}>{DISCIPLINES.map((discipline) => <option key={discipline} value={discipline}>{DISCIPLINE_LABELS[discipline]}</option>)}</select></div>
    {draft.discipline === 'custom' ? <div className="grid gap-2"><Label htmlFor="achievement-custom-discipline">Своя дисциплина</Label><Input id="achievement-custom-discipline" value={draft.customDiscipline ?? ''} onChange={(event) => update('customDiscipline', event.target.value)} /></div> : null}
    <div className="grid gap-2"><Label htmlFor="achievement-score">Балл</Label><Input id="achievement-score" type="text" inputMode="decimal" value={scoreInput} onChange={(event) => setScoreInput(event.target.value)} /></div>
    <div className="grid gap-2"><Label htmlFor="achievement-medal">Медаль</Label><select id="achievement-medal" className="h-11 rounded-md border bg-background px-3" value={draft.medal} onChange={(event) => update('medal', event.target.value as AchievementDraft['medal'])}>{MEDALS.map((medal) => <option key={medal} value={medal}>{MEDAL_LABELS[medal]}</option>)}</select></div>
    <div className="grid gap-2"><Label htmlFor="achievement-rank">Получен новый разряд</Label><select id="achievement-rank" className="h-11 rounded-md border bg-background px-3" value={draft.awardedRank ?? ''} onChange={(event) => update('awardedRank', (event.target.value || undefined) as AchievementDraft['awardedRank'])}><option value="">Не отмечать</option>{SPORT_RANKS.map((rank) => <option key={rank} value={rank}>{rank}</option>)}</select></div>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onCancel}>Отмена</Button><Button type="submit">Сохранить достижение</Button></div>
  </form>
}
