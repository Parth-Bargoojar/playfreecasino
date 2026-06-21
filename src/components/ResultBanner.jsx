import { formatCredits, formatMultiplier } from '../utils/format.js'

// result: { type: 'win'|'loss'|'push', multiplier, payout, profit, message }
export default function ResultBanner({ result }) {
  if (!result) return null

  const { type } = result
  let text = result.message

  if (!text) {
    if (type === 'win') {
      text = `You won ${formatCredits(result.payout)} credits at ${formatMultiplier(result.multiplier)} (+${formatCredits(result.profit)})`
    } else if (type === 'push') {
      text = `Push — your bet of ${formatCredits(result.bet)} credits was returned`
    } else {
      text = `You lost ${formatCredits(result.bet)} credits`
    }
  }

  return <div className={`result ${type}`}>{text}</div>
}
