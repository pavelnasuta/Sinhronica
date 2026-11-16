export type RouteName = 'home' | 'ideas' | 'gallery' | 'settings'
export type PrimaryRouteName = Exclude<RouteName, 'settings'>

export type AppRoute = {
  name: PrimaryRouteName
  label: string
}

export const appRoutes: AppRoute[] = [
  { name: 'home', label: 'Главная' },
  { name: 'ideas', label: 'Идеи' },
  { name: 'gallery', label: 'Галерея' },
]
