import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { fairMultiplier } from '../utils/odds.js'
import { formatMultiplier } from '../utils/format.js'

const GAME = 'Dice'
const ROLL_MS = 560

export default function Dice() {
  const { placeBet, settleRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [target, setTarget] = useState(50)
  const [mode, setMode] = useState('over') // 'over' | 'under'
  const [roll, setRoll] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const flickerRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(
    () => () => {
      clearInterval(flickerRef.current)
      clearTimeout(timeoutRef.current)
    },
    []
  )

  const winChance = mode === 'over' ? 100 - target : target
  const multiplier = winChance > 0 ? fairMultiplier(winChance / 100) : 0

  function play_() {
    setError('')
    if (rolling) return
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (winChance < 2 || winChance > 98) return setError('Adjust the target — win chance must be 2–98%.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')

    play('roll')
    setResult(null)
    setRolling(true)

    const r = Math.round(Math.random() * 10000) / 100 // 0.00 – 100.00 (RNG unchanged)
    const win = mode === 'over' ? r > target : r < target

    // visual rattle — flicker random faces, then settle on the real roll
    flickerRef.current = setInterval(() => {
      setRoll(Math.round(Math.random() * 10000) / 100)
    }, 55)

    timeoutRef.current = setTimeout(() => {
      clearInterval(flickerRef.current)
      setRoll(r)
      settleRound({ game: GAME, bet: amt, multiplier, win })
      setResult(
        win
          ? { type: 'win', multiplier, payout: amt * multiplier, profit: amt * (multiplier - 1) }
          : { type: 'loss', bet: amt }
      )
      setRolling(false)
    }, ROLL_MS)
  }

  const rollColor = rolling
    ? 'var(--gold)'
    : roll == null
    ? 'var(--text)'
    : result?.type === 'win'
    ? 'var(--green)'
    : 'var(--red)'

  return (
    <GameFrame icon="🎲" title="Dice" desc="Roll 0–100. Win if the roll lands on your side of the target.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={rolling} />

          <div className="field">
            <label>Mode</label>
            <div className="chips">
              <button
                className={`btn ${mode === 'under' ? 'btn-gold' : ''}`}
                disabled={rolling}
                onClick={() => setMode('under')}
              >
                Roll Under
              </button>
              <button
                className={`btn ${mode === 'over' ? 'btn-gold' : ''}`}
                disabled={rolling}
                onClick={() => setMode('over')}
              >
                Roll Over
              </button>
            </div>
          </div>

          <div className="field">
            <label>
              Target: {target.toFixed(0)} &nbsp;·&nbsp; Win Chance {winChance.toFixed(0)}%
            </label>
            <input
              type="range"
              min="2"
              max="98"
              value={target}
              disabled={rolling}
              onChange={(e) => setTarget(Number(e.target.value))}
            />
          </div>

          <div className="kv">
            <span className="k">Multiplier</span>
            <span className="v gold-text">{formatMultiplier(multiplier)}</span>
          </div>

          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={play_}
            disabled={rolling}
            style={{ marginTop: 12 }}
          >
            {rolling ? 'Rolling…' : 'Roll Dice'}
          </button>
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center">
            <div className="muted">{mode === 'over' ? `Roll over ${target}` : `Roll under ${target}`}</div>
            <div className={`big-multiplier ${rolling ? 'fx-shake' : ''}`} style={{ color: rollColor }}>
              {roll == null ? '—' : roll.toFixed(2)}
            </div>
            {/* visual slider track */}
            <div style={{ width: '100%', maxWidth: 480, marginTop: 10 }}>
              <div
                style={{
                  position: 'relative',
                  height: 14,
                  borderRadius: 8,
                  background:
                    mode === 'over'
                      ? `linear-gradient(90deg, var(--red) ${target}%, var(--green) ${target}%)`
                      : `linear-gradient(90deg, var(--green) ${target}%, var(--red) ${target}%)`,
                }}
              >
                {roll != null && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: `${roll}%`,
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 30,
                      background: 'var(--gold)',
                      borderRadius: 2,
                      boxShadow: '0 0 8px var(--gold)',
                      transition: rolling ? 'none' : 'left 0.1s',
                    }}
                  />
                )}
              </div>
              <div className="row space-between muted" style={{ fontSize: 12, marginTop: 6 }}>
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
