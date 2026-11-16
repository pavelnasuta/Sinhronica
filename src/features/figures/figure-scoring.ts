export type DecimalInput = string | number
export type JudgeCount = 4 | 5 | 6

export type FigureScoringInput = {
  judgeCount: JudgeCount
  scores: Array<DecimalInput | null>
  dd: DecimalInput
  invalidFigure?: boolean
  repeatedSuccessfullyUnder13?: boolean
}

export type FigureSetScoringInput = {
  figures: FigureScoringInput[]
  penalties: DecimalInput
  official: boolean
}

type Fraction = { numerator: bigint; denominator: bigint }

type FigureScore = {
  average: Fraction | null
  weightedScore: Fraction
  calculatedFifthScore?: Fraction
  replacementScore?: Fraction
  automaticPenalty: Fraction
}

type FigureScoringSuccess = { ok: true; value: FigureScore }
type ScoringFailure = { ok: false; errors: string[] }

export type FigureScoringOutcome = FigureScoringSuccess | ScoringFailure
export type FigureSetScoringOutcome = { ok: true; value: { figures: FigureScore[]; result: Fraction; totalPenalty: Fraction } } | ScoringFailure

const ZERO: Fraction = { numerator: 0n, denominator: 1n }
const ONE: Fraction = { numerator: 1n, denominator: 1n }

function greatestCommonDivisor(first: bigint, second: bigint): bigint {
  let left = first < 0n ? -first : first
  let right = second < 0n ? -second : second
  while (right !== 0n) [left, right] = [right, left % right]
  return left || 1n
}

function fraction(numerator: bigint, denominator = 1n): Fraction {
  if (denominator === 0n) throw new Error('Нельзя делить на ноль.')
  const sign = denominator < 0n ? -1n : 1n
  const normalizedNumerator = numerator * sign
  const normalizedDenominator = denominator * sign
  const divisor = greatestCommonDivisor(normalizedNumerator, normalizedDenominator)
  return { numerator: normalizedNumerator / divisor, denominator: normalizedDenominator / divisor }
}

function add(left: Fraction, right: Fraction): Fraction {
  return fraction(left.numerator * right.denominator + right.numerator * left.denominator, left.denominator * right.denominator)
}

function multiply(left: Fraction, right: Fraction): Fraction {
  return fraction(left.numerator * right.numerator, left.denominator * right.denominator)
}

function divide(left: Fraction, right: Fraction): Fraction {
  return fraction(left.numerator * right.denominator, left.denominator * right.numerator)
}

function compare(left: Fraction, right: Fraction): number {
  const difference = left.numerator * right.denominator - right.numerator * left.denominator
  return difference === 0n ? 0 : difference < 0n ? -1 : 1
}

function parseDecimal(value: DecimalInput): Fraction | null {
  const text = String(value).trim().replace(',', '.')
  const matched = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(text)
  if (!matched) return null
  const [, sign, whole, decimal = ''] = matched
  const numerator = BigInt(`${whole}${decimal}`) * (sign === '-' ? -1n : 1n)
  return fraction(numerator, 10n ** BigInt(decimal.length))
}

function isTenths(value: Fraction): boolean {
  return (value.numerator * 10n) % value.denominator === 0n
}

function average(values: Fraction[]): Fraction {
  return divide(values.reduce(add, ZERO), fraction(BigInt(values.length)))
}

function roundHalfUp(value: Fraction, decimalPlaces: number): Fraction {
  const scale = 10n ** BigInt(decimalPlaces)
  const absoluteNumerator = value.numerator < 0n ? -value.numerator : value.numerator
  const scaledNumerator = absoluteNumerator * scale
  let rounded = scaledNumerator / value.denominator
  if ((scaledNumerator % value.denominator) * 2n >= value.denominator) rounded += 1n
  return fraction(value.numerator < 0n ? -rounded : rounded, scale)
}

export function formatScore(value: Fraction, decimalPlaces = 4): string {
  const rounded = roundHalfUp(value, decimalPlaces)
  const scale = 10n ** BigInt(decimalPlaces)
  const scaled = (rounded.numerator < 0n ? -rounded.numerator : rounded.numerator) * scale / rounded.denominator
  const raw = scaled.toString().padStart(decimalPlaces + 1, '0')
  const sign = rounded.numerator < 0n ? '-' : ''
  if (decimalPlaces === 0) return `${sign}${raw}`
  return `${sign}${raw.slice(0, -decimalPlaces)},${raw.slice(-decimalPlaces)}`
}

function error(...errors: string[]): ScoringFailure {
  return { ok: false, errors }
}

function validateJudgeCount(value: number): value is JudgeCount {
  return value === 4 || value === 5 || value === 6
}

function calculateAverage(judgeCount: JudgeCount, scores: Fraction[]): { average: Fraction; calculatedFifthScore?: Fraction } {
  const ordered = [...scores].sort(compare)
  if (judgeCount === 4) {
    const calculatedFifthScore = average(scores)
    const fiveScores = [...scores, calculatedFifthScore].sort(compare)
    return { average: average(fiveScores.slice(1, 4)), calculatedFifthScore }
  }
  if (judgeCount === 5) return { average: average(ordered.slice(1, 4)) }
  return { average: average(ordered.slice(1, 5)) }
}

export function calculateFigure(input: FigureScoringInput): FigureScoringOutcome {
  const dd = parseDecimal(input.dd)
  if (!dd || compare(dd, ZERO) <= 0) return error('DD фигуры должен быть положительным числом.')
  if (!validateJudgeCount(input.judgeCount)) return error('В бригаде должно быть 4, 5 или 6 судей.')
  if (input.invalidFigure) {
    return { ok: true, value: { average: null, weightedScore: ZERO, automaticPenalty: input.repeatedSuccessfullyUnder13 ? ONE : ZERO } }
  }
  if (input.scores.length !== input.judgeCount) return error('Количество оценок должно совпадать с числом судей.')

  const missingCount = input.scores.filter((score) => score === null).length
  if (missingCount > 1) return error('Можно заменить только одну отсутствующую оценку судьи.')
  const receivedScores: Fraction[] = []
  for (const score of input.scores) {
    if (score === null) continue
    const parsed = parseDecimal(score)
    if (!parsed || compare(parsed, ZERO) < 0 || compare(parsed, fraction(10n)) > 0 || !isTenths(parsed)) {
      return error('Оценка судьи должна быть от 0,0 до 10,0 с шагом 0,1.')
    }
    receivedScores.push(parsed)
  }
  if (receivedScores.length === 0) return error('Нужна хотя бы одна судейская оценка.')

  const replacementScore = missingCount === 1 ? roundHalfUp(average(receivedScores), 1) : undefined
  const actualScores = replacementScore ? [...receivedScores, replacementScore] : receivedScores
  const calculated = calculateAverage(input.judgeCount, actualScores)
  return {
    ok: true,
    value: {
      average: calculated.average,
      weightedScore: multiply(calculated.average, dd),
      calculatedFifthScore: calculated.calculatedFifthScore,
      replacementScore,
      automaticPenalty: input.repeatedSuccessfullyUnder13 ? ONE : ZERO,
    },
  }
}

export function calculateFigureSet(input: FigureSetScoringInput): FigureSetScoringOutcome {
  if (input.official && input.figures.length !== 2 && input.figures.length !== 4) return error('Официальный комплект содержит ровно 2 или 4 фигуры.')
  if (input.figures.length === 0) return error('Добавьте хотя бы одну фигуру.')

  const penalties = parseDecimal(input.penalties)
  if (!penalties || compare(penalties, ZERO) < 0) return error('Штраф должен быть неотрицательным числом.')

  const calculatedFigures: FigureScore[] = []
  const complexity: Fraction[] = []
  for (const figureInput of input.figures) {
    const outcome = calculateFigure(figureInput)
    if (!outcome.ok) return outcome
    const dd = parseDecimal(figureInput.dd)
    if (!dd) return error('DD фигуры должен быть числом.')
    calculatedFigures.push(outcome.value)
    complexity.push(dd)
  }

  const totalWeightedScore = calculatedFigures.reduce((sum, figure) => add(sum, figure.weightedScore), ZERO)
  const totalComplexity = complexity.reduce(add, ZERO)
  const automaticPenalty = calculatedFigures.reduce((sum, figure) => add(sum, figure.automaticPenalty), ZERO)
  const totalPenalty = add(penalties, automaticPenalty)
  const result = add(multiply(divide(totalWeightedScore, totalComplexity), fraction(10n)), fraction(-totalPenalty.numerator, totalPenalty.denominator))
  return { ok: true, value: { figures: calculatedFigures, result, totalPenalty } }
}
