import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { round2 } from '../utils/format.js'

const BALANCE_KEY = 'casino_balance'
const HISTORY_KEY = 'casino_history'
const DEFAULT_BALANCE = 1000

const WalletContext = createContext(null)

function loadBalance() {
  try {
    const raw = localStorage.getItem(BALANCE_KEY)
    if (raw === null) return DEFAULT_BALANCE
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_BALANCE
  } catch {
    return DEFAULT_BALANCE
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(loadBalance)
  const [history, setHistory] = useState(loadHistory)

  // Persist to localStorage whenever values change.
  useEffect(() => {
    try {
      localStorage.setItem(BALANCE_KEY, String(balance))
    } catch {
      /* storage unavailable */
    }
  }, [balance])

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      /* storage unavailable */
    }
  }, [history])

  // Deduct a wager. Returns true on success, false if insufficient funds.
  const placeBet = useCallback((amount) => {
    const amt = round2(amount)
    if (!(amt > 0)) return false
    if (amt > balance + 1e-9) return false
    setBalance((b) => round2(b - amt))
    return true
  }, [balance])

  // Credit winnings back to the balance.
  const credit = useCallback((amount) => {
    const amt = round2(amount)
    if (!(amt > 0)) return
    setBalance((b) => round2(b + amt))
  }, [])

  // Manually set / reset the virtual balance (Set Balance / Add Funds).
  const setBalanceManual = useCallback((value) => {
    const n = round2(value)
    if (Number.isFinite(n) && n >= 0) setBalance(n)
  }, [])

  // Record a completed round into the session history log.
  // entry: { game, bet, multiplier, payout, profit, result }
  const logRound = useCallback((entry) => {
    setHistory((h) => [
      ...h,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: Date.now(),
        game: entry.game,
        bet: round2(entry.bet),
        multiplier: round2(entry.multiplier ?? 0),
        payout: round2(entry.payout ?? 0),
        profit: round2(entry.profit ?? 0),
        result: entry.result, // 'win' | 'loss' | 'push'
      },
    ])
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  // Convenience: settle a finished round in one call.
  // win === true credits bet * multiplier; otherwise records the loss.
  const settleRound = useCallback(
    ({ game, bet, multiplier, win, push = false }) => {
      const wager = round2(bet)
      if (push) {
        credit(wager)
        logRound({ game, bet: wager, multiplier: 1, payout: wager, profit: 0, result: 'push' })
        return
      }
      if (win) {
        const payout = round2(wager * multiplier)
        credit(payout)
        logRound({ game, bet: wager, multiplier, payout, profit: round2(payout - wager), result: 'win' })
      } else {
        logRound({ game, bet: wager, multiplier: 0, payout: 0, profit: -wager, result: 'loss' })
      }
    },
    [credit, logRound]
  )

  const netProfit = useMemo(
    () => round2(history.reduce((sum, r) => sum + (Number(r.profit) || 0), 0)),
    [history]
  )

  const value = useMemo(
    () => ({
      balance,
      history,
      netProfit,
      placeBet,
      credit,
      settleRound,
      setBalanceManual,
      logRound,
      clearHistory,
    }),
    [balance, history, netProfit, placeBet, credit, settleRound, setBalanceManual, logRound, clearHistory]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
