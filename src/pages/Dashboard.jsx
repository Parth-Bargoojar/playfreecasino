import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext.jsx'
import { useWalletSheet } from '../components/WalletSheet.jsx'
import InstallBanner from '../components/InstallBanner.jsx'
import Icon from '../components/Icon.jsx'
import { GAMES } from '../games/registry.js'
import { formatCredits } from '../utils/format.js'

// Lobby grouping. Each family gets its own table colour on the card art.
const FAMILY = {
  dice: 'instant',
  limbo: 'instant',
  keno: 'instant',
  crash: 'instant',
  wheel: 'instant',
  mines: 'ladder',
  chicken: 'ladder',
  'dragon-tower': 'ladder',
  pump: 'ladder',
  snake: 'ladder',
  blackjack: 'cards',
  hilo: 'cards',
}

const FILTERS = [
  { id: 'all', label: 'All games' },
  { id: 'instant', label: 'Instant' },
  { id: 'ladder', label: 'Cash out' },
  { id: 'cards', label: 'Cards' },
]

function signed(n) {
  return `${n >= 0 ? '+' : '−'}${formatCredits(Math.abs(n))}`
}

export default function Dashboard() {
  const { balance, netProfit, history } = useWallet()
  const { openWallet } = useWalletSheet()
  const [filter, setFilter] = useState('all')

  const rounds = history.length

  // per-game rounds and net result, keyed by game name (as logged in history)
  const byGame = useMemo(() => {
    const map = new Map()
    for (const r of history) {
      const cur = map.get(r.game) || { rounds: 0, profit: 0 }
      cur.rounds += 1
      cur.profit += r.profit
      map.set(r.game, cur)
    }
    return map
  }, [history])

  const lastGame = useMemo(() => {
    const last = history[history.length - 1]
    return last ? GAMES.find((g) => g.name === last.game) : null
  }, [history])

  const shown = filter === 'all' ? GAMES : GAMES.filter((g) => FAMILY[g.id] === filter)

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">The Lobby</h1>
        <p className="page-sub">Twelve games, free credits, nothing at stake.</p>
      </header>

      <InstallBanner />

      <section className="summary" aria-label="Your session">
        <div className="summary-lead">
          <div className="summary-label">Balance</div>
          <div className="summary-figure">
            {formatCredits(balance)}
            <span className="unit">credits</span>
          </div>
          <button className="btn btn-primary btn-sm summary-cta" onClick={openWallet}>
            <Icon name="plus" size={16} strokeWidth={2} />
            Add credits
          </button>
        </div>
        <div className="summary-cell">
          <div className="summary-label">Net result</div>
          <div className={`summary-value ${netProfit > 0 ? 'win-text' : netProfit < 0 ? 'loss-text' : ''}`}>
            {signed(netProfit)}
          </div>
        </div>
        <div className="summary-cell">
          <div className="summary-label">Rounds played</div>
          <div className="summary-value">{rounds.toLocaleString()}</div>
        </div>
      </section>

      {lastGame && (
        <Link to={`/game/${lastGame.id}`} className="resume">
          <span className="resume-glyph">
            <Icon name={lastGame.id} size={20} />
          </span>
          <span className="resume-text">
            <span className="resume-label">Last played</span>
            <span className="resume-name">{lastGame.name}</span>
          </span>
          <span className="resume-go">
            Play again
            <Icon name="arrowRight" size={16} />
          </span>
        </Link>
      )}

      <section className="games" aria-labelledby="games-heading">
        <div className="section-head">
          <h2 id="games-heading" className="section-title">
            Games
          </h2>
          <div className="filter-row" role="group" aria-label="Filter games">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                aria-pressed={filter === f.id}
                className={`filter-chip ${filter === f.id ? 'is-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="game-grid">
          {shown.map((g) => {
            const s = byGame.get(g.name)
            return (
              <Link key={g.id} to={`/game/${g.id}`} className={`game-card family-${FAMILY[g.id]}`}>
                <div className="game-card-art" aria-hidden="true">
                  <Icon name={g.id} size={46} strokeWidth={1.25} />
                </div>
                <div className="game-card-body">
                  <div className="name">{g.name}</div>
                  <div className="tag">{g.desc}</div>
                  {s && (
                    <div className="meta">
                      {s.rounds} {s.rounds === 1 ? 'round' : 'rounds'}
                      <span className={s.profit > 0 ? 'win-text' : s.profit < 0 ? 'loss-text' : ''}>
                        {signed(s.profit)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
