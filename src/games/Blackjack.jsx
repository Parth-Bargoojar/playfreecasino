import { useRef, useState } from 'react'
import GameFrame from '../components/GameFrame.jsx'
import BetAmountField from '../components/BetAmountField.jsx'
import ResultBanner from '../components/ResultBanner.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { shuffle } from '../utils/rng.js'
import { formatCredits } from '../utils/format.js'

const GAME = 'Blackjack'
const SUITS = ['♠', '♥', '♦', '♣']
const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }

function makeDeck() {
  const deck = []
  for (const s of SUITS) for (let r = 2; r <= 14; r++) deck.push({ rank: r, suit: s })
  return deck
}

function rankLabel(r) {
  return RANK_LABEL[r] || String(r)
}

function handValue(cards) {
  let sum = 0
  let aces = 0
  for (const c of cards) {
    if (c.rank === 14) {
      aces++
      sum += 11
    } else if (c.rank >= 11) sum += 10
    else sum += c.rank
  }
  while (sum > 21 && aces > 0) {
    sum -= 10
    aces--
  }
  return sum
}

function Card({ card, hidden }) {
  if (hidden || !card) return <div className="playing-card back dealt" />
  const red = card.suit === '♥' || card.suit === '♦'
  return (
    <div className={`playing-card dealt ${red ? 'red' : ''}`}>
      <span className="rank">{rankLabel(card.rank)}</span>
      <span className="suit">{card.suit}</span>
    </div>
  )
}

export default function Blackjack() {
  const { placeBet, settleRound } = useWallet()
  const { play } = useSound()
  const [bet, setBet] = useState(10)
  const [player, setPlayer] = useState([])
  const [dealer, setDealer] = useState([])
  const [phase, setPhase] = useState('betting') // betting | player | done
  const [reveal, setReveal] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const deckRef = useRef([])
  const baseBetRef = useRef(0)
  const totalBetRef = useRef(0)

  function draw() {
    return deckRef.current.pop()
  }

  // play a card slide/flip sound for each of `n` cards, lightly staggered
  function cardSounds(n, gap = 120) {
    for (let i = 0; i < n; i++) setTimeout(() => play('card'), i * gap)
  }

  function finish(outcome, finalDealer) {
    const tb = totalBetRef.current
    if (outcome === 'blackjack') {
      settleRound({ game: GAME, bet: tb, multiplier: 2.5, win: true })
      setResult({ type: 'win', message: `Blackjack! Paid 3:2 — won ${formatCredits(tb * 1.5)} credits.` })
    } else if (outcome === 'win') {
      settleRound({ game: GAME, bet: tb, multiplier: 2, win: true })
      setResult({ type: 'win', message: `You win! Returned ${formatCredits(tb * 2)} credits.` })
    } else if (outcome === 'push') {
      settleRound({ game: GAME, bet: tb, push: true })
      setResult({ type: 'push', message: `Push — your ${formatCredits(tb)} credit bet was returned.` })
    } else {
      settleRound({ game: GAME, bet: tb, win: false })
      setResult({ type: 'loss', message: `Dealer wins — you lost ${formatCredits(tb)} credits.` })
    }
    if (finalDealer) setDealer(finalDealer)
    setReveal(true)
    setPhase('done')
  }

  function deal() {
    setError('')
    const amt = Number(bet)
    if (!(amt > 0)) return setError('Enter a bet amount greater than 0.')
    if (!placeBet(amt)) return setError('Not enough credits for that bet.')

    deckRef.current = shuffle(makeDeck())
    baseBetRef.current = amt
    totalBetRef.current = amt

    const p = [draw(), draw()]
    const d = [draw(), draw()]
    setPlayer(p)
    setDealer(d)
    setResult(null)
    cardSounds(4)

    const pv = handValue(p)
    const dv = handValue(d)
    if (pv === 21 || dv === 21) {
      if (pv === 21 && dv === 21) finish('push', d)
      else if (pv === 21) finish('blackjack', d)
      else finish('loss', d)
    } else {
      setReveal(false)
      setPhase('player')
    }
  }

  function dealerPlay(playerHand) {
    const d = [...dealer]
    while (handValue(d) < 17) d.push(draw())
    cardSounds(1 + (d.length - dealer.length)) // reveal hole card + any draws
    const pv = handValue(playerHand)
    const dv = handValue(d)
    let outcome
    if (dv > 21 || pv > dv) outcome = 'win'
    else if (pv < dv) outcome = 'loss'
    else outcome = 'push'
    finish(outcome, d)
  }

  function hit() {
    if (phase !== 'player') return
    const p = [...player, draw()]
    setPlayer(p)
    play('card')
    const pv = handValue(p)
    if (pv > 21) finish('loss', dealer)
    else if (pv === 21) dealerPlay(p)
  }

  function stand() {
    if (phase !== 'player') return
    dealerPlay(player)
  }

  function double() {
    if (phase !== 'player' || player.length !== 2) return
    if (!placeBet(baseBetRef.current)) return setError('Not enough credits to double.')
    totalBetRef.current += baseBetRef.current
    const p = [...player, draw()]
    setPlayer(p)
    play('card')
    if (handValue(p) > 21) finish('loss', dealer)
    else dealerPlay(p)
  }

  const pv = handValue(player)
  const dvShown = reveal ? handValue(dealer) : player.length ? handValue([dealer[0]]) : 0
  const canDouble = phase === 'player' && player.length === 2

  return (
    <GameFrame icon="🃏" title="Blackjack" desc="Single deck. Beat the dealer without going over 21. Blackjack pays 3:2.">
      <div className="game-layout">
        <div className="game-controls">
          {error && <div className="alert">{error}</div>}
          <BetAmountField value={bet} onChange={setBet} disabled={phase === 'player'} />

          {phase === 'betting' || phase === 'done' ? (
            <button className="btn btn-primary btn-block btn-lg" onClick={deal} style={{ marginTop: 12 }}>
              Deal
            </button>
          ) : (
            <>
              <div className="chips" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={hit}>
                  Hit
                </button>
                <button className="btn btn-gold" onClick={stand}>
                  Stand
                </button>
              </div>
              <button className="btn btn-block" onClick={double} disabled={!canDouble} style={{ marginTop: 8 }}>
                Double ({formatCredits(baseBetRef.current)})
              </button>
            </>
          )}
          <ResultBanner result={result} />

          <div className="divider" />
          <div className="kv">
            <span className="k">Total Bet</span>
            <span className="v">{formatCredits(phase === 'betting' ? Number(bet) : totalBetRef.current)}</span>
          </div>
        </div>

        <div className="game-stage">
          <div className="stage-center" style={{ justifyContent: 'space-between', height: '100%' }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div className="muted" style={{ marginBottom: 8 }}>
                Dealer {player.length ? `· ${dvShown}${reveal ? '' : '+'}` : ''}
              </div>
              <div className="cards-row">
                {dealer.length === 0 ? (
                  <div className="playing-card back" />
                ) : (
                  dealer.map((c, i) => <Card key={i} card={c} hidden={i === 1 && !reveal} />)
                )}
              </div>
            </div>

            <div style={{ width: '100%', textAlign: 'center' }}>
              <div className="muted" style={{ marginBottom: 8 }}>
                You {player.length ? `· ${pv}` : ''}
              </div>
              <div className="cards-row">
                {player.length === 0 ? (
                  <div className="playing-card back" />
                ) : (
                  player.map((c, i) => <Card key={i} card={c} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
