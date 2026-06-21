import { useEffect, useMemo, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { randInt } from '../utils/rng.js'
import { formatCredits, formatMultiplier } from '../utils/format.js'

const GAME = 'Wheel'
const SPIN_MS = 4200

// 20-segment wheels per risk level. 0 = no win.
const WHEELS = {
  Low: [1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.5, 1.2, 0, 1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.5, 1.2, 0],
  Medium: [0, 1.5, 0, 2, 0, 1.8, 0, 1.5, 0, 3, 0, 1.5, 0, 1.8, 0, 2, 0, 1.5, 0, 4],
  High: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.5, 3, 5, 9.9],
}

function colorFor(m) {
  if (m === 0) return '#243447'
  if (m < 2) return '#00e701'
  if (m < 5) return '#4f9fff'
  if (m < 10) return '#ffd700'
  return '#a259ff'
}

export default function Wheel() {
  const { placeBet, settleRound } = useWallet()
  const { play, engine } = useSound()
  const [bet, setBet] = useState(10)
  const [risk, setRisk] = useState('Medium')
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  useEffect(
    () => () => {
      clearTimeout(timerRef.current)
      engine.wheelStop()
    },
    [engine]
  )

  const segments = WHEELS[risk]
  const seg = 360 / segments.length

  const gradient = useMemo(() => {
    const stops = segments
      .map((m, i) => `${colorFor(m)} ${i * seg}deg ${(i + 1) * seg}deg`)
      .join(', ')
    return `conic-gradient(${stops})`
  }, [segments, seg])

  const distinct = useMemo(() => [...new Set(segments)].sort((a, b) => a - b), [segments])

  function spin() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')

    setResult(null)
    setSpinning(true)
    engine.wheelStart(SPIN_MS)

    const idx = randInt(0, segments.length - 1)
    const mult = segments[idx]
    const center = idx * seg + seg / 2
    const desiredMod = (360 - center + 360) % 360
    const currentMod = ((rotation % 360) + 360) % 360
    const delta = (desiredMod - currentMod + 360) % 360
    const newRotation = rotation + 360 * 5 + delta
    setRotation(newRotation)

    timerRef.current = setTimeout(() => {
      const win = mult > 0
      engine.wheelStop()
      play(win ? 'gem' : 'fail')
      settleRound({ game: GAME, bet: amt, multiplier: mult, win })
      setResult(
        win
          ? { type: 'win', multiplier: mult, payout: amt * mult, profit: amt * (mult - 1) }
          : { type: 'loss', bet: amt, message: 'Landed on 0× — no win this spin.' }
      )
      setSpinning(false)
    }, SPIN_MS)
  }

  return (
    <GameFrame icon="🎡" title="Wheel" desc="Choose a risk level and spin. Land on a segment to win its multiplier.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={spinning} />

          <div className="field">
            <label>Risk</label>
            <div className="chips">
              {Object.keys(WHEELS).map((rk) => (
                <button
                  key={rk}
                  className={`btn ${risk === rk ? 'btn-gold' : ''}`}
                  disabled={spinning}
                  onClick={() => setRisk(rk)}
                >
                  {rk}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Segment Multipliers</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {distinct.map((m) => (
                <span key={m} className="badge" style={{ background: 'var(--panel-2)', color: colorFor(m) }}>
                  {m}×
                </span>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={spin} disabled={spinning} style={{ marginTop: 12 }}>
            {spinning ? 'Spinning…' : 'Spin Wheel'}
          </button>
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center">
            <div style={{ position: 'relative', width: 280, height: 280 }}>
              {/* pointer */}
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderTop: '20px solid var(--gold)',
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: '50%',
                  background: gradient,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.7, 0.12, 1)` : 'none',
                  border: '6px solid var(--panel-3)',
                  boxShadow: '0 0 0 4px var(--border), inset 0 0 30px rgba(0,0,0,0.5)',
                }}
              />
              {/* hub */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--panel)',
                  border: '4px solid var(--panel-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  color: 'var(--gold)',
                  zIndex: 2,
                }}
              >
                {result && !spinning ? formatMultiplier(result.multiplier ?? 0) : '🎡'}
              </div>
            </div>
            <div className="muted">Potential: {formatCredits(Number(bet))} bet</div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
