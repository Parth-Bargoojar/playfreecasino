import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext.jsx'
import { GAMES } from '../games/registry.js'
import { formatCredits } from '../utils/format.js'

export default function Dashboard() {
  const { balance, netProfit, history, setBalanceManual } = useWallet()
  const [amount, setAmount] = useState('')

  const rounds = history.length

  function applySet() {
    const n = Number(amount)
    if (Number.isFinite(n) && n >= 0) {
      setBalanceManual(n)
      setAmount('')
    }
  }

  function addFunds(n) {
    setBalanceManual(balance + n)
  }

  return (
    <div className="page">
      <div className="page-title">Dashboard</div>
      <div className="page-sub">
        Practice 12 casino-style mini-games with free virtual credits. Pick a game to play for fun.
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="k">Virtual Balance</div>
          <div className="v gold-text">{formatCredits(balance)}</div>
        </div>
        <div className="stat-card">
          <div className="k">Net Profit / Loss</div>
          <div className={`v ${netProfit >= 0 ? 'win-text' : 'loss-text'}`}>
            {netProfit >= 0 ? '+' : '−'}
            {formatCredits(Math.abs(netProfit))}
          </div>
        </div>
        <div className="stat-card">
          <div className="k">Rounds Played</div>
          <div className="v">{rounds}</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="row space-between wrap" style={{ gap: 14 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Set Balance / Add Funds</div>
            <div className="muted" style={{ fontSize: 13 }}>
              Free virtual credits — set any amount to keep playing. No real money involved.
            </div>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <input
              className="input"
              style={{ width: 150 }}
              type="number"
              min="0"
              placeholder="e.g. 10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySet()}
            />
            <button className="btn btn-primary" onClick={applySet} disabled={amount === ''}>
              Set Balance
            </button>
            <button className="btn" onClick={() => addFunds(1000)}>
              +1,000
            </button>
            <button className="btn" onClick={() => addFunds(10000)}>
              +10,000
            </button>
            <button className="btn btn-ghost" onClick={() => setBalanceManual(1000)}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="page-title" style={{ fontSize: 18, marginBottom: 14 }}>
        Games
      </div>
      <div className="game-grid">
        {GAMES.map((g) => (
          <Link key={g.id} to={`/game/${g.id}`} className="game-card">
            <div className="icon">{g.icon}</div>
            <div className="name">{g.name}</div>
            <div className="tag">{g.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
