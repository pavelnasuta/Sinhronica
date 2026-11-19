export const SPORT_RANKS = [
  'дельфиник',
  'III юношеский разряд',
  'II юношеский разряд',
  'I юношеский разряд',
  'III спортивный разряд',
  'II спортивный разряд',
  'I спортивный разряд',
  'КМС',
  'МС',
  'МСМК',
] as const

export type SportRank = (typeof SPORT_RANKS)[number]

export function highestSportRank(ranks: Array<SportRank | undefined>): SportRank | undefined {
  return ranks.reduce<SportRank | undefined>((highest, rank) => !rank || (highest && SPORT_RANKS.indexOf(highest) >= SPORT_RANKS.indexOf(rank)) ? highest : rank, undefined)
}