import { ChevronRight } from 'lucide-react'

import type { RouteName } from '../../app/routes'
import type { AthleteProfile } from '../../stores/athlete-profile-store'
import type { FigureProgress } from '../../stores/figure-progress-store'
import { TRAINING_MOOD_LABELS, type TrainingEntry, type TrainingMood } from '../../features/training-diary/training-diary-types'
import { getDiaryWeekSummary, diaryCountLabel } from '../../features/training-diary/training-diary-utils'
import type { Achievement } from '../achievements/achievement-types'
import { SportRankBadge } from '../profile/sport-rank-badge'
import { formatRoutineTime, type Routine } from '../routines/routine-types'

type HomePageProps = {
  profile: AthleteProfile
  routines: Routine[]
  figureProgress: FigureProgress[]
  achievements: Achievement[]
  entries: TrainingEntry[]
  onNavigate: (route: RouteName) => void
}

function latestByUpdate<T extends { updatedAt: string }>(items: T[]): T | undefined {
  return [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]
}

export function HomePage({ profile, routines, figureProgress, achievements, entries, onNavigate }: HomePageProps) {
  const latestRoutine = latestByUpdate(routines)
  const diary = getDiaryWeekSummary(entries)
  const medalCount = achievements.filter((achievement) => achievement.medal !== 'none').length
  const masteredFigures = figureProgress.filter((record) => record.status === 'mastered').length
  const bestScore = achievements.length ? Math.max(...achievements.map((achievement) => achievement.score)) : null

  return (
    <section className="mx-auto grid max-w-3xl gap-6" aria-labelledby="home-title">
      <header className="sinhronica-home-header relative min-h-32 overflow-hidden px-1 py-4 sm:py-5">
        <button type="button" onClick={() => onNavigate('settings')} className="group relative z-10 flex max-w-[calc(100%-6.5rem)] flex-col items-start gap-2 rounded-[var(--radius-md)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Открыть настройки профиля">
          <h1 id="home-title" className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Привет, {profile.name}</h1>
          <span className="inline-flex items-center gap-1.5"><SportRankBadge rank={profile.sportRank} /><ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
        </button>
        <img src={`${import.meta.env.BASE_URL}mascots/aqui-thinking.png`} alt="Акви рядом с твоими планами" className="pointer-events-none absolute bottom-[-0.5rem] right-1 h-28 w-28 object-contain object-bottom sm:right-4" />
      </header>

      <section className="grid gap-3" aria-labelledby="progress-title">
        <h2 id="progress-title" className="text-xl font-extrabold tracking-[-0.025em]">Прогресс</h2>
        <div className="grid grid-cols-3 gap-2"><Summary label="Медали" value={medalCount} /><Summary label="Освоены" value={masteredFigures} /><Summary label="Макс. балл" value={bestScore?.toLocaleString('ru-RU') ?? '—'} /></div>
      </section>

      <section className="grid gap-3" aria-labelledby="focus-title">
        <h2 id="focus-title" className="text-xl font-extrabold tracking-[-0.025em]">Фокус сейчас</h2>
        {latestRoutine ? (
          <button type="button" onClick={() => onNavigate('routines')} className="sinhronica-home-focus-card group grid w-full gap-3 rounded-[var(--radius-lg)] border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold text-primary">Продолжи номер</p><p className="mt-1 truncate text-xl font-extrabold tracking-[-0.025em]">{latestRoutine.title}</p><p className="mt-1 text-sm text-muted-foreground">{latestRoutine.blocks.length} {latestRoutine.blocks.length === 1 ? 'блок' : latestRoutine.blocks.length > 1 && latestRoutine.blocks.length < 5 ? 'блока' : 'блоков'}{latestRoutine.targetDurationSeconds !== undefined ? ` · ${formatRoutineTime(latestRoutine.targetDurationSeconds)}` : ''}</p></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></div>
          </button>
        ) : (
          <button type="button" onClick={() => onNavigate('routines')} className="sinhronica-home-focus-card group grid w-full gap-2 rounded-[var(--radius-lg)] border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-primary">Первый шаг</p><p className="mt-1 text-xl font-extrabold tracking-[-0.025em]">Собери свой первый номер</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Добавь состав, хронометраж и структуру — всё останется на этом устройстве.</p></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></div></button>
        )}
      </section>

      <section className="grid gap-3" aria-labelledby="training-diary-title">
        <h2 id="training-diary-title" className="text-xl font-extrabold tracking-[-0.025em]">Дневник тренировок</h2>
        <button type="button" onClick={() => onNavigate('diary')} className="sinhronica-home-diary-card group grid w-full gap-3 rounded-[var(--radius-lg)] border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Открыть дневник тренировок"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-extrabold">{diary.count ? `${diaryCountLabel(diary.count)} на этой неделе` : 'Запиши первую тренировку'}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{diary.count ? 'Твой ритм складывается из маленьких шагов.' : 'Вода, зал, заметки и ощущения — только для тебя.'}</p></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></div>{diary.moods.length ? <div className="flex items-center gap-2" aria-label="Последние отмеченные ощущения после тренировок">{diary.moods.map((mood, index) => <span key={`${mood}-${index}`} title={TRAINING_MOOD_LABELS[mood]} className={`h-2.5 w-2.5 rounded-full ${moodDotClass(mood)}`} />)}</div> : null}</button>
      </section>
    </section>
  )
}

function moodDotClass(mood: TrainingMood): string {
  return mood === 'heavy' ? 'bg-red-400' : mood === 'calm' ? 'bg-cyan-400' : mood === 'good' ? 'bg-sky-400' : 'bg-emerald-400'
}

function Summary({ label, value }: { label: string; value: number | string }) {
  return <div className="sinhronica-home-progress-card rounded-[var(--radius-md)] border bg-card p-3 shadow-[var(--shadow-card)]"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-1 truncate text-2xl font-extrabold tracking-[-0.03em]">{value}</p></div>
}
