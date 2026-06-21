import { round2 } from './format.js'

// 1% house edge baked into payouts/distributions. Demo math only.
export const HOUSE_EDGE = 0.99

// Crash / Limbo style outcome: P(result >= x) = 0.99 / x.
export function crashPoint() {
  const u = Math.random()
  if (u < 1 - HOUSE_EDGE) return 1.0 // ~1% instant bust
  const m = HOUSE_EDGE / (1 - u)
  return Math.max(1.0, Math.floor(m * 100) / 100)
}

// Mines: fair multiplier after revealing `revealed` gems with `mines` bombs on a 25-tile grid.
export function minesMultiplier(mines, revealed) {
  if (revealed <= 0) return 1
  let m = 1
  for (let i = 0; i < revealed; i++) {
    m *= (25 - i) / (25 - mines - i)
  }
  return round2(HOUSE_EDGE * m)
}

// Incremental "survive each step" games (Chicken, Pump, Snake, Dragon Tower):
// fair multiplier after surviving `steps` independent steps each with `survival` probability.
export function stepMultiplier(survival, steps) {
  if (steps <= 0) return 1
  return round2(HOUSE_EDGE / Math.pow(survival, steps))
}

// Generic fair multiplier for a single event with the given win probability.
export function fairMultiplier(winProb) {
  if (winProb <= 0) return 0
  return round2(HOUSE_EDGE / winProb)
}
