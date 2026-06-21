import { useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { stepMultiplier } from '../utils/odds.js'
import { formatCredits, formatMultiplier } from '../utils/format.js'

const GAME = 'Pump'
const MAX_PUMPS = 25

const DIFFICULTY = {
  Easy: 0.92,
  Medium: 0.8,
  Hard: 0.62,
}

export default function Pump() {
  const { placeBet, settleRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [difficulty, setDifficulty] = useState('Medium')
  const [inRound, setInRound] = useState(false)
  const [pumps, setPumps] = useState(0)
  const [popped, setPopped] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const survival = DIFFICULTY[difficulty]
  const currentMult = stepMultiplier(survival, pumps)
  const nextMult = stepMultiplier(survival, pumps + 1)

  function start() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')
    setPumps(0)
    setPopped(false)
    setResult(null)
    setInRound(true)
  }

  function pump() {
    if (!inRound) return
    if (Math.random() > survival) {
      play('pop')
      setPopped(true)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), win: false })
      setResult({ type: 'loss', bet: Number(bet) })
      return
    }
    play('gem')
    const n = pumps + 1
    setPumps(n)
    if (n >= MAX_PUMPS) {
      const mult = stepMultiplier(survival, n)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), multiplier: mult, win: true })
      setResult({ type: 'win', multiplier: mult, payout: Number(bet) * mult, profit: Number(bet) * (mult - 1) })
    }
  }

  function cashOut() {
    if (!inRound || pumps === 0) return
    play('win')
    setInRound(false)
    settleRound({ game: GAME, bet: Number(bet), multiplier: currentMult, win: true })
    setResult({
      type: 'win',
      multiplier: currentMult,
      payout: Number(bet) * currentMult,
      profit: Number(bet) * (currentMult - 1),
    })
  }

  const scale = Math.min(1 + pumps * 0.13, 3.6)

  return (
    <GameFrame icon="🎈" title="Pump" desc="Each pump inflates the balloon and the multiplier — but raises the pop risk. Cash out in time.">
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
            <span className="k">Pumps</span>
            <span className="v">{pumps}</span>
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
              <button className="btn btn-primary btn-block btn-lg" onClick={pump} style={{ marginTop: 12 }}>
                Pump 🎈 ({formatMultiplier(nextMult)})
              </button>
              <button
                className="btn btn-gold btn-block"
                onClick={cashOut}
                disabled={pumps === 0}
                style={{ marginTop: 8 }}
              >
                {pumps === 0 ? 'Pump to start' : `Cash Out ${formatCredits(Number(bet) * currentMult)}`}
              </button>
            </>
          )}
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center">
            <div
              className={popped ? 'fx-burst' : ''}
              style={{
                fontSize: 90,
                transform: popped ? 'none' : `scale(${scale})`,
                transition: popped ? 'none' : 'transform 0.18s ease-out',
                lineHeight: 1,
              }}
            >
              {popped ? '💥' : '🎈'}
            </div>
            <div className="big-multiplier gold-text" style={{ fontSize: 40 }}>
              {formatMultiplier(currentMult)}
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
