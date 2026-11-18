import { BookOpen, ChevronRight, Music2, ShieldCheck, Sparkles, WalletCards } from 'lucide-react'

import type { RouteName } from '../../app/routes'
import { Button } from '../../components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog'
import { roleLabel, type RoleProfile, useRoleProfileStore } from '../../stores/role-profile-store'
import { useBudgetStore } from '../../stores/budget-store'

type RoleReadyPageProps = {
  roleProfile: Exclude<RoleProfile, { role: 'athlete' }>
  onNavigate: (route: RouteName) => void
}

export function RoleReadyPage({ roleProfile, onNavigate }: RoleReadyPageProps) {
  const clearRoleProfile = useRoleProfileStore((state) => state.clear)
  const clearBudget = useBudgetStore((state) => state.clear)
  const parent = roleProfile.role === 'parent'
  const heading = parent
    ? `${roleProfile.profile.name}, всё для спорта ребёнка «${roleProfile.profile.childName}» — здесь`
    : `${roleProfile.profile.name}, рабочие инструменты под рукой`
  const cards = parent
    ? [
        { route: 'budget' as const, title: 'Бюджет', description: 'Скоро здесь появится простой учёт расходов на синхронное плавание.', Icon: WalletCards },
        { route: 'figures' as const, title: 'Фигуры', description: 'Каталог фигур, DD и подтверждённые связи из общего справочника.', Icon: BookOpen },
        { route: 'useful' as const, title: 'Полезное', description: 'Метроном, дыхание и другие инструменты для подготовки.', Icon: Sparkles },
      ]
    : [
        { route: 'figures' as const, title: 'Фигуры', description: 'Каталог фигур, DD и подтверждённые связи из общего справочника.', Icon: BookOpen },
        { route: 'routines' as const, title: 'Номера', description: 'Структура программ и хронометраж для работы в бассейне.', Icon: Music2 },
        { route: 'useful' as const, title: 'Полезное', description: 'Метроном, дыхание и другие инструменты для подготовки.', Icon: Sparkles },
      ]

  return <section className="mx-auto grid max-w-3xl gap-6" aria-labelledby="role-home-title">
    <header className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span><div><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[color:var(--eyebrow)]">{roleLabel(roleProfile.role)}</p><h1 id="role-home-title" className="mt-1 text-3xl font-extrabold tracking-[-0.04em]">{heading}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Все личные данные остаются на этом устройстве.</p></div></div>
    </header>
    <section className="grid gap-3" aria-label="Быстрый доступ">
      {cards.map(({ route, title, description, Icon }) => <Button key={route} type="button" variant="outline" className="h-auto min-h-0 w-full justify-start whitespace-normal rounded-[var(--radius-xl)] border bg-card p-5 text-left shadow-[var(--shadow-card)] hover:bg-card" onClick={() => onNavigate(route)}><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary"><Icon className="h-6 w-6" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-lg font-extrabold tracking-[-0.02em] text-foreground">{title}</span><span className="mt-2 block text-sm font-normal leading-6 text-muted-foreground">{description}</span></span><ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" /></Button>)}
    </section>
    <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="ghost" className="justify-self-start">Начать новый профиль</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Создать новый профиль?</AlertDialogTitle><AlertDialogDescription>Текущий локальный профиль на этом устройстве будет удалён. После этого можно выбрать другую роль.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { clearBudget(); clearRoleProfile() }}>Удалить и начать заново</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>
}
