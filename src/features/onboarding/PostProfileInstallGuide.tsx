import { Download, Share, Smartphone } from 'lucide-react'

import { Button } from '../../components/ui/button'

export function PostProfileInstallGuide({ onFinish }: { onFinish: () => void }) {
  return <main className="sinhronica-shell flex min-h-[100svh] flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]" aria-labelledby="install-guide-title">
    <section className="mx-auto my-auto w-full max-w-[480px] rounded-[var(--radius-xl)] border border-[color:var(--stroke)] bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mx-auto grid h-44 max-w-52 place-items-end overflow-hidden rounded-[var(--radius-lg)] bg-[radial-gradient(circle_at_50%_25%,hsl(var(--primary)/0.2),transparent_68%)]"><img src={`${import.meta.env.BASE_URL}onboarding/install-guide.png`} alt="Акви подсказывает, как установить приложение" className="h-full w-full object-contain object-bottom" /></div>
      <p className="mt-5 text-center text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">Почти готово</p>
      <h1 id="install-guide-title" className="mt-1 text-center text-3xl font-extrabold tracking-[-0.04em]">Установи Синхронику</h1>
      <p className="mt-3 text-center text-sm leading-6 text-muted-foreground">Приложение откроется с домашнего экрана, будет работать быстрее и останется доступным без сети.</p>
      <div className="mt-5 grid gap-3">
        <section className="rounded-[var(--radius-lg)] border bg-secondary/40 p-4" aria-labelledby="android-install-title"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Smartphone className="h-5 w-5" aria-hidden="true" /></span><h2 id="android-install-title" className="font-extrabold">Android</h2></div><p className="mt-3 text-sm leading-6 text-muted-foreground">В Chrome открой меню ⋮ и выбери «Установить приложение» или «Добавить на главный экран».</p></section>
        <section className="rounded-[var(--radius-lg)] border bg-secondary/40 p-4" aria-labelledby="ios-install-title"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Share className="h-5 w-5" aria-hidden="true" /></span><h2 id="ios-install-title" className="font-extrabold">iPhone и iPad</h2></div><p className="mt-3 text-sm leading-6 text-muted-foreground">В Safari нажми «Поделиться» <Share className="mx-0.5 inline h-4 w-4 align-text-bottom" aria-hidden="true" /> и выбери «На экран «Домой»».</p></section>
      </div>
      <Button type="button" size="lg" className="sinhronica-primary-action mt-6 w-full font-extrabold" onClick={onFinish}><Download aria-hidden="true" />Открыть Синхронику</Button>
    </section>
  </main>
}
