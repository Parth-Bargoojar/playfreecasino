import { useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { fairMultiplier } from '../utils/odds.js'
import { randInt, pick } from '../utils/rng.js'
import { formatCredits, formatMultiplier, round2 } from '../utils/format.js'

const GAME = 'Hilo'
const SUITS = ['♠', '♥', '♦', '♣']
const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }

function rankLabel(r) {
  return RANK_LABEL[r] || String(r)
}

function drawCard() {
  return { rank: randInt(2, 14), suit: pick(SUITS) }
}

function Card({ card }) {
  if (!card) return <div className="playing-card back" />
  const red = card.suit === '♥' || card.suit === '♦'
  return (
    <div className={`playing-card ${red ? 'red' : ''}`}>
      <span className="rank">{rankLabel(card.rank)}</span>
      <span className="suit">{card.suit}</span>
    </div>
  )
}

export default function Hilo() {
  const { placeBet, settleRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [inRound, setInRound] = useState(false)
  const [card, setCard] = useState(null)
  const [prevCard, setPrevCard] = useState(null)
  const [running, setRunning] = useState(1)
  const [streak, setStreak] = useState(0)
  const [flipKey, setFlipKey] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // probabilities (13 ranks, "or same" counts for both sides — Stake convention)
  const r = card?.rank ?? 0
  const pHigher = card ? (15 - r) / 13 : 0
  const pLower = card ? (r - 1) / 13 : 0
  const multHigher = card ? round2(running * fairMultiplier(pHigher)) : 0
  const multLower = card ? round2(running * fairMultiplier(pLower)) : 0

  function start() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')
    setCard(drawCard())
    setPrevCard(null)
    setRunning(1)
    setStreak(0)
    setFlipKey((k) => k + 1)
    setResult(null)
    setInRound(true)
    play('card')
  }

  function guess(dir) {
    if (!inRound || !card) return
    const next = drawCard()
    const correct = dir === 'higher' ? next.rank >= card.rank : next.rank <= card.rank
    setPrevCard(card)
    setCard(next)
    setFlipKey((k) => k + 1)
    play('card')
    if (!correct) {
      setInRound(false)
      settleRound({ game: GAME, bet: Number(bet), win: false })
      setResult({ type: 'loss', bet: Number(bet) })
      return
    }
    const prob = dir === 'higher' ? pHigher : pLower
    const newRunning = round2(running * fairMultiplier(prob))
    setRunning(newRunning)
    setStreak((s) => s + 1)
  }

  function cashOut() {
    if (!inRound || streak === 0) return
    play('win')
    setInRound(false)
    settleRound({ game: GAME, bet: Number(bet), multiplier: running, win: true })
    setResult({
      type: 'win',
      multiplier: running,
      payout: Number(bet) * running,
      profit: Number(bet) * (running - 1),
    })
  }

  return (
    <GameFrame icon="🂡" title="Hilo" desc="Will the next card be higher or lower (ties count for both)? Stack correct guesses, then cash out.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={inRound} />

          <div className="kv">
            <span className="k">Streak</span>
            <span className="v">{streak}</span>
          </div>
          <div className="kv">
            <span className="k">Running Multiplier</span>
            <span className="v gold-text">{formatMultiplier(running)}</span>
          </div>

          {!inRound ? (
            <button className="btn btn-primary btn-block btn-lg" onClick={start} style={{ marginTop: 12 }}>
              Start Round
            </button>
          ) : (
            <>
              <div className="chips" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={() => guess('higher')}>
                  ▲ Higher
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{formatMultiplier(multHigher)}</div>
                </button>
                <button className="btn btn-primary" onClick={() => guess('lower')}>
                  ▼ Lower
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{formatMultiplier(multLower)}</div>
                </button>
              </div>
              <button
                className="btn btn-gold btn-block"
                onClick={cashOut}
                disabled={streak === 0}
                style={{ marginTop: 8 }}
              >
                {streak === 0 ? 'Guess to start' : `Cash Out ${formatCredits(Number(bet) * running)}`}
              </button>
            </>
          )}
          <ResultBanner result={result} />
        </div>

        <div className="game-stage">
          <div className="stage-center">
            <div className="cards-row" style={{ alignItems: 'center' }}>
              {prevCard && (
                <div style={{ textAlign: 'center', opacity: 0.7 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Previous</div>
                  <Card card={prevCard} />
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
                  {inRound || !card ? 'Current Card' : 'Final Card'}
                </div>
                <div key={flipKey} className="fx-flip">
                  <Card card={card} />
                </div>
              </div>
            </div>
            {!card && <div className="muted">Press Start to deal the first card.</div>}
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
