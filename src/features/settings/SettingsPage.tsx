import { ArrowLeft, Download, Send, Share2, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog'
import { downloadUserData, serializeUserData } from '../../lib/user-data'
import { SPORT_RANKS, formatLocalDate, isValidBirthDate, useAthleteProfileStore } from '../../stores/athlete-profile-store'
import { useIdeasStore } from '../../stores/ideas-store'
import { usePreferencesStore, type ThemePreference } from '../../stores/preferences-store'

type SettingsPageProps = { onBack: () => void }

export function SettingsPage({ onBack }: SettingsPageProps) {
  const profile = useAthleteProfileStore((state) => state.profile)
  const save = useAthleteProfileStore((state) => state.save)
  const clearProfile = useAthleteProfileStore((state) => state.clear)
  const ideas = useIdeasStore((state) => state.ideas)
  const clearIdeas = useIdeasStore((state) => state.clear)
  const theme = usePreferencesStore((state) => state.theme)
  const setTheme = usePreferencesStore((state) => state.setTheme)
  const clearPreferences = usePreferencesStore((state) => state.clear)
  const [draft, setDraft] = useState(() => profile && 'sportRank' in profile ? profile : null)
  const [message, setMessage] = useState('')

  if (!draft) return null

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
    downloadUserData(serializeUserData({ profile: draft, ideas, theme }))
    setMessage('Резервная копия скачана.')
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
  const removeAll = () => { clearIdeas(); clearPreferences(); clearProfile(); onBack() }

  return <main className="mx-auto grid w-full max-w-xl gap-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
    <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад"><ArrowLeft aria-hidden="true" /></Button><div><p className="text-xs font-extrabold uppercase tracking-[.1em] text-[color:var(--eyebrow)]">Синхроника</p><h1 className="text-3xl font-extrabold tracking-[-.04em]">Настройки</h1></div></div>
    <form className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]" onSubmit={saveProfile}><h2 className="text-xl font-extrabold">Мой профиль</h2><div className="mt-5 grid gap-4">
      <div><Label htmlFor="settings-name">Как тебя зовут?</Label><Input id="settings-name" value={draft.name} onChange={(e) => update('name', e.target.value)} /></div>
      <div><Label htmlFor="settings-date">Дата рождения</Label><Input id="settings-date" type="date" max={formatLocalDate()} value={draft.birthDate} onChange={(e) => update('birthDate', e.target.value)} /></div>
      <div><Label htmlFor="settings-city">Город</Label><Input id="settings-city" value={draft.city} onChange={(e) => update('city', e.target.value)} /></div>
      <div><Label htmlFor="settings-rank">Спортивный разряд</Label><select id="settings-rank" aria-label="Спортивный разряд" className="mt-1 flex h-11 w-full rounded-md border bg-background px-3" value={draft.sportRank} onChange={(e) => update('sportRank', e.target.value)}>{SPORT_RANKS.map((rank) => <option key={rank}>{rank}</option>)}</select></div>
    </div><Button type="submit" className="mt-5 w-full">Сохранить профиль</Button></form>
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Оформление</h2><Label htmlFor="settings-theme" className="mt-4 block">Тема оформления</Label><select id="settings-theme" aria-label="Тема оформления" className="mt-1 flex h-11 w-full rounded-md border bg-background px-3" value={theme} onChange={(e) => setTheme(e.target.value as ThemePreference)}><option value="system">Системная</option><option value="dark">Тёмная</option><option value="light">Светлая</option></select></section>
    <section className="overflow-hidden rounded-[var(--radius-xl)] border bg-card shadow-[var(--shadow-card)]"><img src={`${import.meta.env.BASE_URL}onboarding/practice.webp`} alt="" className="h-44 w-full object-cover object-center"/><div className="p-5"><h2 className="text-xl font-extrabold">Поделиться Синхроникой</h2><p className="mt-2 text-sm text-muted-foreground">Плыви к своим целям в своём ритме 🌊</p><Button type="button" className="mt-4 w-full" onClick={() => void share()}><Share2 aria-hidden="true" />Поделиться приложением с друзьями</Button></div></section>
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Данные</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Экспорт — это резервная копия для сохранения данных или переноса на другое устройство. Она не отправляется разработчикам.</p><Button type="button" variant="outline" className="mt-4 w-full" onClick={exportData}><Download aria-hidden="true" />Экспортировать данные</Button><AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" className="mt-3 w-full"><Trash2 aria-hidden="true" />Удалить данные с устройства</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить все данные?</AlertDialogTitle><AlertDialogDescription>Профиль, идеи и настройки на этом устройстве будут удалены без возможности восстановления.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={removeAll}>Удалить мои данные</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Авторы</h2><p className="mt-2 text-sm text-muted-foreground">Насута Павел · Насута Таисия</p><a href="https://t.me/pavelnasuta" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"><Send className="h-4 w-4" aria-hidden="true"/>Предложить доработку</a></section>
    {message ? <p role="status" className="text-center text-sm text-muted-foreground">{message}</p> : null}
  </main>
}
