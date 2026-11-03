import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Sheet from './Sheet.jsx'
import Icon from './Icon.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import { formatCredits } from '../utils/format.js'

const WalletSheetContext = createContext({ openWallet: () => {} })

const TOP_UPS = [1000, 10000, 100000]
const START_BALANCE = 1000

export function WalletSheetProvider({ children }) {
  const [open, setOpen] = useState(false)
  const openWallet = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ openWallet }), [openWallet])

  return (
    <WalletSheetContext.Provider value={value}>
      {children}
      <Sheet open={open} onClose={close} title="Wallet">
        <WalletBody />
      </Sheet>
    </WalletSheetContext.Provider>
  )
}

export function useWalletSheet() {
  return useContext(WalletSheetContext)
}

function WalletBody() {
  const { balance, setBalanceManual } = useWallet()
  const [amount, setAmount] = useState('')
  const [flash, setFlash] = useState('')

  function confirm(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 1600)
  }

  function applySet(e) {
    e.preventDefault()
    const n = Number(amount)
    if (amount !== '' && Number.isFinite(n) && n >= 0) {
      setBalanceManual(n)
      setAmount('')
      confirm(`Balance set to ${formatCredits(n)}`)
    }
  }

  return (
    <div className="wallet">
      <div className="wallet-balance">
        <div className="label">Balance</div>
        <div className="figure">{formatCredits(balance)}</div>
        <div className="note">{flash || 'Free virtual credits. No real money, ever.'}</div>
      </div>

      <div className="wallet-section">
        <div className="section-label">Add credits</div>
        <div className="seg seg-3">
          {TOP_UPS.map((n) => (
            <button
              key={n}
              className="btn"
              onClick={() => {
                setBalanceManual(balance + n)
                confirm(`Added ${n.toLocaleString()} credits`)
              }}
            >
              <Icon name="plus" size={14} strokeWidth={2} />
              {n >= 1000 ? `${n / 1000}K` : n}
            </button>
          ))}
        </div>
      </div>

      <form className="wallet-section" onSubmit={applySet}>
        <label className="section-label" htmlFor="wallet-amount">
          Set an exact balance
        </label>
        <div className="input-row">
          <input
            id="wallet-amount"
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="e.g. 25000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={amount === ''}>
            Set
          </button>
        </div>
      </form>

      <button
        className="btn btn-quiet btn-block"
        onClick={() => {
          setBalanceManual(START_BALANCE)
          confirm('Balance reset to 1,000')
        }}
      >
        <Icon name="reset" size={16} />
        Reset to {formatCredits(START_BALANCE)}
      </button>
    </div>
  )
}
