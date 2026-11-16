export type RouteName = 'home' | 'useful' | 'routines' | 'achievements' | 'settings'
export type PrimaryRouteName = Exclude<RouteName, 'settings'>

export type AppRoute = {
  name: PrimaryRouteName
  label: string
}

export const appRoutes: AppRoute[] = [
  { name: 'home', label: 'Главная' },
  { name: 'useful', label: 'Полезное' },
  { name: 'routines', label: 'Номера' },
  { name: 'achievements', label: 'Достижения' },
]
