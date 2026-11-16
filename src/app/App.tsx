import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import { PwaInstallPrompt } from '../components/pwa-install-prompt'
import { PwaUpdateNotice } from '../components/pwa-update-notice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { FiguresCalculatorPage } from '../features/figures/FiguresCalculatorPage'
import { FiguresCatalogPage } from '../features/figures/FiguresCatalogPage'
import { Onboarding } from '../features/onboarding/Onboarding'
import { UsefulPage } from '../features/useful/UsefulPage'
import { AchievementsPage } from '../features/achievements/AchievementsPage'
import { RoutinesPage } from '../features/routines/RoutinesPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { hasSportRank, useAthleteProfileStore } from '../stores/athlete-profile-store'
import { usePreferencesStore } from '../stores/preferences-store'
import { AppShell } from './layouts/AppShell'
import { appRoutes, type RouteName } from './routes'

function routeFromHash(): RouteName {
  const route = window.location.hash.slice(1)
  if (route === 'settings' || route === 'figures-catalog' || route === 'figures-calculator') return route
  return appRoutes.find((candidate) => candidate.name === route)?.name ?? 'home'
}

function useAppliedTheme() {
  const theme = usePreferencesStore((state) => state.theme)

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media?.matches)
      document.documentElement.classList.toggle('dark', Boolean(isDark))
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#08143B' : '#F5F8FF')
    }

    applyTheme()
    if (theme !== 'system' || !media) return undefined

    media.addEventListener?.('change', applyTheme)
    return () => media.removeEventListener?.('change', applyTheme)
  }, [theme])
}

function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (isOnline) return null

  return (
    <p className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-foreground" role="status" aria-label="Подключение к интернету">
      Нет подключения к интернету. Данные доступны на этом устройстве.
    </p>
  )
}

function HomePage({ name }: { name: string }) {
  return (
    <section className="mx-auto grid max-w-3xl gap-5">
      <div className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Моя спортивная траектория</p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Привет, {name}</h1>
        <p className="max-w-xl text-base leading-7 text-muted-foreground">Тренировки, фигуры и личный прогресс — в одном ритме.</p>
      </div>
      <section className="sinhronica-hero relative overflow-hidden rounded-[var(--radius-xl)] p-5 text-white sm:p-6" aria-label="О приложении">
        <div className="relative z-10 max-w-md space-y-2">
          <p className="text-sm font-semibold text-cyan-100">Твоя спортивная траектория</p>
          <h2 className="text-xl font-extrabold tracking-[-0.025em]">Новый тренировочный дневник уже в разработке</h2>
          <p className="text-sm leading-6 text-blue-50">Система готова к экрану тренировок, библиотеке фигур и фиксации прогресса — без выдуманных результатов.</p>
        </div>
      </section>
      <Card className="rounded-[var(--radius-lg)] border-[color:var(--stroke)] bg-card shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.025em]">Основа приложения</CardTitle>
          <CardDescription>Тёмная и светлая темы, локальное хранение и доступные компоненты уже работают без сервера.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <li className="rounded-[var(--radius-md)] bg-secondary p-4"><strong className="block text-foreground">Дневник</strong>Записи о тренировках.</li>
            <li className="rounded-[var(--radius-md)] bg-secondary p-4"><strong className="block text-foreground">Фигуры</strong>Обучающие материалы.</li>
            <li className="rounded-[var(--radius-md)] bg-secondary p-4"><strong className="block text-foreground">Прогресс</strong>Личные цели и динамика.</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}

export function App() {
  const [activeRoute, setActiveRoute] = useState<RouteName>(routeFromHash)
  const athleteProfile = useAthleteProfileStore((state) => state.profile)
  useAppliedTheme()

  useEffect(() => {
    const syncRoute = () => setActiveRoute(routeFromHash())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  const navigate = (route: RouteName) => {
    window.location.hash = route
    setActiveRoute(route)
  }

  if (!athleteProfile) return <><OfflineStatus /><Onboarding /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  if (!hasSportRank(athleteProfile)) return <><OfflineStatus /><Onboarding initialProfile={athleteProfile} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>

  if (activeRoute === 'settings') return <><OfflineStatus /><SettingsPage onBack={() => navigate('home')} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>

  const page = activeRoute === 'useful' ? <UsefulPage onNavigate={navigate} /> : activeRoute === 'figures-catalog' ? <FiguresCatalogPage onBack={() => navigate('useful')} /> : activeRoute === 'figures-calculator' ? <FiguresCalculatorPage onBack={() => navigate('useful')} /> : activeRoute === 'routines' ? <RoutinesPage /> : activeRoute === 'achievements' ? <AchievementsPage /> : <HomePage name={athleteProfile.name} />
  const navigationRoute = activeRoute === 'figures-catalog' || activeRoute === 'figures-calculator' ? 'useful' : activeRoute

  return <><OfflineStatus /><PwaInstallPrompt /><AppShell activeRoute={navigationRoute} athleteProfile={athleteProfile} onNavigate={navigate}>{page}</AppShell><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
}
