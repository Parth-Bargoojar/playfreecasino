import { useMemo, useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { stepMultiplier } from '../utils/odds.js'
import { formatCredits, formatMultiplier } from '../utils/format.js'

const GAME = 'Snake'
const COLS = 7
const ROWS = 6
const MAX_STEPS = COLS * ROWS - 1

const DIFFICULTY = {
  Easy: 0.9,
  Medium: 0.8,
  Hard: 0.65,
}

// Serpentine path through the grid so the snake visibly slithers.
function buildPath() {
  const path = []
  for (let r = 0; r < ROWS; r++) {
    const cols = r % 2 === 0 ? [...Array(COLS).keys()] : [...Array(COLS).keys()].reverse()
    for (const c of cols) path.push(r * COLS + c)
  }
  return path
}

export default function Snake() {
  const { placeBet, settleRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [difficulty, setDifficulty] = useState('Medium')
  const [inRound, setInRound] = useState(false)
  const [pos, setPos] = useState(0) // steps taken
  const [dead, setDead] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const path = useMemo(buildPath, [])
  const survival = DIFFICULTY[difficulty]
  const currentMult = stepMultiplier(survival, pos)
  const nextMult = stepMultiplier(survival, pos + 1)

  // cell index -> position along snake (0 = oldest tail)
  const snakeIndex = useMemo(() => {
    const map = new Map()
    for (let i = 0; i <= pos && i < path.length; i++) map.set(path[i], i)
    return map
  }, [pos, path])

  function start() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')
    setPos(0)
    setDead(false)
    setResult(null)
    setInRound(true)
  }

  function move() {
    if (!inRound) return
    play('hiss')
    if (Math.random() > survival) {
      setDead(true)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), win: false })
      setResult({ type: 'loss', bet: Number(bet) })
      return
    }
    const n = pos + 1
    setPos(n)
    if (n >= MAX_STEPS) {
      const mult = stepMultiplier(survival, n)
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

  const headCell = path[pos]

  return (
    <GameFrame icon="🐍" title="Snake" desc="The snake slithers one step at a time, each worth more. Cash out before it bites itself.">
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
            <span className="k">Steps</span>
            <span className="v">{pos}</span>
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
              <button className="btn btn-primary btn-block btn-lg" onClick={move} style={{ marginTop: 12 }}>
                Slither → ({formatMultiplier(nextMult)})
              </button>
              <button
                className="btn btn-gold btn-block"
                onClick={cashOut}
                disabled={pos === 0}
                style={{ marginTop: 8 }}
              >
                {pos === 0 ? 'Slither to start' : `Cash Out ${formatCredits(Number(bet) * currentMult)}`}
              </button>
            </>
          )}
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center">
            <div
              className="tile-grid"
              style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, maxWidth: 420, width: '100%' }}
            >
              {Array.from({ length: COLS * ROWS }, (_, cell) => {
                const onSnake = snakeIndex.has(cell)
                const isHead = cell === headCell && (inRound || (!dead && pos > 0))
                let content = ''
                let cls = 'tile'
                if (dead && cell === headCell) {
                  content = '💀'
                  cls = 'tile bad'
                } else if (isHead) {
                  content = (
                    <span key={pos} className="fx-hop" style={{ display: 'inline-block' }}>
                      🐍
                    </span>
                  )
                  cls = 'tile safe'
                } else if (onSnake) {
                  content = '🟢'
                  cls = 'tile safe'
                }
                return (
                  <div key={cell} className={cls} style={{ fontSize: 18 }}>
                    {content}
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
