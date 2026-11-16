import { ChevronRight, Settings } from 'lucide-react'

import type { RouteName } from '../../app/routes'
import type { AthleteProfile } from '../../stores/athlete-profile-store'
import type { FigureProgress } from '../../stores/figure-progress-store'
import type { Achievement } from '../achievements/achievement-types'
import { SportRankBadge } from '../profile/sport-rank-badge'
import { formatRoutineTime, type Routine } from '../routines/routine-types'

type HomePageProps = {
  profile: AthleteProfile
  routines: Routine[]
  figureProgress: FigureProgress[]
  achievements: Achievement[]
  onNavigate: (route: RouteName) => void
}

function latestByUpdate<T extends { updatedAt: string }>(items: T[]): T | undefined {
  return [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]
}

export function HomePage({ profile, routines, figureProgress, achievements, onNavigate }: HomePageProps) {
  const latestRoutine = latestByUpdate(routines)
  const medalCount = achievements.filter((achievement) => achievement.medal !== 'none').length
  const masteredFigures = figureProgress.filter((record) => record.status === 'mastered').length
  const bestScore = achievements.length ? Math.max(...achievements.map((achievement) => achievement.score)) : null

  return (
    <section className="mx-auto grid max-w-3xl gap-6" aria-labelledby="home-title">
      <header className="relative min-h-32 overflow-hidden px-1 py-4 sm:py-5">
        <div className="relative z-10 max-w-[calc(100%-6.5rem)] space-y-2">
          <h1 id="home-title" className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Привет, {profile.name}</h1>
          <SportRankBadge rank={profile.sportRank} />
        </div>
        <button type="button" onClick={() => onNavigate('settings')} className="absolute right-4 top-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Настройки"><Settings className="h-5 w-5" aria-hidden="true" /></button>
        <img src={`${import.meta.env.BASE_URL}mascots/aqui-thinking.png`} alt="Акви рядом с твоими планами" className="pointer-events-none absolute bottom-[-0.5rem] right-1 h-28 w-28 object-contain object-bottom sm:right-4" />
      </header>

      <section className="grid gap-3" aria-labelledby="progress-title">
        <h2 id="progress-title" className="text-xl font-extrabold tracking-[-0.025em]">Прогресс</h2>
        <div className="grid grid-cols-3 gap-2"><Summary label="Медали" value={medalCount} /><Summary label="Освоены" value={masteredFigures} /><Summary label="Макс. балл" value={bestScore?.toLocaleString('ru-RU') ?? '—'} /></div>
      </section>

      <section className="grid gap-3" aria-labelledby="focus-title">
        <h2 id="focus-title" className="text-xl font-extrabold tracking-[-0.025em]">Фокус сейчас</h2>
        {latestRoutine ? (
          <button type="button" onClick={() => onNavigate('routines')} className="group grid w-full gap-3 rounded-[var(--radius-lg)] border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold text-primary">Продолжи номер</p><p className="mt-1 truncate text-xl font-extrabold tracking-[-0.025em]">{latestRoutine.title}</p><p className="mt-1 text-sm text-muted-foreground">{latestRoutine.blocks.length} {latestRoutine.blocks.length === 1 ? 'блок' : latestRoutine.blocks.length > 1 && latestRoutine.blocks.length < 5 ? 'блока' : 'блоков'}{latestRoutine.targetDurationSeconds !== undefined ? ` · ${formatRoutineTime(latestRoutine.targetDurationSeconds)}` : ''}</p></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></div>
          </button>
        ) : (
          <button type="button" onClick={() => onNavigate('routines')} className="group grid w-full gap-2 rounded-[var(--radius-lg)] border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-primary">Первый шаг</p><p className="mt-1 text-xl font-extrabold tracking-[-0.025em]">Собери свой первый номер</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Добавь состав, хронометраж и структуру — всё останется на этом устройстве.</p></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></div></button>
        )}
      </section>

      <section className="grid gap-3" aria-labelledby="training-diary-title">
        <h2 id="training-diary-title" className="text-xl font-extrabold tracking-[-0.025em]">Дневник тренировок</h2>
        <article className="rounded-[var(--radius-lg)] border bg-card p-4 shadow-[var(--shadow-card)]" aria-label="Дневник тренировок скоро появится"><p className="text-base font-extrabold">Скоро здесь появится дневник</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Будет хранить тренировки, заметки и путь к следующему выступлению.</p></article>
      </section>
    </section>
  )
}

function Summary({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-[var(--radius-md)] border bg-card p-3 shadow-[var(--shadow-card)]"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-1 truncate text-2xl font-extrabold tracking-[-0.03em]">{value}</p></div>
}
