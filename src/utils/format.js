// Display helpers for virtual credits (no real currency).

export function formatCredits(n) {
  const num = Number(n) || 0
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatMultiplier(m) {
  const num = Number(m) || 0
  return `${num.toFixed(2)}×`
}

export function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100
}
