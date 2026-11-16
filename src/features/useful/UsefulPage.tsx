import { BookOpen, Calculator, Sparkles } from 'lucide-react'

const modules = [
  {
    title: 'Калькулятор баллов',
    description: 'Быстрый расчёт баллов для тренировок и стартов.',
    Icon: Calculator,
  },
  {
    title: 'Правила',
    description: 'Соберём важные правила синхронного плавания в одном месте.',
    Icon: BookOpen,
  },
  {
    title: 'Скоро ещё больше полезного',
    description: 'Готовим новые подсказки и инструменты для твоего пути.',
    Icon: Sparkles,
  },
] as const

export function UsefulPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6" aria-labelledby="useful-title">
      <div className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Инструменты для спортсменки</p>
        <h1 id="useful-title" className="text-3xl font-extrabold tracking-[-0.04em]">Полезное</h1>
        <p className="max-w-xl text-base leading-7 text-muted-foreground">Здесь появятся понятные помощники для подготовки, тренировок и стартов.</p>
      </div>

      <div className="grid gap-3">
        {modules.map(({ title, description, Icon }) => (
          <article key={title} className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold tracking-[-0.02em]">{title}</h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary">В разработке</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
