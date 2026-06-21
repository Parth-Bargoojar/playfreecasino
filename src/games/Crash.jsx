import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { crashPoint } from '../utils/odds.js'
import { formatCredits, formatMultiplier, round2 } from '../utils/format.js'

const GAME = 'Crash'
const TICK_MS = 70

export default function Crash() {
  const { placeBet, settleRound } = useWallet()
  const { play, engine } = useSound()
  const [bet, setBet] = useState(10)
  const [autoCashout, setAutoCashout] = useState('')
  const [phase, setPhase] = useState('idle') // idle | running | crashed | cashed
  const [mult, setMult] = useState(1)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const intervalRef = useRef(null)
  const multRef = useRef(1)
  const crashRef = useRef(0)
  const betRef = useRef(0)

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // clean up on unmount
  useEffect(
    () => () => {
      stop()
      engine.crashStop()
    },
    [engine]
  )

  function start() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')

    const auto = Number(autoCashout)
    betRef.current = amt
    crashRef.current = crashPoint()
    multRef.current = 1
    setMult(1)
    setResult(null)
    setPhase('running')
    engine.crashStart()

    intervalRef.current = setInterval(() => {
      const nm = round2(multRef.current * 1.006 + 0.002)
      // crash first
      if (nm >= crashRef.current) {
        multRef.current = crashRef.current
        setMult(round2(crashRef.current))
        stop()
        engine.crashExplode() // cut riser + boom
        setPhase('crashed')
        settleRound({ game: GAME, bet: betRef.current, win: false })
        setResult({ type: 'loss', bet: betRef.current })
        return
      }
      // auto cashout
      if (auto >= 1.01 && nm >= auto) {
        multRef.current = auto
        setMult(round2(auto))
        win(auto)
        return
      }
      multRef.current = nm
      setMult(nm)
      engine.crashUpdate(nm)
    }, TICK_MS)
  }

  function win(atMult) {
    stop()
    engine.crashStop()
    play('win')
    setPhase('cashed')
    settleRound({ game: GAME, bet: betRef.current, multiplier: atMult, win: true })
    setResult({
      type: 'win',
      multiplier: atMult,
      payout: betRef.current * atMult,
      profit: betRef.current * (atMult - 1),
    })
  }

  function cashOut() {
    if (phase !== 'running') return
    win(round2(multRef.current))
  }

  const color =
    phase === 'crashed' ? 'var(--red)' : phase === 'cashed' ? 'var(--green)' : 'var(--gold)'

  return (
    <GameFrame icon="📈" title="Crash" desc="The multiplier climbs from 1.00×. Cash out before it crashes — or lose your bet.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={phase === 'running'} />

          <div className="field">
            <label>Auto Cash Out (optional)</label>
            <input
              className="input"
              type="number"
              min="1.01"
              step="0.01"
              placeholder="e.g. 2.00"
              value={autoCashout}
              disabled={phase === 'running'}
              onChange={(e) => setAutoCashout(e.target.value)}
            />
          </div>

          <div className="kv">
            <span className="k">Potential Payout</span>
            <span className="v gold-text">{formatCredits(Number(bet) * mult)}</span>
          </div>

          {phase !== 'running' ? (
            <button className="btn btn-primary btn-block btn-lg" onClick={start} style={{ marginTop: 12 }}>
              Place Bet
            </button>
          ) : (
            <button className="btn btn-gold btn-block btn-lg" onClick={cashOut} style={{ marginTop: 12 }}>
              Cash Out {formatCredits(Number(betRef.current || bet) * mult)}
            </button>
          )}
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center">
            <div
              className={`big-multiplier ${phase === 'crashed' ? 'fx-crash' : ''}`}
              style={{ color, fontSize: 72, transition: 'color 0.2s' }}
            >
              {formatMultiplier(mult)}
            </div>
            <div className="muted">
              {phase === 'idle' && 'Place a bet to launch.'}
              {phase === 'running' && '🚀 Rising… cash out!'}
              {phase === 'crashed' && '💥 Crashed!'}
              {phase === 'cashed' && '✅ Cashed out in time!'}
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
