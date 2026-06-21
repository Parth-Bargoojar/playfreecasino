import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useWallet } from '../context/WalletContext.jsx'
import { GAMES } from '../games/registry.js'
import { formatCredits, formatTime } from '../utils/format.js'

const GAME_NAMES = Object.fromEntries(GAMES.map((g) => [g.name, g.icon]))

export default function Stats() {
  const { history, netProfit, clearHistory } = useWallet()

  const agg = useMemo(() => {
    let wagered = 0
    let won = 0 // total returned credits on winning/push rounds
    let lost = 0 // total bet on losing rounds
    let wins = 0
    let decided = 0 // rounds that count toward win-rate (exclude pushes)

    for (const r of history) {
      wagered += r.bet
      if (r.result === 'win') {
        won += r.payout
        wins += 1
        decided += 1
      } else if (r.result === 'loss') {
        lost += r.bet
        decided += 1
      } // push: bet returned, not counted in win-rate
    }

    const winRate = decided ? (wins / decided) * 100 : 0
    return { wagered, won, lost, wins, decided, winRate }
  }, [history])

  const chartData = useMemo(() => {
    let cum = 0
    const data = history.map((r, i) => {
      cum += r.profit
      return { idx: i + 1, profit: Math.round(cum * 100) / 100 }
    })
    return [{ idx: 0, profit: 0 }, ...data]
  }, [history])

  const perGame = useMemo(() => {
    const map = new Map()
    for (const r of history) {
      const cur = map.get(r.game) || { game: r.game, rounds: 0, wagered: 0, profit: 0, wins: 0, decided: 0 }
      cur.rounds += 1
      cur.wagered += r.bet
      cur.profit += r.profit
      if (r.result === 'win') {
        cur.wins += 1
        cur.decided += 1
      } else if (r.result === 'loss') {
        cur.decided += 1
      }
      map.set(r.game, cur)
    }
    return [...map.values()].sort((a, b) => b.rounds - a.rounds)
  }, [history])

  const recent = useMemo(() => [...history].slice(-25).reverse(), [history])

  return (
    <div className="page">
      <div className="row space-between wrap" style={{ marginBottom: 6 }}>
        <div className="page-title">Stats &amp; History</div>
        {history.length > 0 && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              if (window.confirm('Clear all session history? This cannot be undone.')) clearHistory()
            }}
          >
            Clear History
          </button>
        )}
      </div>
      <div className="page-sub">Your virtual-credit play history for this browser.</div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="k">Total Wagered</div>
          <div className="v">{formatCredits(agg.wagered)}</div>
        </div>
        <div className="stat-card">
          <div className="k">Total Returned</div>
          <div className="v win-text">{formatCredits(agg.won)}</div>
        </div>
        <div className="stat-card">
          <div className="k">Total Lost</div>
          <div className="v loss-text">{formatCredits(agg.lost)}</div>
        </div>
        <div className="stat-card">
          <div className="k">Net Profit / Loss</div>
          <div className={`v ${netProfit >= 0 ? 'win-text' : 'loss-text'}`}>
            {netProfit >= 0 ? '+' : '−'}
            {formatCredits(Math.abs(netProfit))}
          </div>
        </div>
        <div className="stat-card">
          <div className="k">Win Rate</div>
          <div className="v">{agg.winRate.toFixed(1)}%</div>
        </div>
        <div className="stat-card">
          <div className="k">Rounds Played</div>
          <div className="v">{history.length}</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Cumulative Profit / Loss</div>
        {history.length === 0 ? (
          <div className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>
            No bets yet — play a game to start building your chart.
          </div>
        ) : (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 4, left: 4 }}>
                <CartesianGrid stroke="#2c4256" strokeDasharray="3 3" />
                <XAxis dataKey="idx" stroke="#8aa0b2" tick={{ fontSize: 12 }} label={{ value: 'Round', position: 'insideBottom', offset: -2, fill: '#5d7689', fontSize: 12 }} />
                <YAxis stroke="#8aa0b2" tick={{ fontSize: 12 }} width={60} />
                <Tooltip
                  contentStyle={{ background: '#1a2c3a', border: '1px solid #2c4256', borderRadius: 8, color: '#e9f1f7' }}
                  formatter={(v) => [formatCredits(v), 'Cumulative P/L']}
                  labelFormatter={(l) => `Round ${l}`}
                />
                <ReferenceLine y={0} stroke="#5d7689" />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke={netProfit >= 0 ? '#00e701' : '#ff4d4d'}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Per-Game Breakdown</div>
        {perGame.length === 0 ? (
          <div className="muted">No data yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th className="num">Rounds</th>
                  <th className="num">Wagered</th>
                  <th className="num">Win Rate</th>
                  <th className="num">Net P/L</th>
                </tr>
              </thead>
              <tbody>
                {perGame.map((g) => (
                  <tr key={g.game}>
                    <td>
                      {GAME_NAMES[g.game] || '🎮'} {g.game}
                    </td>
                    <td className="num">{g.rounds}</td>
                    <td className="num">{formatCredits(g.wagered)}</td>
                    <td className="num">{g.decided ? ((g.wins / g.decided) * 100).toFixed(1) : '0.0'}%</td>
                    <td className={`num ${g.profit >= 0 ? 'win-text' : 'loss-text'}`}>
                      {g.profit >= 0 ? '+' : '−'}
                      {formatCredits(Math.abs(g.profit))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Recent Bets</div>
        {recent.length === 0 ? (
          <div className="muted">No bets yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Game</th>
                  <th className="num">Bet</th>
                  <th className="num">Multiplier</th>
                  <th>Result</th>
                  <th className="num">Profit</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="muted">{formatTime(r.time)}</td>
                    <td>{r.game}</td>
                    <td className="num">{formatCredits(r.bet)}</td>
                    <td className="num">{r.multiplier ? `${r.multiplier.toFixed(2)}×` : '—'}</td>
                    <td>
                      <span className={`badge ${r.result}`}>{r.result}</span>
                    </td>
                    <td className={`num ${r.profit >= 0 ? 'win-text' : 'loss-text'}`}>
                      {r.profit >= 0 ? '+' : '−'}
                      {formatCredits(Math.abs(r.profit))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
