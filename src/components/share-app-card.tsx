import { Share2 } from 'lucide-react'

import { Button } from './ui/button'

type ShareAppCardProps = { onStatus?: (message: string) => void }

const shareData = {
  title: 'Синхроника',
  text: 'Плыви к своим целям в своём ритме 🌊',
  url: 'https://nasuta.ru/Sinhronica/',
}

async function shareApp(onStatus?: (message: string) => void) {
  if (navigator.share) {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}social/sinhronica-share.png`)
      const file = new File([await response.blob()], 'sinhronica-share.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ ...shareData, files: [file] })
      else await navigator.share(shareData)
      return
    } catch {
      await navigator.share(shareData)
      return
    }
  }
  await navigator.clipboard?.writeText(shareData.url)
  onStatus?.('Ссылка скопирована.')
}

export function ShareAppCard({ onStatus }: ShareAppCardProps) {
  return <section className="overflow-hidden rounded-[var(--radius-xl)] border bg-card shadow-[var(--shadow-card)]"><div className="h-56 bg-[radial-gradient(circle_at_50%_35%,hsl(var(--primary)/0.2),transparent_62%)] p-3"><img src={`${import.meta.env.BASE_URL}onboarding/practice.webp`} alt="" className="h-full w-full object-contain object-center" /></div><div className="p-5"><h2 className="text-xl font-extrabold">Поделиться Синхроникой</h2><p className="mt-2 text-sm text-muted-foreground">Плыви к своим целям в своём ритме 🌊</p><Button type="button" className="mt-4 w-full" onClick={() => void shareApp(onStatus)}><Share2 aria-hidden="true" />Поделиться приложением с друзьями</Button></div></section>
}
