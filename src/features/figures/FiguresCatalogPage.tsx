import { ArrowLeft, BookOpen, CheckCircle2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { figuresCatalog, getFigureReferences, type FigureCatalogEntry } from './figures-catalog'
import { useFigureProgressStore, type FigureProgressStatus } from '../../stores/figure-progress-store'

const statusLabels: Record<FigureProgressStatus, string> = {
  learning: 'Изучаю',
  improving: 'Получается',
  mastered: 'Освоено',
}

const ageGroupLabels: Record<string, string> = {
  under_13: 'До 13 лет',
  girls_13_15: 'Девушки 13–15 лет',
}

function ageGroupLabel(ageGroup: string) {
  return ageGroupLabels[ageGroup] ?? ageGroup
}

function matchesQuery(figure: FigureCatalogEntry, query: string) {
  const normalized = query.trim().toLocaleLowerCase('ru')
  return !normalized || `${figure.code} ${figure.name_ru} ${figure.age_group}`.toLocaleLowerCase('ru').includes(normalized)
}

export function FiguresCatalogPage({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [ageGroup, setAgeGroup] = useState('all')
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const progress = useFigureProgressStore((state) => state.progress)
  const hydrate = useFigureProgressStore((state) => state.hydrate)
  const setStatus = useFigureProgressStore((state) => state.setStatus)

  useEffect(() => hydrate(), [hydrate])
  const visibleFigures = useMemo(() => figuresCatalog.filter((figure) => matchesQuery(figure, query) && (ageGroup === 'all' || figure.age_group === ageGroup)), [ageGroup, query])
  const statusByFigure = useMemo(() => new Map(progress.map((item) => [item.figureCode, item.status])), [progress])

  return (
    <section className="mx-auto max-w-3xl space-y-5" aria-labelledby="figures-catalog-title">
      <Button type="button" variant="ghost" className="-ml-3 gap-2" onClick={onBack}><ArrowLeft className="h-4 w-4" aria-hidden="true" />К полезному</Button>
      <header className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Справочник 2026</p>
        <h1 id="figures-catalog-title" className="text-3xl font-extrabold tracking-[-0.04em]">Каталог фигур</h1>
        <p className="text-base leading-7 text-muted-foreground">20 фигур из локального справочника. Коэффициент DD и связи BP/BM показаны только там, где они подтверждены исходным пакетом.</p>
      </header>

      <div className="grid gap-3 rounded-[var(--radius-lg)] border bg-card p-4 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_auto]">
        <label className="relative block"><span className="sr-only">Найти фигуру</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Код или название фигуры" /></label>
        <label className="grid gap-1 text-sm font-semibold text-foreground"><span className="sr-only">Возрастная группа</span><select className="h-11 rounded-md border bg-background px-3 text-sm" value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)}><option value="all">Все возраста</option>{Array.from(new Set(figuresCatalog.map((figure) => figure.age_group))).map((value) => <option key={value} value={value}>{ageGroupLabel(value)}</option>)}</select></label>
      </div>

      <p className="text-sm text-muted-foreground">Найдено: {visibleFigures.length}</p>
      <div className="grid gap-3">
        {visibleFigures.map((figure) => {
          const expanded = expandedCode === figure.code
          const status = statusByFigure.get(figure.code)
          const references = getFigureReferences(figure.code)
          return <article key={figure.code} className="overflow-hidden rounded-[var(--radius-xl)] border bg-card shadow-[var(--shadow-card)]">
            <button type="button" className="w-full p-5 text-left" onClick={() => setExpandedCode(expanded ? null : figure.code)} aria-expanded={expanded} aria-controls={`figure-${figure.code}`}>
              <div className="flex gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-sm font-extrabold text-primary">{figure.code}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-extrabold tracking-[-0.02em]">{figure.name_ru}</h2>{status ? <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">{statusLabels[status]}</span> : null}</div><p className="mt-1 text-sm text-muted-foreground">{ageGroupLabel(figure.age_group)} · DD {figure.dd.toLocaleString('ru-RU')}</p></div></div>
            </button>
            {expanded ? <div id={`figure-${figure.code}`} className="space-y-4 border-t px-5 pb-5 pt-4"><p className="text-sm leading-6 text-muted-foreground">{figure.description_ru}</p><div><h3 className="text-sm font-extrabold">Освоение</h3><div className="mt-2 flex flex-wrap gap-2">{(Object.keys(statusLabels) as FigureProgressStatus[]).map((value) => <Button key={value} type="button" size="sm" variant={status === value ? 'default' : 'outline'} onClick={() => setStatus(figure.code, value)}><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{statusLabels[value]}</Button>)}</div></div><div className="grid gap-3 text-sm sm:grid-cols-2"><div><h3 className="font-extrabold">Базовые позиции</h3><p className="mt-1 text-muted-foreground">{references?.positionIds.length ? references.positionIds.join(' · ') : 'Связи не указаны'}</p></div><div><h3 className="font-extrabold">Базовые движения</h3><p className="mt-1 text-muted-foreground">{references?.movementIds.length ? references.movementIds.join(' · ') : 'Не добавляем неподтверждённые цепочки'}</p></div></div>{figure.execution_steps_ru.length ? <div><h3 className="font-extrabold">Последовательность</h3><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">{figure.execution_steps_ru.map((step) => <li key={step}>{step}</li>)}</ol></div> : null}<p className="flex gap-2 rounded-[var(--radius-md)] bg-secondary p-3 text-xs leading-5 text-muted-foreground"><BookOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{figure.technique_source.verified_official_text_2026 ? `${figure.technique_source.document} · проверенный текст 2026` : 'Описание из справочного пакета 2025; сверяй технику с актуальными правилами.'}</p></div> : null}
          </article>
        })}
      </div>
    </section>
  )
}
