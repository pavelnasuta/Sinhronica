export const DISCIPLINES = ['figures', 'combo', 'team', 'acrobatics', 'duet', 'solo', 'mixed-duet', 'custom'] as const
export type AchievementDiscipline = (typeof DISCIPLINES)[number]

export const DISCIPLINE_LABELS: Record<AchievementDiscipline, string> = {
  figures: 'Нормативы фигур',
  combo: 'Комби',
  team: 'Группа',
  acrobatics: 'Акробатика',
  duet: 'Дуэт',
  solo: 'Соло',
  'mixed-duet': 'Микст-дуэт',
  custom: 'Своя дисциплина',
}

export const MEDALS = ['gold', 'silver', 'bronze', 'participation', 'none'] as const
export type AchievementMedal = (typeof MEDALS)[number]

export const MEDAL_LABELS: Record<AchievementMedal, string> = {
  gold: '1 место',
  silver: '2 место',
  bronze: '3 место',
  participation: 'Участие',
  none: 'Без медали',
}

export type AchievementChildId = 'child-1' | 'child-2'

export type AchievementDraft = {
  performedOn: string
  eventName: string
  discipline: AchievementDiscipline
  customDiscipline?: string
  score: number
  medal: AchievementMedal
  childId?: AchievementChildId
}

export type Achievement = AchievementDraft & {
  id: string
  createdAt: string
  updatedAt: string
}

export type ScoreChange = {
  direction: 'up' | 'down' | 'same'
  difference: number
}
