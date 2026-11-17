import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import { PwaInstallPrompt } from '../components/pwa-install-prompt'
import { PwaUpdateNotice } from '../components/pwa-update-notice'
import { AchievementsPage } from '../features/achievements/AchievementsPage'
import { FiguresCalculatorPage } from '../features/figures/FiguresCalculatorPage'
import { FiguresCatalogPage } from '../features/figures/FiguresCatalogPage'
import { HomePage } from '../features/home/HomePage'
import { DiaryPage } from '../features/training-diary/DiaryPage'
import { MetronomePage } from '../features/metronome/MetronomePage'
import { Onboarding } from '../features/onboarding/Onboarding'
import { RoutinesPage } from '../features/routines/RoutinesPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { UsefulPage } from '../features/useful/UsefulPage'
import { hasSportRank, useAthleteProfileStore } from '../stores/athlete-profile-store'
import { useAchievementsStore } from '../stores/achievements-store'
import { useFigureProgressStore } from '../stores/figure-progress-store'
import { usePreferencesStore } from '../stores/preferences-store'
import { useRoutinesStore } from '../stores/routines-store'
import { useTrainingDiaryStore } from '../stores/training-diary-store'
import { AppShell } from './layouts/AppShell'
import { appRoutes, type RouteName } from './routes'

function routeFromHash(): RouteName {
  const route = window.location.hash.slice(1)
  if (route === 'settings' || route === 'figures-catalog' || route === 'figures-calculator' || route === 'diary' || route === 'metronome') return route
  return appRoutes.find((candidate) => candidate.name === route)?.name ?? 'home'
}

function useAppliedTheme() {
  const theme = usePreferencesStore((state) => state.theme)

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#08143B' : '#F5F8FF')
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

  return <p className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-foreground" role="status" aria-label="Подключение к интернету">Нет подключения к интернету. Данные доступны на этом устройстве.</p>
}

export function App() {
  const [activeRoute, setActiveRoute] = useState<RouteName>(routeFromHash)
  const athleteProfile = useAthleteProfileStore((state) => state.profile)
  const routines = useRoutinesStore((state) => state.routines)
  const hydrateRoutines = useRoutinesStore((state) => state.hydrate)
  const figureProgress = useFigureProgressStore((state) => state.progress)
  const hydrateFigureProgress = useFigureProgressStore((state) => state.hydrate)
  const achievements = useAchievementsStore((state) => state.achievements)
  const hydrateAchievements = useAchievementsStore((state) => state.hydrate)
  const entries = useTrainingDiaryStore((state) => state.entries)
  const hydrateEntries = useTrainingDiaryStore((state) => state.hydrate)
  useAppliedTheme()

  useEffect(() => {
    const syncRoute = () => setActiveRoute(routeFromHash())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    hydrateRoutines()
    hydrateFigureProgress()
    hydrateAchievements()
    hydrateEntries()
  }, [hydrateAchievements, hydrateEntries, hydrateFigureProgress, hydrateRoutines])

  const navigate = (route: RouteName) => {
    window.location.hash = route
    setActiveRoute(route)
  }

  if (!athleteProfile) return <><OfflineStatus /><Onboarding /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  if (!hasSportRank(athleteProfile)) return <><OfflineStatus /><Onboarding initialProfile={athleteProfile} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>

  if (activeRoute === 'settings') return <><OfflineStatus /><SettingsPage onBack={() => navigate('home')} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  if (activeRoute === 'metronome') return <><OfflineStatus /><MetronomePage onBack={() => navigate('useful')} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>

  const page = activeRoute === 'useful'
    ? <UsefulPage onNavigate={navigate} />
    : activeRoute === 'figures-catalog'
      ? <FiguresCatalogPage onBack={() => navigate('useful')} />
      : activeRoute === 'figures-calculator'
        ? <FiguresCalculatorPage onBack={() => navigate('useful')} />
        : activeRoute === 'routines'
          ? <RoutinesPage />
          : activeRoute === 'achievements'
            ? <AchievementsPage />
            : activeRoute === 'diary'
              ? <DiaryPage onBack={() => navigate('home')} />
              : <HomePage profile={athleteProfile} routines={routines} figureProgress={figureProgress} achievements={achievements} entries={entries} onNavigate={navigate} />
  const navigationRoute = activeRoute === 'figures-catalog' || activeRoute === 'figures-calculator' ? 'useful' : activeRoute === 'diary' ? 'home' : activeRoute

  return <><OfflineStatus /><PwaInstallPrompt /><AppShell activeRoute={navigationRoute} onNavigate={navigate}>{page}</AppShell><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
}
