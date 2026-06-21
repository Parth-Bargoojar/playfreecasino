import { useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { stepMultiplier } from '../utils/odds.js'
import { formatCredits, formatMultiplier } from '../utils/format.js'

const GAME = 'Chicken'
const LANES = 12

const DIFFICULTY = {
  Easy: 0.9,
  Medium: 0.78,
  Hard: 0.6,
}

export default function Chicken() {
  const { placeBet, settleRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [difficulty, setDifficulty] = useState('Medium')
  const [inRound, setInRound] = useState(false)
  const [pos, setPos] = useState(0) // lanes crossed
  const [crashAt, setCrashAt] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const survival = DIFFICULTY[difficulty]
  const currentMult = stepMultiplier(survival, pos)
  const nextMult = stepMultiplier(survival, pos + 1)

  function start() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')
    setPos(0)
    setCrashAt(null)
    setResult(null)
    setInRound(true)
  }

  function advance() {
    if (!inRound) return
    play('cluck')
    if (Math.random() > survival) {
      // hit by a car
      play('explosion')
      setCrashAt(pos + 1)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), win: false })
      setResult({ type: 'loss', bet: Number(bet) })
      return
    }
    const newPos = pos + 1
    setPos(newPos)
    if (newPos >= LANES) {
      const mult = stepMultiplier(survival, newPos)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), multiplier: mult, win: true })
      setResult({ type: 'win', multiplier: mult, payout: Number(bet) * mult, profit: Number(bet) * (mult - 1) })
    }
  }

  function cashOut() {
    if (!inRound || pos === 0) return
    play('gem')
    setInRound(false)
    settleRound({ game: GAME, bet: Number(bet), multiplier: currentMult, win: true })
    setResult({
      type: 'win',
      multiplier: currentMult,
      payout: Number(bet) * currentMult,
      profit: Number(bet) * (currentMult - 1),
    })
  }

  function laneClass(i) {
    // i is the lane index 1..LANES
    if (crashAt === i) return 'tile bad'
    if (i <= pos) return 'tile safe'
    if (inRound && i === pos + 1) return 'tile active'
    return 'tile'
  }

  return (
    <GameFrame icon="🐔" title="Chicken (Road)" desc="Cross the road one lane at a time. Each lane pays more — cash out before a car hits.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={inRound} />

          <div className="field">
            <label>Difficulty</label>
            <div className="chips">
              {Object.keys(DIFFICULTY).map((d) => (
                <button
                  key={d}
                  className={`btn ${difficulty === d ? 'btn-gold' : ''}`}
                  disabled={inRound}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="kv">
            <span className="k">Lanes Crossed</span>
            <span className="v">{pos} / {LANES}</span>
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
            <>
              <button className="btn btn-primary btn-block btn-lg" onClick={advance} style={{ marginTop: 12 }}>
                Advance → ({formatMultiplier(nextMult)})
              </button>
              <button
                className="btn btn-gold btn-block"
                onClick={cashOut}
                disabled={pos === 0}
                style={{ marginTop: 8 }}
              >
                {pos === 0 ? 'Advance to start' : `Cash Out ${formatCredits(Number(bet) * currentMult)}`}
              </button>
            </>
          )}
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center" style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              {Array.from({ length: LANES }, (_, idx) => {
                const i = idx + 1
                return (
                  <div
                    key={i}
                    className={laneClass(i)}
                    style={{ width: 60, height: 72, aspectRatio: 'auto', fontSize: 13, flexDirection: 'column', gap: 2 }}
                  >
                    <div style={{ fontSize: 22 }}>
                      {crashAt === i ? (
                        '💥'
                      ) : i === pos ? (
                        <span key={pos} className="fx-hop" style={{ display: 'inline-block' }}>
                          🐔
                        </span>
                      ) : i <= pos ? (
                        '✅'
                      ) : (
                        '🛣️'
                      )}
                    </div>
                    <div className="muted" style={{ fontSize: 10 }}>
                      {formatMultiplier(stepMultiplier(survival, i))}
                    </div>
                  </div>
                )
              })}
            </div>
            {pos === 0 && !inRound && !result && <div className="muted">Press Start, then Advance lane by lane.</div>}
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
