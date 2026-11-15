import { ChevronLeft } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { formatLocalDate, isValidBirthDate, useAthleteProfileStore } from '../../stores/athlete-profile-store'

const slides = [
  {
    title: 'Привет, это Синхроника',
    body: 'Твой спокойный помощник в тренировках и движении к цели.',
    image: 'welcome.webp',
  },
  {
    title: 'Твоя цель — в центре',
    body: 'Выбирай, чему хочешь научиться, и отмечай маленькие шаги.',
    image: 'goal.webp',
  },
  {
    title: 'Тренируйся в своём ритме',
    body: 'Сохраняй тренировки и возвращайся к нужным фигурам.',
    image: 'practice.webp',
  },
  {
    title: 'Замечай свой рост',
    body: 'Каждая тренировка складывается в твой личный прогресс — без сравнений с другими.',
    image: 'progress.webp',
  },
  {
    title: 'Начнём?',
    body: 'Сначала заполним профиль, чтобы Синхроника могла обращаться к тебе по имени.',
    image: 'start.webp',
  },
]

type FieldName = 'name' | 'birthDate' | 'city'

type ProfileDraft = Record<FieldName, string>

const initialProfile: ProfileDraft = { name: '', birthDate: '', city: '' }

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<ProfileDraft>(initialProfile)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [storageError, setStorageError] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const saveProfile = useAthleteProfileStore((state) => state.save)
  const isProfileStep = step === slides.length
  const activeSlide = slides[step]

  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  const updateField = (field: FieldName, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStorageError('')
  }

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Partial<Record<FieldName, string>> = {}
    const profile = { name: draft.name.trim(), birthDate: draft.birthDate, city: draft.city.trim() }

    if (profile.name.length < 2) nextErrors.name = 'Введи имя минимум из двух букв.'
    if (!isValidBirthDate(profile.birthDate)) nextErrors.birthDate = 'Введи дату рождения, которая уже наступила.'
    if (profile.city.length < 2) nextErrors.city = 'Введи название города.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    if (!saveProfile(profile)) {
      setStorageError('Не удалось сохранить профиль на этом устройстве. Проверь настройки браузера и повтори попытку.')
    }
  }

  return (
    <main className="sinhronica-shell flex min-h-[100svh] flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]" aria-labelledby="onboarding-title">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        <div className="mb-5 flex items-center justify-between gap-4 text-xs font-bold text-muted-foreground">
          <span aria-live="polite">Шаг {step + 1} из {slides.length + 1}</span>
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: slides.length + 1 }, (_, index) => <span key={index} className={`h-1.5 w-5 rounded-full ${index <= step ? 'bg-primary' : 'bg-muted'}`} />)}
          </div>
        </div>

        {isProfileStep ? (
          <form className="my-auto rounded-[var(--radius-xl)] border border-[color:var(--stroke)] bg-card p-5 shadow-[var(--shadow-card)] sm:p-6" onSubmit={submitProfile} noValidate>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Мой профиль</p>
            <h1 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-3xl font-extrabold tracking-[-0.04em] outline-none">Расскажи немного о себе</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Имя, дата рождения и город останутся только на этом устройстве. Мы не отправляем их на сервер.</p>
            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="athlete-name">Как тебя зовут?</Label>
                <Input id="athlete-name" autoComplete="given-name" value={draft.name} onChange={(event) => updateField('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'athlete-name-error' : undefined} />
                {errors.name ? <p id="athlete-name-error" className="text-sm text-destructive" role="alert">{errors.name}</p> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="athlete-birth-date">Дата рождения</Label>
                <Input id="athlete-birth-date" type="date" autoComplete="bday" max={formatLocalDate()} value={draft.birthDate} onChange={(event) => updateField('birthDate', event.target.value)} aria-invalid={Boolean(errors.birthDate)} aria-describedby={errors.birthDate ? 'athlete-birth-date-error' : undefined} />
                {errors.birthDate ? <p id="athlete-birth-date-error" className="text-sm text-destructive" role="alert">{errors.birthDate}</p> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="athlete-city">Город</Label>
                <Input id="athlete-city" autoComplete="address-level2" value={draft.city} onChange={(event) => updateField('city', event.target.value)} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'athlete-city-error' : undefined} />
                {errors.city ? <p id="athlete-city-error" className="text-sm text-destructive" role="alert">{errors.city}</p> : null}
              </div>
            </div>
            {storageError ? <p className="mt-4 text-sm text-destructive" role="alert">{storageError}</p> : null}
            <div className="mt-6 grid gap-3">
              <Button type="submit" size="lg" className="sinhronica-primary-action w-full font-extrabold">Открыть Синхронику</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(slides.length - 1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" />Назад</Button>
            </div>
          </form>
        ) : (
          <section className="my-auto flex flex-1 flex-col justify-between gap-6" aria-describedby="onboarding-copy">
            <div className="pt-2">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Синхроника</p>
              <h1 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-3xl font-extrabold tracking-[-0.04em] outline-none">{activeSlide.title}</h1>
              <p id="onboarding-copy" className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">{activeSlide.body}</p>
            </div>
            <div className="relative flex min-h-[280px] flex-1 items-end justify-center overflow-hidden rounded-[var(--radius-xl)] bg-[radial-gradient(circle_at_50%_0%,rgba(55,221,244,0.18),transparent_56%)]">
              <img src={`${import.meta.env.BASE_URL}onboarding/${activeSlide.image}`} alt="" className="max-h-[48svh] max-w-full object-contain object-bottom" />
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-3 pb-1">
              {step > 0 ? <Button type="button" variant="ghost" size="icon" onClick={() => setStep((current) => current - 1)} aria-label="Назад"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></Button> : <span />}
              <Button type="button" size="lg" className="sinhronica-primary-action w-full font-extrabold" onClick={() => setStep((current) => current + 1)}>Продолжить</Button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
