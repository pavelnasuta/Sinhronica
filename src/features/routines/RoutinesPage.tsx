import { Music2 } from 'lucide-react'

export function RoutinesPage() {
  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="routines-title">
      <div className="overflow-hidden rounded-[var(--radius-xl)] border bg-card shadow-[var(--shadow-card)]">
        <div className="relative min-h-72 overflow-hidden bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.18),transparent_64%)] px-5 pt-5">
          <img
            src={`${import.meta.env.BASE_URL}onboarding/practice.webp`}
            alt="Акви тренируется перед новыми номерами"
            className="mx-auto h-64 w-full max-w-md object-contain object-bottom"
          />
        </div>
        <div className="p-5 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
            <Music2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Скоро здесь будет твоя программа</p>
          <h1 id="routines-title" className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Номера</h1>
          <h2 className="mt-3 text-lg font-extrabold">Раздел в разработке</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Акви уже готовится — совсем скоро здесь можно будет собирать и хранить свои номера.</p>
        </div>
      </div>
    </section>
  )
}
