import { BookOpen, Calculator, ChevronRight, Sparkles } from 'lucide-react'

import { Button } from '../../components/ui/button'
import type { RouteName } from '../../app/routes'

const modules = [
  { route: 'figures-calculator' as const, title: 'Калькулятор баллов', description: 'Расчёт результатов двух или четырёх фигур по оценкам судей и DD.', Icon: Calculator },
  { route: 'figures-catalog' as const, title: 'Каталог фигур', description: '20 фигур, DD, подтверждённые связи BP/BM и личный прогресс освоения.', Icon: BookOpen },
] satisfies Array<{ route: RouteName; title: string; description: string; Icon: typeof Calculator }>

export function UsefulPage({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  return (
    <section className="mx-auto max-w-3xl space-y-6" aria-labelledby="useful-title">
      <div className="space-y-2"><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Инструменты для спортсменки</p><h1 id="useful-title" className="text-3xl font-extrabold tracking-[-0.04em]">Полезное</h1><p className="max-w-xl text-base leading-7 text-muted-foreground">Помощники для подготовки, тренировок и стартов. Данные остаются на этом устройстве.</p></div>
      <div className="grid gap-3">{modules.map(({ route, title, description, Icon }) => <Button key={route} type="button" variant="outline" className="h-auto min-h-0 w-full justify-start whitespace-normal rounded-[var(--radius-xl)] border bg-card p-5 text-left shadow-[var(--shadow-card)] hover:bg-card" onClick={() => onNavigate(route)}><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary"><Icon className="h-6 w-6" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-lg font-extrabold tracking-[-0.02em] text-foreground">{title}</span><span className="mt-2 block text-sm font-normal leading-6 text-muted-foreground">{description}</span></span><ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" /></Button>)}</div>
      <article className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary"><Sparkles className="h-6 w-6" aria-hidden="true" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-extrabold tracking-[-0.02em]">Скоро ещё больше полезного</h2><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary">В разработке</span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">Готовим новые подсказки и инструменты для твоего пути.</p></div></div></article>
    </section>
  )
}
