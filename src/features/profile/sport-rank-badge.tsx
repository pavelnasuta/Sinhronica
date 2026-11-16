import type { AthleteProfile } from '../../stores/athlete-profile-store'

type SportRankBadgeProps = {
  rank: AthleteProfile['sportRank']
}

function rankClassName(rank: AthleteProfile['sportRank']): string {
  if (rank === 'дельфиник') return 'border-cyan-300/60 bg-cyan-400/15 text-cyan-800 dark:border-cyan-300/35 dark:text-cyan-100'
  if (rank.includes('юношеский')) return 'border-blue-300/60 bg-blue-500/15 text-blue-800 dark:border-blue-300/35 dark:text-blue-100'
  if (['КМС', 'МС', 'МСМК'].includes(rank)) return 'border-violet-300/60 bg-violet-500/15 text-violet-800 dark:border-violet-300/35 dark:text-violet-100'
  return 'border-indigo-300/60 bg-indigo-500/15 text-indigo-800 dark:border-indigo-300/35 dark:text-indigo-100'
}

export function SportRankBadge({ rank }: SportRankBadgeProps) {
  return <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-extrabold leading-none ${rankClassName(rank)}`}>{rank}</span>
}
