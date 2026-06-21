import { useEffect, useMemo, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { sampleUnique } from '../utils/rng.js'
import { formatMultiplier, round2 } from '../utils/format.js'

const GAME = 'Keno'
const POOL = 40
const DRAW = 10
const MAX_PICKS = 10
const REVEAL_MS = 150

// payout multiplier table: PAYOUTS[spots picked][hits]
const PAYOUTS = {
  1: [0, 3.96],
  2: [0, 1.9, 4.5],
  3: [0, 1, 3.1, 10.4],
  4: [0, 0.8, 1.8, 5, 22.5],
  5: [0, 0.25, 1.4, 4.1, 16.5, 36],
  6: [0, 0, 1, 3.7, 7, 16.5, 40],
  7: [0, 0, 0.47, 3, 4.5, 14, 31, 60],
  8: [0, 0, 0, 2.2, 4, 13, 22, 55, 70],
  9: [0, 0, 0, 1.55, 3, 8, 15, 44, 60, 85],
  10: [0, 0, 0, 1.4, 2.25, 4.5, 8, 17, 50, 80, 100],
}

export default function Keno() {
  const { placeBet, credit, logRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [picks, setPicks] = useState(new Set())
  const [drawArr, setDrawArr] = useState([])
  const [revealCount, setRevealCount] = useState(0)
  const [revealing, setRevealing] = useState(false)
  const [played, setPlayed] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const intervalRef = useRef(null)
  useEffect(() => () => clearInterval(intervalRef.current), [])

  const spots = picks.size

  // only the numbers revealed so far are shown as drawn / hits
  const drawnRevealed = useMemo(() => new Set(drawArr.slice(0, revealCount)), [drawArr, revealCount])
  const hitsRevealed = useMemo(
    () => [...picks].filter((n) => drawnRevealed.has(n)).length,
    [picks, drawnRevealed]
  )

  function toggle(n) {
    if (revealing) return
    if (played) reset()
    setPicks((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else if (next.size < MAX_PICKS) next.add(n)
      return next
    })
  }

  function autoPick() {
    if (revealing) return
    if (played) reset()
    setPicks(new Set(sampleUnique(MAX_PICKS, 1, POOL)))
  }

  function clearPicks() {
    if (revealing) return
    setPicks(new Set())
    reset()
  }

  function reset() {
    clearInterval(intervalRef.current)
    setDrawArr([])
    setRevealCount(0)
    setRevealing(false)
    setPlayed(false)
    setResult(null)
  }

  function play_() {
    setError('')
    if (revealing) return
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (spots < 1) return setError('Pick at least 1 number.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')

    const draw = sampleUnique(DRAW, 1, POOL) // RNG unchanged
    const drawSet = new Set(draw)
    const hitCount = [...picks].filter((n) => drawSet.has(n)).length

    // settle immediately (logic fires once); reveal + sound happen during animation
    const multiplier = PAYOUTS[spots][hitCount] ?? 0
    const payout = round2(amt * multiplier)
    if (payout > 0) credit(payout)
    const profit = round2(payout - amt)
    const type = profit > 0 ? 'win' : profit < 0 ? 'loss' : 'push'
    logRound({ game: GAME, bet: amt, multiplier, payout, profit, result: type })

    setResult(null)
    setDrawArr(draw)
    setRevealCount(0)
    setPlayed(true)
    setRevealing(true)

    let i = 0
    intervalRef.current = setInterval(() => {
      i += 1
      setRevealCount(i)
      if (i >= DRAW) {
        clearInterval(intervalRef.current)
        setRevealing(false)
        play(type === 'win' ? 'win' : 'fail')
        setResult({
          type,
          multiplier,
          payout,
          profit,
          bet: amt,
          message: `${hitCount}/${spots} hits · ${formatMultiplier(multiplier)} · ${
            profit >= 0 ? '+' : '−'
          }${Math.abs(profit).toFixed(2)} credits`,
        })
      }
    }, REVEAL_MS)
  }

  function cellClass(n) {
    const picked = picks.has(n)
    const isDrawn = drawnRevealed.has(n)
    if (picked && isDrawn) return 'tile bad'
    if (picked) return 'tile active'
    if (isDrawn) return 'tile safe'
    return 'tile'
  }

  return (
    <GameFrame icon="🎯" title="Keno" desc="Pick up to 10 numbers from 1–40. Ten are drawn — the more you match, the bigger the payout.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={revealing} />

          <div className="kv">
            <span className="k">Numbers Picked</span>
            <span className="v">{spots} / {MAX_PICKS}</span>
          </div>
          {played && (
            <div className="kv">
              <span className="k">Hits</span>
              <span className="v gold-text">{hitsRevealed}</span>
            </div>
          )}

          <div className="chips" style={{ marginTop: 4, marginBottom: 12 }}>
            <button className="btn btn-sm" onClick={autoPick} disabled={revealing}>
              Auto Pick
            </button>
            <button className="btn btn-sm" onClick={clearPicks} disabled={revealing}>
              Clear
            </button>
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={play_} disabled={spots < 1 || revealing}>
            {revealing ? 'Drawing…' : 'Play Keno'}
          </button>
          <ResultBanner result={result} />

          {spots > 0 && spots <= MAX_PICKS && (
            <div style={{ marginTop: 14 }}>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                Payouts for {spots} pick{spots > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PAYOUTS[spots].map((m, h) => (
                  <span
                    key={h}
                    className="badge"
                    style={{ background: 'var(--panel-2)', color: m >= 1 ? 'var(--gold)' : 'var(--text-dim)' }}
                  >
                    {h}✓ {m}×
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="game-stage">
          <div className="stage-center" style={{ width: '100%' }}>
            <div
              className="tile-grid"
              style={{ gridTemplateColumns: 'repeat(8, 1fr)', maxWidth: 480, width: '100%' }}
            >
              {Array.from({ length: POOL }, (_, i) => {
                const n = i + 1
                const isHit = picks.has(n) && drawnRevealed.has(n)
                return (
                  <button
                    key={n}
                    className={cellClass(n)}
                    onClick={() => toggle(n)}
                    style={{
                      fontSize: 15,
                      ...(isHit ? { background: 'rgba(255,215,0,0.25)', borderColor: 'var(--gold)', color: 'var(--gold)' } : {}),
                    }}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
            <div className="row wrap" style={{ gap: 14, marginTop: 4, fontSize: 12 }}>
              <span className="muted">🟡 hit</span>
              <span className="muted">🟦 your pick</span>
              <span className="muted">🟢 drawn</span>
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
