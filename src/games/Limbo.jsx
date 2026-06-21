import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { HOUSE_EDGE } from '../utils/odds.js'
import { formatMultiplier, round2 } from '../utils/format.js'

const GAME = 'Limbo'
const COUNT_MS = 700

function limboResult() {
  const u = Math.random()
  if (u < 1 - HOUSE_EDGE) return 1.0
  const m = HOUSE_EDGE / (1 - u)
  return Math.max(1.0, Math.floor(m * 100) / 100)
}

export default function Limbo() {
  const { placeBet, settleRound } = useWallet()
  const { play: playSound } = useSound()
  const [bet, setBet] = useState(10)
  const [target, setTarget] = useState(2)
  const [outcome, setOutcome] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const rafRef = useRef(null)
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const t = Number(target)
  const winChance = t >= 1.01 ? (HOUSE_EDGE / t) * 100 : 0

  function play() {
    setError('')
    if (animating) return
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!(t >= 1.01)) return setError('Target multiplier must be at least 1.01×.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')

    const res = limboResult() // RNG unchanged
    const win = res >= t
    settleRound({ game: GAME, bet: amt, multiplier: t, win })

    setResult(null)
    setAnimating(true)

    const startTime = performance.now()
    const animate = (now) => {
      const p = Math.min(1, (now - startTime) / COUNT_MS)
      const eased = 1 - Math.pow(1 - p, 3)
      setOutcome(round2(1 + (res - 1) * eased))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setOutcome(res)
        setAnimating(false)
        setResult(
          win
            ? { type: 'win', multiplier: t, payout: amt * t, profit: amt * (t - 1) }
            : { type: 'loss', bet: amt }
        )
        playSound(win ? 'win' : 'fail')
      }
    }
    rafRef.current = requestAnimationFrame(animate)
  }

  const color = animating
    ? 'var(--gold)'
    : outcome == null
    ? 'var(--text)'
    : result?.type === 'win'
    ? 'var(--green)'
    : 'var(--red)'

  return (
    <GameFrame icon="🚀" title="Limbo" desc="Set a target. A random multiplier is drawn — win if it reaches your target.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={animating} />

          <div className="field">
            <label>Target Multiplier</label>
            <input
              className="input"
              type="number"
              min="1.01"
              step="0.01"
              value={target}
              disabled={animating}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          <div className="kv">
            <span className="k">Win Chance</span>
            <span className="v">{winChance.toFixed(2)}%</span>
          </div>
          <div className="kv">
            <span className="k">Payout</span>
            <span className="v gold-text">{formatMultiplier(t)}</span>
          </div>

          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={play}
            disabled={animating}
            style={{ marginTop: 12 }}
          >
            {animating ? 'Drawing…' : 'Play'}
          </button>
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center">
            <div className="muted">Result Multiplier</div>
            <div
              className={`big-multiplier ${!animating && result ? 'fx-pop-in' : ''}`}
              style={{ color }}
            >
              {outcome == null ? '—' : formatMultiplier(outcome)}
            </div>
            <div className="muted">Target: {formatMultiplier(t || 0)}</div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
