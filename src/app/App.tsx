import { useEffect, useRef, useState } from 'react'
import { Toaster } from 'sonner'

import { PwaInstallPrompt } from '../components/pwa-install-prompt'
import { PwaUpdateNotice } from '../components/pwa-update-notice'
import { AchievementsPage } from '../features/achievements/AchievementsPage'
import { BudgetPage } from '../features/budget/BudgetPage'
import { BoxBreathingPage } from '../features/box-breathing/BoxBreathingPage'
import { FiguresCalculatorPage } from '../features/figures/FiguresCalculatorPage'
import { FiguresCatalogPage } from '../features/figures/FiguresCatalogPage'
import { HomePage } from '../features/home/HomePage'
import { DiaryPage } from '../features/training-diary/DiaryPage'
import { MetronomePage } from '../features/metronome/MetronomePage'
import { Onboarding } from '../features/onboarding/Onboarding'
import { PostProfileInstallGuide } from '../features/onboarding/PostProfileInstallGuide'
import { RoutinesPage } from '../features/routines/RoutinesPage'
import { RoleReadyPage } from '../features/role-ready/RoleReadyPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { UsefulPage } from '../features/useful/UsefulPage'
import { hasSportRank, useAthleteProfileStore } from '../stores/athlete-profile-store'
import { useAchievementsStore } from '../stores/achievements-store'
import { useFigureProgressStore } from '../stores/figure-progress-store'
import { usePreferencesStore } from '../stores/preferences-store'
import { useRoutinesStore } from '../stores/routines-store'
import { useTrainingDiaryStore } from '../stores/training-diary-store'
import { useRoleProfileStore } from '../stores/role-profile-store'
import { AppShell } from './layouts/AppShell'
import { trackRouteView } from './metrica'
import { appRoutes, coachRoutes, parentRoutes, type RouteName } from './routes'

function routeFromHash(): RouteName {
  const route = window.location.hash.slice(1)
  if (route === 'settings' || route === 'figures-catalog' || route === 'figures-calculator' || route === 'diary' || route === 'metronome' || route === 'box-breathing' || route === 'budget' || route === 'figures') return route
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
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const trackedRoute = useRef(activeRoute)
  const athleteProfile = useAthleteProfileStore((state) => state.profile)
  const roleProfile = useRoleProfileStore((state) => state.profile)
  const saveRoleProfile = useRoleProfileStore((state) => state.save)
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
    window.scrollTo(0, 0)
  }, [activeRoute])

  useEffect(() => {
    if (trackedRoute.current === activeRoute) return
    trackedRoute.current = activeRoute
    trackRouteView(activeRoute)
  }, [activeRoute])

  useEffect(() => {
    hydrateRoutines()
    hydrateFigureProgress()
    hydrateAchievements()
    hydrateEntries()
  }, [hydrateAchievements, hydrateEntries, hydrateFigureProgress, hydrateRoutines])

  useEffect(() => {
    if (roleProfile || !athleteProfile || !hasSportRank(athleteProfile)) return
    saveRoleProfile({ role: 'athlete', profile: athleteProfile })
  }, [athleteProfile, roleProfile, saveRoleProfile])

  const navigate = (route: RouteName) => {
    window.location.hash = route
    setActiveRoute(route)
  }

  const activeRoleProfile = roleProfile ?? (athleteProfile && hasSportRank(athleteProfile) ? { role: 'athlete' as const, profile: athleteProfile } : null)

  if (!activeRoleProfile) return <><OfflineStatus /><Onboarding initialProfile={athleteProfile && !hasSportRank(athleteProfile) ? athleteProfile : undefined} onProfileCreated={() => setShowInstallGuide(true)} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  if (showInstallGuide) return <><OfflineStatus /><PostProfileInstallGuide onFinish={() => setShowInstallGuide(false)} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  if (activeRoleProfile.role === 'parent' && activeRoute === 'settings') return <><OfflineStatus /><SettingsPage onBack={() => navigate('home')} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  if (activeRoleProfile.role !== 'athlete') {
    const roleRoutes = activeRoleProfile.role === 'parent' ? parentRoutes : coachRoutes
    const toolRoutes: RouteName[] = ['figures-catalog', 'figures-calculator', 'metronome', 'box-breathing']
    const roleRoute = roleRoutes.some((route) => route.name === activeRoute) || toolRoutes.includes(activeRoute) ? activeRoute : 'home'
    const page = roleRoute === 'figures'
      ? <FiguresCatalogPage onBack={() => navigate('home')} backLabel="К главной" audience={activeRoleProfile.role} />
      : roleRoute === 'figures-catalog'
        ? <FiguresCatalogPage onBack={() => navigate('useful')} audience={activeRoleProfile.role} />
        : roleRoute === 'figures-calculator'
          ? <FiguresCalculatorPage onBack={() => navigate('useful')} />
          : roleRoute === 'metronome'
            ? <MetronomePage onBack={() => navigate('useful')} />
            : roleRoute === 'box-breathing'
              ? <BoxBreathingPage onBack={() => navigate('useful')} />
              : roleRoute === 'routines'
                ? <RoutinesPage audience="coach" />
                : roleRoute === 'settings' && activeRoleProfile.role === 'parent'
                  ? <SettingsPage onBack={() => navigate('home')} />
                  : roleRoute === 'achievements' && activeRoleProfile.role === 'parent'
                    ? <AchievementsPage parentChildren={activeRoleProfile.profile.children} />
                    : roleRoute === 'useful'
                      ? <UsefulPage onNavigate={navigate} />
                      : roleRoute === 'budget'
                        ? <BudgetPage />
                        : <RoleReadyPage roleProfile={activeRoleProfile} onNavigate={navigate} />

    return <><OfflineStatus /><PwaInstallPrompt /><AppShell activeRoute={roleRoute} onNavigate={navigate} routes={roleRoutes}>{page}</AppShell><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  }

  const activeAthleteProfile = activeRoleProfile.profile

  if (activeRoute === 'settings') return <><OfflineStatus /><SettingsPage onBack={() => navigate('home')} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  if (activeRoute === 'metronome') return <><OfflineStatus /><MetronomePage onBack={() => navigate('useful')} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
  if (activeRoute === 'box-breathing') return <><OfflineStatus /><BoxBreathingPage onBack={() => navigate('useful')} /><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>

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
              : <HomePage profile={activeAthleteProfile} routines={routines} figureProgress={figureProgress} achievements={achievements} entries={entries} onNavigate={navigate} />
  const navigationRoute = activeRoute === 'figures-catalog' || activeRoute === 'figures-calculator' ? 'useful' : activeRoute === 'diary' ? 'home' : activeRoute

  return <><OfflineStatus /><PwaInstallPrompt /><AppShell activeRoute={navigationRoute} onNavigate={navigate}>{page}</AppShell><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
}
