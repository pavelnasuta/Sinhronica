import { House, Music2, Sparkles, Trophy } from 'lucide-react'
import { type ReactNode } from 'react'

import { appRoutes, type RouteName } from '../routes'

const routeIcons = {
  home: House,
  useful: Sparkles,
  routines: Music2,
  achievements: Trophy,
}

type AppShellProps = {
  activeRoute: RouteName
  onNavigate: (route: RouteName) => void
  children: ReactNode
}

export function AppShell({ activeRoute, onNavigate, children }: AppShellProps) {
  return (
    <div className="sinhronica-shell flex flex-col bg-background">
      <nav className="mx-auto hidden w-full max-w-5xl gap-1 border-b px-4 py-2 sm:flex sm:px-6" aria-label="Основная навигация">
        {appRoutes.map((route) => (
          <a key={route.name} href={`#${route.name}`} onClick={() => onNavigate(route.name)} aria-current={activeRoute === route.name ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-md)] px-4 text-sm font-semibold transition-colors ${activeRoute === route.name ? 'sinhronica-nav-active' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            {route.label}
          </a>
        ))}
      </nav>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8">
        <div key={activeRoute} className="sinhronica-screen" data-testid="screen-transition">{children}</div>
      </main>
      <footer className="hidden border-t px-4 py-4 text-center text-sm text-muted-foreground sm:block sm:px-6">Локальное приложение без сервера и внешнего трекинга.</footer>
      <nav className="sinhronica-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgb(1_7_37_/_0.2)] backdrop-blur sm:hidden" aria-label="Мобильная навигация">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {appRoutes.map((route) => {
            const Icon = routeIcons[route.name]
            const isActive = activeRoute === route.name

            return (
              <a key={route.name} href={`#${route.name}`} onClick={() => onNavigate(route.name)} aria-current={isActive ? 'page' : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs font-bold transition-colors ${isActive ? 'sinhronica-nav-active' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{route.label}</span>
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
