import { ArrowDown, ArrowUp, Award, Pencil, Trash2 } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { DISCIPLINE_LABELS, MEDAL_LABELS, type Achievement, type ScoreChange } from './achievement-types'

function formatDate(value: string): string {
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

function disciplineLabel(achievement: Achievement): string {
  return achievement.discipline === 'custom' ? achievement.customDiscipline ?? DISCIPLINE_LABELS.custom : DISCIPLINE_LABELS[achievement.discipline]
}

type AchievementCardProps = {
  achievement: Achievement
  comparison: ScoreChange | null
  onEdit: (achievement: Achievement) => void
  onDelete: (achievement: Achievement) => void
}

export function AchievementCard({ achievement, comparison, onEdit, onDelete }: AchievementCardProps) {
  const comparisonCopy = comparison?.direction === 'up' ? `Выше на ${comparison.difference.toLocaleString('ru-RU')}` : comparison?.direction === 'down' ? `Ниже на ${comparison.difference.toLocaleString('ru-RU')}` : comparison ? 'Без изменений' : null
  const medalClass = achievement.medal === 'gold' ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300' : achievement.medal === 'silver' ? 'bg-slate-400/20 text-slate-700 dark:text-slate-200' : achievement.medal === 'bronze' ? 'bg-orange-400/20 text-orange-800 dark:text-orange-200' : 'bg-secondary text-secondary-foreground'

  return <Card data-testid="achievement-card" className="rounded-[var(--radius-lg)] border-[color:var(--stroke)] shadow-[var(--shadow-card)]"><CardHeader className="gap-3 pb-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.08em] text-[color:var(--eyebrow)]">{formatDate(achievement.performedOn)}</p><CardTitle className="mt-1 break-words text-xl leading-6">{achievement.eventName}</CardTitle></div><span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${medalClass}`}><Award className="h-3.5 w-3.5" aria-hidden="true" />{MEDAL_LABELS[achievement.medal]}</span></div></CardHeader><CardContent className="grid gap-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">{disciplineLabel(achievement)}</p><p className="mt-1 text-3xl font-extrabold tracking-[-.04em]">{achievement.score.toLocaleString('ru-RU')}</p></div>{comparisonCopy ? <p className={`inline-flex items-center gap-1 text-sm font-bold ${comparison?.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : comparison?.direction === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>{comparison?.direction === 'up' ? <ArrowUp className="h-4 w-4" aria-hidden="true" /> : comparison?.direction === 'down' ? <ArrowDown className="h-4 w-4" aria-hidden="true" /> : null}{comparisonCopy}</p> : null}</div><div className="flex items-center justify-between"><Button type="button" variant="outline" size="icon" onClick={() => onEdit(achievement)} aria-label={`Изменить достижение ${achievement.eventName}`}><Pencil className="h-4 w-4" aria-hidden="true" /></Button><Button type="button" variant="ghost" size="icon" onClick={() => onDelete(achievement)} aria-label={`Удалить достижение ${achievement.eventName}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button></div></CardContent></Card>
}
