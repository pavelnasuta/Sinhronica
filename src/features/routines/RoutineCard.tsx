import { ChevronRight, Users } from 'lucide-react'

import { ROUTINE_DISCIPLINE_LABELS, ROUTINE_PROGRAM_TYPE_LABELS, type Routine } from './routine-types'

export function RoutineCard({ routine, onOpen }: { routine: Routine; onOpen: () => void }) {
  return <button type="button" className="w-full rounded-[var(--radius-xl)] border bg-card p-5 text-left shadow-[var(--shadow-card)] transition-colors hover:bg-muted/40" onClick={onOpen}><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary"><Users className="h-5 w-5" aria-hidden="true" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className="text-lg font-extrabold tracking-[-0.02em]">{routine.title}</h2><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" /></div><p className="mt-1 text-sm text-muted-foreground">{ROUTINE_DISCIPLINE_LABELS[routine.discipline]} · {ROUTINE_PROGRAM_TYPE_LABELS[routine.programType]}</p><p className="mt-2 text-sm text-muted-foreground">{routine.ageGroup} · {routine.activeAthleteCount} участниц · {routine.blocks.length} блоков</p></div></div></button>
}
