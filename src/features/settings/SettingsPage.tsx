import { ArrowLeft, Download, Send, Trash2, Upload } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'

import { Button } from '../../components/ui/button'
import { ShareAppCard } from '../../components/share-app-card'
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
import { useRoleProfileStore, PARENT_SPORT_RANKS, type ParentChild } from '../../stores/role-profile-store'
import { downloadParentBudgetBackup, parseParentBudgetBackup, restoreParentBudgetBackup, serializeParentBudgetBackup, type ParentBudgetBackup } from '../../lib/parent-budget-data'
import { useBudgetStore } from '../../stores/budget-store'

type SettingsPageProps = { onBack: () => void }

export function SettingsPage({ onBack }: SettingsPageProps) {
  const profile = useAthleteProfileStore((state) => state.profile)
  const save = useAthleteProfileStore((state) => state.save)
  const clearProfile = useAthleteProfileStore((state) => state.clear)
  const saveRoleProfile = useRoleProfileStore((state) => state.save)
  const roleProfile = useRoleProfileStore((state) => state.profile)
  const clearRoleProfile = useRoleProfileStore((state) => state.clear)
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

  if (roleProfile?.role === 'parent') return <ParentSettings profile={roleProfile.profile} onBack={onBack} />
  if (!draft || !profile || !('sportRank' in profile)) return null

  const update = (key: keyof typeof draft, value: string) => setDraft((current) => current ? { ...current, [key]: value } : current)
  const saveProfile = (event: FormEvent) => {
    event.preventDefault()
    const sportRank = SPORT_RANKS.find((rank) => rank === draft.sportRank)
    const next = { ...draft, name: draft.name.trim(), city: draft.city.trim(), sportRank }
    if (!sportRank || !isValidBirthDate(next.birthDate) || next.name.length < 2 || next.city.length < 2) {
      setMessage('Проверь имя, дату рождения, город и разряд.')
      return
    }
    const athlete = { ...next, sportRank, manualSportRank: sportRank }
    if (!save(athlete) || !saveRoleProfile({ role: 'athlete', profile: athlete })) {
      setMessage('Не удалось сохранить профиль на этом устройстве. Проверь настройки браузера и повтори попытку.')
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
  const removeAll = () => { clearTrainingDiary(); clearRoutines(); clearAchievements(); clearFigureProgress(); clearIdeas(); clearPreferences(); clearRoleProfile(); clearProfile(); onBack() }

  return <div className="sinhronica-settings-shell flex flex-col bg-background"><main className="sinhronica-screen mx-auto grid w-full max-w-xl gap-5 px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8" data-testid="settings-screen-transition">
    <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад"><ArrowLeft aria-hidden="true" /></Button><div><p className="text-xs font-extrabold uppercase tracking-[.1em] text-[color:var(--eyebrow)]">Синхроника</p><h1 className="text-3xl font-extrabold tracking-[-.04em]">Настройки</h1></div></div>
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Роль на этом устройстве</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Спортсменка. Чтобы выбрать другую роль, начни новый профиль — переключить роль без удаления локальных данных нельзя.</p></section>
    <form className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]" onSubmit={saveProfile}><h2 className="text-xl font-extrabold">Мой профиль</h2><div className="mt-5 grid gap-4">
      <div><Label htmlFor="settings-name">Как тебя зовут?</Label><Input id="settings-name" value={draft.name} onChange={(e) => update('name', e.target.value)} /></div>
      <div><Label htmlFor="settings-date">Дата рождения</Label><Input id="settings-date" type="date" max={formatLocalDate()} value={draft.birthDate} onChange={(e) => update('birthDate', e.target.value)} /></div>
      <div><Label htmlFor="settings-city">Город</Label><Input id="settings-city" value={draft.city} onChange={(e) => update('city', e.target.value)} /></div>
      <div><Label htmlFor="settings-rank">Спортивный разряд</Label><select id="settings-rank" aria-label="Спортивный разряд" className="mt-1 flex h-11 w-full rounded-md border bg-background px-3" value={draft.sportRank} onChange={(e) => update('sportRank', e.target.value)}>{SPORT_RANKS.map((rank) => <option key={rank}>{rank}</option>)}</select></div>
    </div><Button type="submit" className="mt-5 w-full">Сохранить профиль</Button></form>
    <ShareAppCard onStatus={setMessage} />
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Данные</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Данные хранятся в localStorage этого браузера и профиля. Они не отправляются на сервер и не синхронизируются между устройствами.</p><Button type="button" variant="outline" className="mt-4 w-full" onClick={exportData}><Download aria-hidden="true" />Экспортировать данные</Button><input ref={importInputRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Выбрать резервную копию" onChange={(event) => void selectImportFile(event)} /><Button type="button" variant="outline" className="mt-3 w-full" onClick={() => importInputRef.current?.click()}><Upload aria-hidden="true" />Загрузить резервную копию</Button><AlertDialog open={Boolean(importCandidate)} onOpenChange={(open) => { if (!open) setImportCandidate(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Заменить данные из резервной копии?</AlertDialogTitle><AlertDialogDescription>Текущие локальные данные на этом устройстве будут заменены. Найдены: профиль, {importCandidate?.achievements.length ?? 0} достижений, {importCandidate?.routines.length ?? 0} номеров и {importCandidate?.trainingDiary.length ?? 0} тренировок.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={confirmImport}>Заменить данные</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" className="mt-3 w-full"><Trash2 aria-hidden="true" />Начать новый профиль</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Создать новый профиль?</AlertDialogTitle><AlertDialogDescription>Профиль, роль, достижения и другие локальные данные на этом устройстве будут удалены без возможности восстановления.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={removeAll}>Удалить данные и начать заново</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>
    <section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Авторы</h2><p className="mt-2 text-sm text-muted-foreground">Насута Павел · Насута Таисия</p><a href="https://t.me/pavelnasuta" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"><Send className="h-4 w-4" aria-hidden="true"/>Предложить доработку</a></section>
    {message ? <p role="status" className="text-center text-sm text-muted-foreground">{message}</p> : null}
  </main></div>
}

function ParentSettings({ profile, onBack }: { profile: { name: string; city: string; children: ParentChild[] }; onBack: () => void }) {
  const saveProfile = useRoleProfileStore((state) => state.save)
  const entries = useBudgetStore((state) => state.entries)
  const [draft, setDraft] = useState(profile)
  const [message, setMessage] = useState('')
  const [candidate, setCandidate] = useState<ParentBudgetBackup | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const updateChild = (id: string, key: 'name' | 'sportRank', value: string) => setDraft((current) => ({ ...current, children: current.children.map((child) => child.id === id ? { ...child, [key]: value, ...(key === 'sportRank' ? { manualSportRank: value as ParentChild['manualSportRank'] } : {}) } : child) }))
  const save = (event: FormEvent) => { event.preventDefault(); const next = { ...draft, name: draft.name.trim(), city: draft.city.trim(), children: draft.children.map((child) => ({ ...child, name: child.name.trim() })) }; if (!saveProfile({ role: 'parent', profile: next })) { setMessage('Проверьте имя, город и данные детей.'); return }; setDraft(next); setMessage('Профиль сохранён.') }
  const select = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { setCandidate(parseParentBudgetBackup(await file.text())); setMessage('') } catch { setMessage('Не удалось прочитать резервную копию.') } }
  const restore = () => { if (!candidate) return; if (!restoreParentBudgetBackup(candidate)) { setMessage('Не удалось сохранить копию в этом браузере.'); return }; window.location.reload() }
  return <div className="sinhronica-settings-shell flex flex-col bg-background"><main className="sinhronica-screen mx-auto grid w-full max-w-xl gap-5 px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад"><ArrowLeft /></Button><div><p className="text-xs font-extrabold uppercase tracking-[.1em] text-[color:var(--eyebrow)]">Родитель</p><h1 className="text-3xl font-extrabold tracking-[-.04em]">Настройки</h1></div></div><form className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]" onSubmit={save}><h2 className="text-xl font-extrabold">Профиль семьи</h2><div className="mt-4 grid gap-4"><div><Label htmlFor="parent-settings-name">Ваше имя</Label><Input id="parent-settings-name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></div><div><Label htmlFor="parent-settings-city">Город</Label><Input id="parent-settings-city" value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} /></div>{draft.children.map((child, index) => <section key={child.id} className="grid gap-3 rounded-lg border p-3"><h3 className="font-extrabold">Ребёнок {index + 1}</h3><div><Label htmlFor={`parent-settings-${child.id}-name`}>Имя ребёнка</Label><Input id={`parent-settings-${child.id}-name`} value={child.name} onChange={(event) => updateChild(child.id, 'name', event.target.value)} /></div><div><Label htmlFor={`parent-settings-${child.id}-rank`}>Спортивный разряд</Label><select id={`parent-settings-${child.id}-rank`} className="mt-1 h-11 w-full rounded-md border bg-background px-3" value={child.sportRank} onChange={(event) => updateChild(child.id, 'sportRank', event.target.value)}>{PARENT_SPORT_RANKS.map((rank) => <option key={rank}>{rank}</option>)}</select></div></section>)}</div><Button type="submit" className="mt-5 w-full">Сохранить профиль</Button></form><ShareAppCard onStatus={setMessage} /><section className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)]"><h2 className="text-xl font-extrabold">Резервная копия</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Сохраните профиль семьи и расходы в файл для переноса на другое устройство.</p><Button type="button" variant="outline" className="mt-4 w-full" onClick={() => { downloadParentBudgetBackup(serializeParentBudgetBackup(draft, entries)); setMessage('Резервная копия скачана.') }}><Download />Экспортировать данные</Button><input ref={input} type="file" accept="application/json,.json" className="sr-only" aria-label="Выбрать копию бюджета" onChange={(event) => void select(event)} /><Button type="button" variant="outline" className="mt-3 w-full" onClick={() => input.current?.click()}><Upload />Загрузить резервную копию</Button></section>{message ? <p role="status" className="text-center text-sm text-muted-foreground">{message}</p> : null}<AlertDialog open={Boolean(candidate)} onOpenChange={(open) => !open && setCandidate(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Заменить данные из копии?</AlertDialogTitle><AlertDialogDescription>Текущий профиль семьи и расходы на этом устройстве будут заменены.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={restore}>Заменить данные</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></main></div>
}
