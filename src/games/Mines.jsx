import { useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { minesMultiplier } from '../utils/odds.js'
import { sampleUnique } from '../utils/rng.js'
import { formatCredits, formatMultiplier } from '../utils/format.js'

const GAME = 'Mines'
const SIZE = 25

export default function Mines() {
  const { placeBet, settleRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [mines, setMines] = useState(3)
  const [inRound, setInRound] = useState(false)
  const [mineSet, setMineSet] = useState(new Set())
  const [revealed, setRevealed] = useState(new Set())
  const [busted, setBusted] = useState(false)
  const [boom, setBoom] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const revealedCount = revealed.size
  const currentMult = minesMultiplier(mines, revealedCount)
  const nextMult = minesMultiplier(mines, revealedCount + 1)

  function start() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')
    setMineSet(new Set(sampleUnique(mines, 0, SIZE - 1)))
    setRevealed(new Set())
    setBusted(false)
    setBoom(false)
    setResult(null)
    setInRound(true)
  }

  function clickTile(i) {
    if (!inRound || revealed.has(i)) return
    if (mineSet.has(i)) {
      // hit a mine — lose
      play('explosion')
      setBoom(true)
      setBusted(true)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), win: false })
      setResult({ type: 'loss', bet: Number(bet) })
      return
    }
    play('gem')
    const next = new Set(revealed)
    next.add(i)
    setRevealed(next)
    // auto-win if every safe tile is revealed
    if (next.size === SIZE - mines) {
      const mult = minesMultiplier(mines, next.size)
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), multiplier: mult, win: true })
      setResult({ type: 'win', multiplier: mult, payout: Number(bet) * mult, profit: Number(bet) * (mult - 1) })
    }
  }

  function cashOut() {
    if (!inRound || revealedCount === 0) return
    play('win')
    setInRound(false)
    setBusted(true) // reveal mines
    settleRound({ game: GAME, bet: Number(bet), multiplier: currentMult, win: true })
    setResult({
      type: 'win',
      multiplier: currentMult,
      payout: Number(bet) * currentMult,
      profit: Number(bet) * (currentMult - 1),
    })
  }

  function tileClass(i) {
    if (revealed.has(i)) return 'tile safe'
    if (busted && mineSet.has(i)) return 'tile bad'
    return 'tile'
  }

  return (
    <GameFrame icon="💣" title="Mines" desc="Reveal gems on the 5×5 grid. Avoid the mines and cash out anytime.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={inRound} />

          <div className="field">
            <label>Mines: {mines}</label>
            <input
              type="range"
              min="1"
              max="24"
              value={mines}
              disabled={inRound}
              onChange={(e) => setMines(Number(e.target.value))}
            />
          </div>

          <div className="kv">
            <span className="k">Gems Found</span>
            <span className="v">{revealedCount}</span>
          </div>
          <div className="kv">
            <span className="k">Current Multiplier</span>
            <span className="v gold-text">{formatMultiplier(currentMult)}</span>
          </div>
          {inRound && (
            <div className="kv">
              <span className="k">Next Tile</span>
              <span className="v">{formatMultiplier(nextMult)}</span>
            </div>
          )}

          {!inRound ? (
            <button className="btn btn-primary btn-block btn-lg" onClick={start} style={{ marginTop: 12 }}>
              Start Round
            </button>
          ) : (
            <button
              className="btn btn-gold btn-block btn-lg"
              onClick={cashOut}
              disabled={revealedCount === 0}
              style={{ marginTop: 12 }}
            >
              {revealedCount === 0
                ? 'Pick a tile to start'
                : `Cash Out ${formatCredits(Number(bet) * currentMult)}`}
            </button>
          )}
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div
            className={`tile-grid ${boom ? 'fx-shake' : ''}`}
            style={{ gridTemplateColumns: 'repeat(5, 1fr)', maxWidth: 420, margin: '0 auto', width: '100%' }}
          >
            {Array.from({ length: SIZE }, (_, i) => (
              <button
                key={i}
                className={tileClass(i)}
                disabled={!inRound || revealed.has(i)}
                onClick={() => clickTile(i)}
              >
                {revealed.has(i) ? '💎' : busted && mineSet.has(i) ? '💣' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
