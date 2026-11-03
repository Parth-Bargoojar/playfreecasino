import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useWallet } from '../context/WalletContext.jsx'
import { GAMES } from '../games/registry.js'
import Icon from '../components/Icon.jsx'
import Sheet from '../components/Sheet.jsx'
import { formatCredits, formatTime } from '../utils/format.js'

const GAME_IDS = Object.fromEntries(GAMES.map((g) => [g.name, g.id]))

// chart colours mirror the CSS tokens in index.css
const C = {
  win: '#4FC48E',
  loss: '#EF6B61',
  grid: '#1F2B26',
  axis: '#8E8A7D',
  zero: '#3A4A42',
  panel: '#18221E',
  border: '#34443C',
  text: '#F3EEE3',
}

function signed(n) {
  return `${n >= 0 ? '+' : '−'}${formatCredits(Math.abs(n))}`
}

function tone(n) {
  return n > 0 ? 'win-text' : n < 0 ? 'loss-text' : ''
}

function EmptyState({ children }) {
  return (
    <div className="empty">
      <p>{children}</p>
      <Link to="/" className="btn btn-quiet btn-sm">
        Go to the lobby
      </Link>
    </div>
  )
}

export default function Stats() {
  const { history, netProfit, clearHistory } = useWallet()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const agg = useMemo(() => {
    let wagered = 0
    let won = 0 // total returned credits on winning/push rounds
    let lost = 0 // total bet on losing rounds
    let wins = 0
    let decided = 0 // rounds that count toward win-rate (exclude pushes)
    let best = 0 // largest single-round profit

    for (const r of history) {
      wagered += r.bet
      if (r.profit > best) best = r.profit
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
    return { wagered, won, lost, wins, decided, winRate, best }
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

  const lineColor = netProfit >= 0 ? C.win : C.loss

  return (
    <div className="page">
      <header className="page-head page-head-row">
        <div>
          <h1 className="page-title">Stats</h1>
          <p className="page-sub">Every round you have played on this device.</p>
        </div>
        {history.length > 0 && (
          <button className="btn btn-quiet btn-sm" onClick={() => setConfirmOpen(true)}>
            <Icon name="trash" size={16} />
            Clear history
          </button>
        )}
      </header>

      <section className="kpis" aria-label="Totals">
        <div className="kpi-lead">
          <div className="summary-label">Net result</div>
          <div className={`summary-figure ${tone(netProfit)}`}>
            {signed(netProfit)}
            <span className="unit">credits</span>
          </div>
          <div className="kpi-foot">
            across {history.length.toLocaleString()} {history.length === 1 ? 'round' : 'rounds'}
          </div>
        </div>
        <div className="kpi">
          <div className="summary-label">Wagered</div>
          <div className="summary-value">{formatCredits(agg.wagered)}</div>
        </div>
        <div className="kpi">
          <div className="summary-label">Returned</div>
          <div className="summary-value">{formatCredits(agg.won)}</div>
        </div>
        <div className="kpi">
          <div className="summary-label">Lost</div>
          <div className="summary-value">{formatCredits(agg.lost)}</div>
        </div>
        <div className="kpi">
          <div className="summary-label">Win rate</div>
          <div className="summary-value">
            {agg.winRate.toFixed(1)}
            <span className="unit">%</span>
          </div>
        </div>
        <div className="kpi">
          <div className="summary-label">Best round</div>
          <div className={`summary-value ${agg.best > 0 ? 'win-text' : ''}`}>
            {agg.best > 0 ? signed(agg.best) : '—'}
          </div>
        </div>
        <div className="kpi">
          <div className="summary-label">Games tried</div>
          <div className="summary-value">
            {perGame.length}
            <span className="unit">of {GAMES.length}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Running result</h2>
          {history.length > 0 && <span className="panel-meta">Cumulative, by round</span>}
        </div>
        {history.length === 0 ? (
          <EmptyState>No rounds yet. Play a game and your running result is charted here.</EmptyState>
        ) : (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="pl-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis
                  dataKey="idx"
                  stroke={C.axis}
                  tick={{ fontSize: 12, fill: C.axis }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  stroke={C.axis}
                  tick={{ fontSize: 12, fill: C.axis }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip
                  cursor={{ stroke: C.border }}
                  contentStyle={{
                    background: C.panel,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.text,
                    fontSize: 13,
                  }}
                  labelStyle={{ color: C.axis, marginBottom: 2 }}
                  formatter={(v) => [signed(v), 'Running result']}
                  labelFormatter={(l) => `Round ${l}`}
                />
                <ReferenceLine y={0} stroke={C.zero} />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke={lineColor}
                  strokeWidth={2}
                  fill="url(#pl-fill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: lineColor }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="stats-columns">
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">By game</h2>
            {perGame.length > 0 && <span className="panel-meta">Net result</span>}
          </div>
          {perGame.length === 0 ? (
            <EmptyState>Your results per game will appear here.</EmptyState>
          ) : (
            <ul className="ledger">
              {perGame.map((g) => (
                <li key={g.game} className="ledger-row">
                  <span className="ledger-glyph">
                    <Icon name={GAME_IDS[g.game]} size={18} />
                  </span>
                  <span className="ledger-main">
                    <span className="ledger-title">{g.game}</span>
                    <span className="ledger-sub">
                      {g.rounds} {g.rounds === 1 ? 'round' : 'rounds'} · {formatCredits(g.wagered)} wagered
                    </span>
                  </span>
                  <span className="ledger-end">
                    <span className={`ledger-figure ${tone(g.profit)}`}>{signed(g.profit)}</span>
                    <span className="ledger-sub">
                      {g.decided ? ((g.wins / g.decided) * 100).toFixed(1) : '0.0'}% won
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Recent rounds</h2>
            {recent.length > 0 && <span className="panel-meta">Last {recent.length}</span>}
          </div>
          {recent.length === 0 ? (
            <EmptyState>Each round you play is listed here, newest first.</EmptyState>
          ) : (
            <ul className="ledger">
              {recent.map((r) => (
                <li key={r.id} className="ledger-row">
                  <span className="ledger-glyph">
                    <Icon name={GAME_IDS[r.game]} size={18} />
                  </span>
                  <span className="ledger-main">
                    <span className="ledger-title">
                      {r.game}
                      <span className={`badge ${r.result}`}>{r.result}</span>
                    </span>
                    <span className="ledger-sub">
                      {formatTime(r.time)} · bet {formatCredits(r.bet)}
                    </span>
                  </span>
                  <span className="ledger-end">
                    <span className={`ledger-figure ${tone(r.profit)}`}>{signed(r.profit)}</span>
                    <span className="ledger-sub">{r.multiplier ? `${r.multiplier.toFixed(2)}×` : '—'}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Sheet open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Clear history?" size="sm">
        <p className="sheet-text">
          This removes all {history.length.toLocaleString()} rounds and resets your stats. Your balance
          stays as it is. This cannot be undone.
        </p>
        <div className="sheet-actions">
          <button className="btn btn-quiet" onClick={() => setConfirmOpen(false)} data-autofocus>
            Keep history
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              clearHistory()
              setConfirmOpen(false)
            }}
          >
            Clear history
          </button>
        </div>
      </Sheet>
    </div>
  )
}
