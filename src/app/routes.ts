export type RouteName = 'home' | 'useful' | 'routines' | 'achievements' | 'diary' | 'settings' | 'figures-catalog' | 'figures-calculator' | 'metronome' | 'box-breathing'
export type PrimaryRouteName = 'home' | 'useful' | 'routines' | 'achievements'

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
