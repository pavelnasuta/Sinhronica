import { ArrowLeft, Download, Send, Share2, Trash2, Upload } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog'
import { downloadUserData, parseUserDataImport, restoreUserData, serializeUserData, type UserDataImport } from '../../lib/user-data'
import { SPORT_RANKS, formatLocalDate, isValidBirthDate, useAthleteProfileStore } from '../../stores/athlete-profile-store'
import { useIdeasStore } from '../../stores/ideas-store'
import { useAchievementsStore } from '../../stores/achievements-store'
import { useFigureProgressStore } from '../../stores/figure-progress-store'
import { useRoutinesStore } from '../../stores/routines-store'
import { useTrainingDiaryStore } from '../../stores/training-diary-store'
import { usePreferencesStore } from '../../stores/preferences-store'

type SettingsPageProps = { onBack: () => void }

export function SettingsPage({ onBack }: SettingsPageProps) {
  const profile = useAthleteProfileStore((state) => state.profile)
  const save = useAthleteProfileStore((state) => state.save)
  const clearProfile = useAthleteProfileStore((state) => state.clear)
  const ideas = useIdeasStore((state) => state.ideas)
  const clearIdeas = useIdeasStore((state) => state.clear)
  const hydrateIdeas = useIdeasStore((state) => state.hydrate)
  const achievements = useAchievementsStore((state) => state.achievements)
  const clearAchievements = useAchievementsStore((state) => state.clear)
  const hydrateAchievements = useAchievementsStore((state) => state.hydrate)
  const figureProgress = useFigureProgressStore((state) => state.progress)
  const clearFigureProgress = useFigureProgressStore((state) => state.clear)
  const hydrateFigureProgress = useFigureProgressStore((state) => state.hydrate)
  const routines = useRoutinesStore((state) => state.routines)
  const clearRoutines = useRoutinesStore((state) => state.clear)
  const hydrateRoutines = useRoutinesStore((state) => state.hydrate)
  const trainingDiary = useTrainingDiaryStore((state) => state.entries)
  const clearTrainingDiary = useTrainingDiaryStore((state) => state.clear)
  const hydrateTrainingDiary = useTrainingDiaryStore((state) => state.hydrate)
  const theme = usePreferencesStore((state) => state.theme)
  const clearPreferences = usePreferencesStore((state) => state.clear)
  const [draft, setDraft] = useState(() => profile && 'sportRank' in profile ? profile : null)
  const [message, setMessage] = useState('')
  const [importCandidate, setImportCandidate] = useState<UserDataImport | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { hydrateIdeas(); hydrateAchievements(); hydrateFigureProgress(); hydrateRoutines(); hydrateTrainingDiary() }, [hydrateAchievements, hydrateFigureProgress, hydrateIdeas, hydrateRoutines, hydrateTrainingDiary])

  if (!draft || !profile || !('sportRank' in profile)) return null

  const update = (key: keyof typeof draft, value: string) => setDraft((current) => current ? { ...current, [key]: value } : current)
  const saveProfile = (event: FormEvent) => {
    event.preventDefault()
    const sportRank = SPORT_RANKS.find((rank) => rank === draft.sportRank)
    const next = { ...draft, name: draft.name.trim(), city: draft.city.trim(), sportRank }
    if (!sportRank || !isValidBirthDate(next.birthDate) || next.name.length < 2 || next.city.length < 2 || !save({ ...next, sportRank })) {
      setMessage('Проверь имя, дату рождения, город и разряд.')
      return
    }
    setMessage('Профиль сохранён.')
  }
  const exportData = () => {
    downloadUserData(serializeUserData({ profile: draft, ideas, achievements, figureProgress, routines, trainingDiary, theme }))
    setMessage('Резервная копия скачана.')
  }
  const selectImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try { setImportCandidate(parseUserDataImport(await file.text())) } catch { setMessage('Не удалось прочитать резервную копию. Проверь файл и попробуй ещё раз.') }
  }
  const confirmImport = () => {
    if (!importCandidate) return
    if (!restoreUserData(importCandidate)) { setMessage('Не удалось сохранить данные из копии в этом браузере.'); setImportCandidate(null); return }
    window.location.reload()
  }
  const share = async () => {
    const data = { title: 'Синхроника', text: 'Плыви к своим целям в своём ритме 🌊', url: 'https://nasuta.ru/Sinhronica/' }
    if (navigator.share) {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}social/sinhronica-share.png`)
        const file = new File([await response.blob()], 'sinhronica-share.png', { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ ...data, files: [file] })
        else await navigator.share(data)
        return
      } catch { await navigator.share(data); return }
    }
    await navigator.clipboard?.writeText(data.url)
    setMessage('Ссылка скопирована.')
  }
  const removeAll = () => { clearTrainingDiary(); clearRoutines(); clearAchievements(); clearFigureProgress(); clearIdeas(); clearPreferences(); clearProfile(); onBack() }

  return <div className="sinhronica-settings-shell flex flex-col bg-background"><main className="sinhronica-screen mx-auto grid w-full max-w-xl gap-5 px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8" data-testid="settings-screen-transition">
    <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад"><ArrowLeft aria-hidden="true" /></Button><div><p className="text-xs font-extrabold uppercase tracking-[.1em] text-[color:var(--eyebrow)]">Синхроника</p><h1 className="text-3xl font-extrabold tracking-[-.04em]">Настройки</h1></div></div>
    <form className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]" onSubmit={saveProfile}><h2 className="text-xl font-extrabold">Мой профиль</h2><div className="mt-5 grid gap-4">
      <div><Label htmlFor="settings-name">Как тебя зовут?</Label><Input id="settings-name" value={draft.name} onChange={(e) => update('name', e.target.value)} /></div>
      <div><Label htmlFor="settings-date">Дата рождения</Label><Input id="settings-date" type="date" max={formatLocalDate()} value={draft.birthDate} onChange={(e) => update('birthDate', e.target.value)} /></div>
      <div><Label htmlFor="settings-city">Город</Label><Input id="settings-city" value={draft.city} onChange={(e) => update('city', e.target.value)} /></div>
      <div><Label htmlFor="settings-rank">Спортивный разряд</Label><select id="settings-rank" aria-label="Спортивный разряд" className="mt-1 flex h-11 w-full rounded-md border bg-background px-3" value={draft.sportRank} onChange={(e) => update('sportRank', e.target.value)}>{SPORT_RANKS.map((rank) => <option key={rank}>{rank}</option>)}</select></div>
    </div><Button type="submit" className="mt-5 w-full">Сохранить профиль</Button></form>
    <section className="overflow-hidden rounded-[var(--radius-xl)] border bg-card shadow-[var(--shadow-card)]"><div className="h-56 bg-[radial-gradient(circle_at_50%_35%,hsl(var(--primary)/0.2),transparent_62%)] p-3"><img src={`${import.meta.env.BASE_URL}onboarding/practice.webp`} alt="" className="h-full w-full object-contain object-center"/></div><div className="p-5"><h2 className="text-xl font-extrabold">Поделиться Синхроникой</h2><p className="mt-2 text-sm text-muted-foreground">Плыви к своим целям в своём ритме 🌊</p><Button type="button" className="mt-4 w-full" onClick={() => void share()}><Share2 aria-hidden="true" />Поделиться приложением с друзьями</Button></div></section>
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Данные</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Данные хранятся в localStorage этого браузера и профиля. Они не отправляются на сервер и не синхронизируются между устройствами.</p><Button type="button" variant="outline" className="mt-4 w-full" onClick={exportData}><Download aria-hidden="true" />Экспортировать данные</Button><input ref={importInputRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Выбрать резервную копию" onChange={(event) => void selectImportFile(event)} /><Button type="button" variant="outline" className="mt-3 w-full" onClick={() => importInputRef.current?.click()}><Upload aria-hidden="true" />Загрузить резервную копию</Button><AlertDialog open={Boolean(importCandidate)} onOpenChange={(open) => { if (!open) setImportCandidate(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Заменить данные из резервной копии?</AlertDialogTitle><AlertDialogDescription>Текущие локальные данные на этом устройстве будут заменены. Найдены: профиль, {importCandidate?.achievements.length ?? 0} достижений, {importCandidate?.routines.length ?? 0} номеров и {importCandidate?.trainingDiary.length ?? 0} тренировок.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={confirmImport}>Заменить данные</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" className="mt-3 w-full"><Trash2 aria-hidden="true" />Удалить данные с устройства</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить все данные?</AlertDialogTitle><AlertDialogDescription>Профиль, достижения и другие локальные данные на этом устройстве будут удалены без возможности восстановления.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={removeAll}>Удалить мои данные</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Авторы</h2><p className="mt-2 text-sm text-muted-foreground">Насута Павел · Насута Таисия</p><a href="https://t.me/pavelnasuta" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"><Send className="h-4 w-4" aria-hidden="true"/>Предложить доработку</a></section>
    {message ? <p role="status" className="text-center text-sm text-muted-foreground">{message}</p> : null}
  </main></div>
}
