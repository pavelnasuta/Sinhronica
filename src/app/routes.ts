export type RouteName = 'home' | 'useful' | 'routines' | 'achievements' | 'budget' | 'figures' | 'diary' | 'settings' | 'figures-catalog' | 'figures-calculator' | 'metronome' | 'box-breathing'
export type PrimaryRouteName = 'home' | 'useful' | 'routines' | 'achievements' | 'budget' | 'figures'

export type AppRoute = {
  name: PrimaryRouteName
  label: string
}

export const athleteRoutes: AppRoute[] = [
  { name: 'home', label: 'Главная' },
  { name: 'useful', label: 'Полезное' },
  { name: 'routines', label: 'Номера' },
  { name: 'achievements', label: 'Достижения' },
]

export const parentRoutes: AppRoute[] = [
  { name: 'home', label: 'Главная' },
  { name: 'budget', label: 'Бюджет' },
  { name: 'figures', label: 'Фигуры' },
  { name: 'useful', label: 'Полезное' },
]

export const coachRoutes: AppRoute[] = [
  { name: 'home', label: 'Главная' },
  { name: 'figures', label: 'Фигуры' },
  { name: 'routines', label: 'Номера' },
  { name: 'useful', label: 'Полезное' },
]

export const appRoutes = athleteRoutes
