import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { calculateFigureSet, formatScore, type JudgeCount } from './figure-scoring'
import { figuresCatalog, getFigureByCode } from './figures-catalog'

type Draft = { id: number; figureCode: string; judgeCount: JudgeCount; scores: string[]; invalidFigure: boolean; repeatedSuccessfullyUnder13: boolean }

const defaultScores = (count: JudgeCount) => Array.from({ length: count }, () => '')
const createDraft = (id: number, figureCode = '106'): Draft => ({ id, figureCode, judgeCount: 5, scores: defaultScores(5), invalidFigure: false, repeatedSuccessfullyUnder13: false })

export function FiguresCalculatorPage({ onBack }: { onBack: () => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([createDraft(1, '106'), createDraft(2, '307e')])
  const [penalties, setPenalties] = useState('0')
  const outcome = useMemo(() => calculateFigureSet({
    official: true,
    penalties,
    figures: drafts.map((draft) => ({ judgeCount: draft.judgeCount, scores: draft.invalidFigure ? [] : draft.scores.map((score) => score.trim() ? score : null), dd: String(getFigureByCode(draft.figureCode)?.dd ?? ''), invalidFigure: draft.invalidFigure, repeatedSuccessfullyUnder13: draft.repeatedSuccessfullyUnder13 })),
  }), [drafts, penalties])

  const updateDraft = (id: number, update: Partial<Draft>) => setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, ...update } : draft))
  const switchJudgeCount = (draft: Draft, judgeCount: JudgeCount) => updateDraft(draft.id, { judgeCount, scores: Array.from({ length: judgeCount }, (_, index) => draft.scores[index] ?? '') })
  const showFourFigures = drafts.length === 4

  return (
    <section className="mx-auto max-w-3xl space-y-5" aria-labelledby="figures-calculator-title">
      <Button type="button" variant="ghost" className="-ml-3 gap-2" onClick={onBack}><ArrowLeft className="h-4 w-4" aria-hidden="true" />К полезному</Button>
      <header className="space-y-2"><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Только фигуры</p><h1 id="figures-calculator-title" className="text-3xl font-extrabold tracking-[-0.04em]">Калькулятор баллов</h1><p className="text-base leading-7 text-muted-foreground">Рассчитывает результаты двух или четырёх фигур по введённым оценкам судей. Он не оценивает технику и не применяется к программам под музыку.</p></header>

      <div className="flex flex-wrap gap-2"><Button type="button" variant={showFourFigures ? 'outline' : 'default'} onClick={() => !showFourFigures || setDrafts((current) => current.slice(0, 2))}>2 фигуры</Button><Button type="button" variant={showFourFigures ? 'default' : 'outline'} onClick={() => showFourFigures || setDrafts((current) => [...current, createDraft(3, '359'), createDraft(4, '420')])}>4 фигуры</Button></div>
      <div className="grid gap-4">
        {drafts.map((draft, index) => {
          const figure = getFigureByCode(draft.figureCode)
          const figureOutcome = outcome.ok ? outcome.value.figures[index] : null
          return <article key={draft.id} className="space-y-4 rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-extrabold">Фигура {index + 1}</h2></div><div className="grid gap-3 sm:grid-cols-2"><label className="grid min-w-0 gap-1 text-sm font-semibold">Фигура<select className="h-11 w-full min-w-0 rounded-md border bg-background px-3 text-sm font-normal" value={draft.figureCode} onChange={(event) => updateDraft(draft.id, { figureCode: event.target.value })}>{figuresCatalog.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name_ru}</option>)}</select></label><div className="rounded-md bg-secondary p-3 text-sm"><span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">DD из каталога</span><strong className="mt-1 block text-lg">{figure?.dd.toLocaleString('ru-RU') ?? '—'}</strong></div><label className="grid gap-1 text-sm font-semibold">Судьи<select className="h-11 rounded-md border bg-background px-3 text-sm font-normal" value={draft.judgeCount} onChange={(event) => switchJudgeCount(draft, Number(event.target.value) as JudgeCount)}><option value="4">4</option><option value="5">5</option><option value="6">6</option></select></label><label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.invalidFigure} onChange={(event) => updateDraft(draft.id, { invalidFigure: event.target.checked })} />Принудительный ноль</label><label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.repeatedSuccessfullyUnder13} onChange={(event) => updateDraft(draft.id, { repeatedSuccessfullyUnder13: event.target.checked })} />Повтор до 13 лет</label></div>{!draft.invalidFigure ? <fieldset><legend className="text-sm font-extrabold">Оценки судей <span className="font-normal text-muted-foreground">(0,0–10,0; оставь пустым одну для замены)</span></legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{draft.scores.map((score, scoreIndex) => <label key={scoreIndex} className="grid gap-1 text-xs font-bold text-muted-foreground">Судья {scoreIndex + 1}<Input inputMode="decimal" aria-label={`Фигура ${index + 1}, судья ${scoreIndex + 1}`} value={score} onChange={(event) => updateDraft(draft.id, { scores: draft.scores.map((item, itemIndex) => itemIndex === scoreIndex ? event.target.value : item) })} placeholder="—" /></label>)}</div></fieldset> : <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">Результат фигуры будет 0. DD остаётся в знаменателе итогового результата.</p>}{figureOutcome ? <p className="rounded-md bg-primary/10 p-3 text-sm"><strong>Средняя: </strong>{figureOutcome.average ? formatScore(figureOutcome.average, 4) : '0,0000'} · <strong>Взвешенный результат: </strong>{formatScore(figureOutcome.weightedScore, 4)}</p> : null}</article>
        })}
      </div>
      <article className="space-y-3 rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><label className="grid max-w-xs gap-1 text-sm font-semibold">Штрафы за комплект<Input inputMode="decimal" value={penalties} onChange={(event) => setPenalties(event.target.value)} /></label>{outcome.ok ? <div className="rounded-[var(--radius-md)] bg-primary p-4 text-primary-foreground"><p className="text-sm font-semibold opacity-90">Итоговый результат</p><p className="mt-1 text-3xl font-extrabold">{formatScore(outcome.value.result, 4)}</p>{formatScore(outcome.value.totalPenalty, 1) !== '0,0' ? <p className="mt-1 text-sm opacity-90">Учтённый штраф: {formatScore(outcome.value.totalPenalty, 1)}</p> : null}</div> : <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{outcome.errors.join(' ')}</div>}<p className="text-xs leading-5 text-muted-foreground">Промежуточные вычисления не округляются. Показанный результат округлён до четырёх знаков только для отображения.</p></article>
    </section>
  )
}
