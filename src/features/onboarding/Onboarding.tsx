import { ChevronLeft } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  SPORT_RANKS,
  formatLocalDate,
  isValidBirthDate,
  type LegacyAthleteProfile,
  useAthleteProfileStore,
} from '../../stores/athlete-profile-store'
import {
  type CoachProfile,
  type ParentProfile,
  type UserRole,
  useRoleProfileStore,
} from '../../stores/role-profile-store'

type AthleteDraft = { name: string; birthDate: string; city: string; sportRank: string }
type ParentDraft = ParentProfile
type CoachDraft = CoachProfile
type FieldName = keyof AthleteDraft | keyof ParentDraft | keyof CoachDraft

type OnboardingProps = {
  initialProfile?: LegacyAthleteProfile
  onProfileCreated?: () => void
}

const emptyAthlete: AthleteDraft = { name: '', birthDate: '', city: '', sportRank: '' }
const emptyParent: ParentDraft = { name: '', childName: '', childBirthDate: '', city: '' }
const emptyCoach: CoachDraft = { name: '' }

const roleOptions: Array<{ role: UserRole; title: string; description: string; image: string; imageAlt: string }> = [
  { role: 'athlete', title: 'Спортсменка', description: 'Тренировки, номера, достижения и полезные инструменты.', image: 'onboarding/role-athlete.png', imageAlt: 'Спортсменка у воды' },
  { role: 'parent', title: 'Родитель', description: 'Расходы на спорт, фигуры и полезные материалы.', image: 'onboarding/role-parent.png', imageAlt: 'Родитель с экипировкой и бюджетом' },
  { role: 'coach', title: 'Тренер', description: 'Фигуры, номера и инструменты для работы в бассейне.', image: 'onboarding/role-coach.png', imageAlt: 'Тренер по синхронному плаванию' },
]

function profileTitle(role: UserRole): string {
  return role === 'athlete' ? 'Профиль спортсменки' : role === 'parent' ? 'Профиль родителя' : 'Профиль тренера'
}

function profileIntro(role: UserRole): string {
  if (role === 'athlete') return 'Имя, дата рождения, город и спортивный разряд останутся только на этом устройстве. Мы не отправляем их на сервер.'
  if (role === 'parent') return 'Имя, данные ребёнка и город останутся только на этом устройстве. Мы не отправляем их на сервер.'
  return 'Имя останется только на этом устройстве. Мы не отправляем его на сервер.'
}

export function Onboarding({ initialProfile, onProfileCreated }: OnboardingProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => initialProfile ? 'athlete' : null)
  const [showProfile, setShowProfile] = useState(Boolean(initialProfile))
  const [athleteDraft, setAthleteDraft] = useState<AthleteDraft>(() => ({ ...emptyAthlete, ...initialProfile }))
  const [parentDraft, setParentDraft] = useState<ParentDraft>(emptyParent)
  const [coachDraft, setCoachDraft] = useState<CoachDraft>(emptyCoach)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [storageError, setStorageError] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const saveAthlete = useAthleteProfileStore((state) => state.save)
  const saveRoleProfile = useRoleProfileStore((state) => state.save)

  useEffect(() => {
    headingRef.current?.focus()
  }, [showProfile])

  const selectRole = (role: UserRole) => {
    setSelectedRole(role)
    setStorageError('')
  }

  const updateAthlete = (field: keyof AthleteDraft, value: string) => {
    setAthleteDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStorageError('')
  }

  const updateParent = (field: keyof ParentDraft, value: string) => {
    setParentDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStorageError('')
  }

  const updateCoach = (field: keyof CoachDraft, value: string) => {
    setCoachDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStorageError('')
  }

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedRole) return

    const nextErrors: Partial<Record<FieldName, string>> = {}
    if (selectedRole === 'athlete') {
      const profile = { name: athleteDraft.name.trim(), birthDate: athleteDraft.birthDate, city: athleteDraft.city.trim() }
      const sportRank = SPORT_RANKS.find((rank) => rank === athleteDraft.sportRank)
      if (profile.name.length < 2) nextErrors.name = 'Введи имя минимум из двух букв.'
      if (!isValidBirthDate(profile.birthDate)) nextErrors.birthDate = 'Введи дату рождения, которая уже наступила.'
      if (profile.city.length < 2) nextErrors.city = 'Введи название города.'
      if (!sportRank) nextErrors.sportRank = 'Выбери свой спортивный разряд.'
      if (Object.keys(nextErrors).length > 0 || !sportRank) { setErrors(nextErrors); return }

      const athlete = { ...profile, sportRank }
      const athleteSaved = saveAthlete(athlete)
      const roleSaved = saveRoleProfile({ role: 'athlete', profile: athlete })
      if (!athleteSaved || !roleSaved) setStorageError('Не удалось сохранить профиль на этом устройстве. Проверь настройки браузера и повтори попытку.')
      else onProfileCreated?.()
      return
    }

    if (selectedRole === 'parent') {
      const profile = { name: parentDraft.name.trim(), childName: parentDraft.childName.trim(), childBirthDate: parentDraft.childBirthDate, city: parentDraft.city.trim() }
      if (profile.name.length < 2) nextErrors.name = 'Введи имя минимум из двух букв.'
      if (profile.childName.length < 2) nextErrors.childName = 'Введи имя ребёнка минимум из двух букв.'
      if (!isValidBirthDate(profile.childBirthDate)) nextErrors.childBirthDate = 'Введи дату рождения, которая уже наступила.'
      if (profile.city.length < 2) nextErrors.city = 'Введи название города.'
      if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return }
      if (!saveRoleProfile({ role: 'parent', profile })) setStorageError('Не удалось сохранить профиль на этом устройстве. Проверь настройки браузера и повтори попытку.')
      else onProfileCreated?.()
      return
    }

    const profile = { name: coachDraft.name.trim() }
    if (profile.name.length < 2) { setErrors({ name: 'Введи имя минимум из двух букв.' }); return }
    if (!saveRoleProfile({ role: 'coach', profile })) setStorageError('Не удалось сохранить профиль на этом устройстве. Проверь настройки браузера и повтори попытку.')
    else onProfileCreated?.()
  }

  if (!showProfile) {
    return (
      <main className="sinhronica-shell flex min-h-[100svh] flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]" aria-labelledby="onboarding-title">
        <section className="mx-auto my-auto w-full max-w-[480px] rounded-[var(--radius-xl)] border border-[color:var(--stroke)] bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Синхроника</p>
          <h1 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-3xl font-extrabold tracking-[-0.04em] outline-none">Кто будет пользоваться Синхроникой?</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">На этом устройстве будет создан один профиль. Роль нельзя переключить — для нового профиля нужно удалить локальные данные.</p>
          <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Выбери роль">
            {roleOptions.map(({ role, title, description, image, imageAlt }) => {
              const isSelected = selectedRole === role
              return <button key={role} type="button" role="radio" aria-label={title} aria-checked={isSelected} onClick={() => selectRole(role)} className={`group grid min-h-28 grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-[var(--radius-lg)] border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}>
                <span className="grid h-24 w-24 place-items-end overflow-hidden rounded-[calc(var(--radius-lg)-0.35rem)] bg-primary/10"><img src={`${import.meta.env.BASE_URL}${image}`} alt={imageAlt} className="h-full w-full object-contain object-bottom transition-transform duration-200 group-hover:scale-105" /></span>
                <span className="min-w-0"><span className="block text-base font-extrabold">{title}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span></span>
              </button>
            })}
          </div>
          <Button type="button" size="lg" disabled={!selectedRole} className="sinhronica-primary-action mt-6 w-full font-extrabold" onClick={() => setShowProfile(true)}>Продолжить</Button>
        </section>
      </main>
    )
  }

  const role = selectedRole ?? 'athlete'
  return (
    <main className="sinhronica-shell flex min-h-[100svh] flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]" aria-labelledby="onboarding-title">
      <form className="mx-auto my-auto w-full max-w-[480px] rounded-[var(--radius-xl)] border border-[color:var(--stroke)] bg-card p-5 shadow-[var(--shadow-card)] sm:p-6" onSubmit={submitProfile} noValidate>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Синхроника</p>
        <h1 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-3xl font-extrabold tracking-[-0.04em] outline-none">{profileTitle(role)}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{profileIntro(role)}</p>
        <div className="mt-6 grid gap-4">
          {role === 'athlete' ? <>
            <Field label="Как тебя зовут?" id="athlete-name" value={athleteDraft.name} autoComplete="given-name" error={errors.name} onChange={(value) => updateAthlete('name', value)} />
            <Field label="Дата рождения" id="athlete-birth-date" type="date" value={athleteDraft.birthDate} max={formatLocalDate()} autoComplete="bday" error={errors.birthDate} onChange={(value) => updateAthlete('birthDate', value)} />
            <Field label="Город" id="athlete-city" value={athleteDraft.city} autoComplete="address-level2" error={errors.city} onChange={(value) => updateAthlete('city', value)} />
            <div className="grid gap-2"><Label htmlFor="athlete-sport-rank">Спортивный разряд</Label><select id="athlete-sport-rank" value={athleteDraft.sportRank} onChange={(event) => updateAthlete('sportRank', event.target.value)} aria-invalid={Boolean(errors.sportRank)} aria-describedby={errors.sportRank ? 'athlete-sport-rank-error' : undefined} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"><option value="" disabled>Выбери разряд</option>{SPORT_RANKS.map((sportRank) => <option key={sportRank} value={sportRank}>{sportRank}</option>)}</select>{errors.sportRank ? <p id="athlete-sport-rank-error" className="text-sm text-destructive" role="alert">{errors.sportRank}</p> : null}</div>
          </> : role === 'parent' ? <>
            <Field label="Как тебя зовут?" id="parent-name" value={parentDraft.name} autoComplete="given-name" error={errors.name} onChange={(value) => updateParent('name', value)} />
            <Field label="Как зовут ребёнка?" id="parent-child-name" value={parentDraft.childName} error={errors.childName} onChange={(value) => updateParent('childName', value)} />
            <Field label="Дата рождения ребёнка" id="parent-child-birth-date" type="date" value={parentDraft.childBirthDate} max={formatLocalDate()} error={errors.childBirthDate} onChange={(value) => updateParent('childBirthDate', value)} />
            <Field label="Город" id="parent-city" value={parentDraft.city} autoComplete="address-level2" error={errors.city} onChange={(value) => updateParent('city', value)} />
          </> : <Field label="Как тебя зовут?" id="coach-name" value={coachDraft.name} autoComplete="given-name" error={errors.name} onChange={(value) => updateCoach('name', value)} />}
        </div>
        {storageError ? <p className="mt-4 text-sm text-destructive" role="alert">{storageError}</p> : null}
        <div className="mt-6 grid gap-3">
          <Button type="submit" size="lg" className="sinhronica-primary-action w-full font-extrabold">Открыть Синхронику</Button>
          {!initialProfile ? <Button type="button" variant="ghost" className="w-full" onClick={() => setShowProfile(false)}><ChevronLeft className="h-4 w-4" aria-hidden="true" />Назад</Button> : null}
        </div>
      </form>
    </main>
  )
}

type FieldProps = {
  label: string
  id: string
  value: string
  type?: 'text' | 'date'
  max?: string
  autoComplete?: string
  error?: string
  onChange: (value: string) => void
}

function Field({ label, id, value, type = 'text', max, autoComplete, error, onChange }: FieldProps) {
  return <div className="grid gap-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} max={max} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />{error ? <p id={`${id}-error`} className="text-sm text-destructive" role="alert">{error}</p> : null}</div>
}
