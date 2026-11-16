import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

import { Button } from './ui/button'

export function PwaUpdateNotice() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!needRefresh) return null

  const applyUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateServiceWorker()
    } catch {
      setIsUpdating(false)
    }
  }

  return (
    <section className="fixed inset-0 z-[100] overflow-y-auto bg-[#08143B] text-white" role="dialog" aria-modal="true" aria-labelledby="pwa-update-title" aria-describedby="pwa-update-description">
      <div className="relative isolate mx-auto flex min-h-[100svh] w-full max-w-lg flex-col overflow-hidden px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 top-[28%] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -right-28 top-0 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(180deg,transparent_0%,rgba(8,20,59,0.84)_40%,#08143B_100%)]" />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-6">
          <div className="relative mx-auto flex h-[min(46svh,420px)] w-full max-w-[360px] items-end justify-center pt-2">
            <img src={`${import.meta.env.BASE_URL}mascots/aqui-thinking.png`} alt="Акви задумалась об обновлении" className="h-full w-full object-contain object-bottom drop-shadow-[0_22px_38px_rgba(0,0,0,0.4)]" />
          </div>

          <div className="rounded-[var(--radius-xl)] border border-white/15 bg-white/10 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cyan-100">Синхроника обновилась</p>
            <h2 id="pwa-update-title" className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Есть кое-что новое</h2>
            <p id="pwa-update-description" className="mt-3 text-sm leading-6 text-blue-50">Акви думает, что пора обновить приложение. Данные на этом устройстве сохранятся.</p>
            <div className="mt-6 grid gap-3">
              <Button type="button" size="lg" className="sinhronica-primary-action w-full font-extrabold" onClick={() => void applyUpdate()} disabled={isUpdating} autoFocus>
                {isUpdating ? 'Обновляем…' : 'Обновить'}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-blue-50 hover:bg-white/10 hover:text-white" onClick={() => setNeedRefresh(false)} disabled={isUpdating}>
                Позже
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
