export const METRICA_COUNTER_ID = 114334019

declare global {
  interface Window {
    ym?: (counterId: number, method: 'hit', url: string) => void
  }
}

export function trackRouteView(route: string): void {
  const url = new URL(window.location.href)
  url.hash = route
  window.ym?.(METRICA_COUNTER_ID, 'hit', url.href)
}
