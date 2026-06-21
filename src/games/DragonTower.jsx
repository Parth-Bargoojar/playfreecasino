import { useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { stepMultiplier } from '../utils/odds.js'
import { randInt } from '../utils/rng.js'
import { formatCredits, formatMultiplier } from '../utils/format.js'

const GAME = 'Dragon Tower'
const ROWS = 9

const DIFFICULTY = {
  Easy: 4, // tiles per row (1 dragon)
  Medium: 3,
  Hard: 2,
}

export default function DragonTower() {
  const { placeBet, settleRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [difficulty, setDifficulty] = useState('Easy')
  const [inRound, setInRound] = useState(false)
  const [level, setLevel] = useState(0) // completed rows
  const [picks, setPicks] = useState({}) // row -> chosen col
  const [dragons, setDragons] = useState([]) // row -> dragon col
  const [busted, setBusted] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const tiles = DIFFICULTY[difficulty]
  const survival = (tiles - 1) / tiles
  const currentMult = stepMultiplier(survival, level)
  const nextMult = stepMultiplier(survival, level + 1)

  function start() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')
    setDragons(Array.from({ length: ROWS }, () => randInt(0, tiles - 1)))
    setPicks({})
    setLevel(0)
    setBusted(false)
    setResult(null)
    setInRound(true)
  }

  function pick(row, col) {
    if (!inRound || row !== level) return
    if (dragons[row] === col) {
      play('roar')
      setPicks((p) => ({ ...p, [row]: col }))
      setBusted(true)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), win: false })
      setResult({ type: 'loss', bet: Number(bet) })
      return
    }
    play('gem')
    setPicks((p) => ({ ...p, [row]: col }))
    const newLevel = level + 1
    setLevel(newLevel)
    if (newLevel >= ROWS) {
      const mult = stepMultiplier(survival, newLevel)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), multiplier: mult, win: true })
      setResult({ type: 'win', multiplier: mult, payout: Number(bet) * mult, profit: Number(bet) * (mult - 1) })
    }
  }

  function cashOut() {
    if (!inRound || level === 0) return
    play('win')
    setInRound(false)
    setBusted(true) // reveal dragons
    settleRound({ game: GAME, bet: Number(bet), multiplier: currentMult, win: true })
    setResult({
      type: 'win',
      multiplier: currentMult,
      payout: Number(bet) * currentMult,
      profit: Number(bet) * (currentMult - 1),
    })
  }

  function cellContent(row, col) {
    const picked = picks[row]
    const isDragon = dragons[row] === col
    if (busted || row < level) {
      if (isDragon) return '🐉'
      if (picked === col) return '💎'
      return ''
    }
    return ''
  }

  function cellClass(row, col) {
    const active = inRound && row === level
    const picked = picks[row]
    const isDragon = dragons[row] === col
    if ((busted || row < level) && isDragon) return 'tile bad'
    if (picked === col && !isDragon) return 'tile safe'
    if (active) return 'tile active'
    return 'tile'
  }

  return (
    <GameFrame icon="🐉" title="Dragon Tower" desc="Climb the tower one row at a time. Pick a safe tile and dodge the dragon. Cash out anytime.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={inRound} />

          <div className="field">
            <label>Difficulty (tiles per row)</label>
            <div className="chips">
              {Object.entries(DIFFICULTY).map(([d, t]) => (
                <button
                  key={d}
                  className={`btn ${difficulty === d ? 'btn-gold' : ''}`}
                  disabled={inRound}
                  onClick={() => setDifficulty(d)}
                >
                  {d} ({t})
                </button>
              ))}
            </div>
          </div>

          <div className="kv">
            <span className="k">Level</span>
            <span className="v">{level} / {ROWS}</span>
          </div>
          <div className="kv">
            <span className="k">Current Multiplier</span>
            <span className="v gold-text">{formatMultiplier(currentMult)}</span>
          </div>

          {!inRound ? (
            <button className="btn btn-primary btn-block btn-lg" onClick={start} style={{ marginTop: 12 }}>
              Start Round
            </button>
          ) : (
            <button
              className="btn btn-gold btn-block btn-lg"
              onClick={cashOut}
              disabled={level === 0}
              style={{ marginTop: 12 }}
            >
              {level === 0 ? 'Pick a tile to start' : `Cash Out ${formatCredits(Number(bet) * currentMult)}`}
            </button>
          )}
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center" style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 360 }}>
              {Array.from({ length: ROWS }, (_, idx) => {
                const row = ROWS - 1 - idx // render top row first
                return (
                  <div key={row} className="row" style={{ gap: 6 }}>
                    <div className="muted" style={{ width: 42, fontSize: 11, textAlign: 'right' }}>
                      {formatMultiplier(stepMultiplier(survival, row + 1))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                      {Array.from({ length: tiles }, (_, col) => (
                        <button
                          key={col}
                          className={cellClass(row, col)}
                          style={{ flex: 1, height: 38, aspectRatio: 'auto', fontSize: 18 }}
                          disabled={!inRound || row !== level}
                          onClick={() => pick(row, col)}
                        >
                          {cellContent(row, col)}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
