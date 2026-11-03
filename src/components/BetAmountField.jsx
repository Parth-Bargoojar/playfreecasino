import { useId } from 'react'
import { useWallet } from '../context/WalletContext.jsx'
import { formatCredits, round2 } from '../utils/format.js'

// Reusable "Bet Amount" input with ½ / 2× / Max quick-adjust buttons attached to it.
export default function BetAmountField({ value, onChange, disabled, label = 'Bet Amount' }) {
  const { balance } = useWallet()
  const id = useId()

  function set(v) {
    onChange(round2(Math.max(0, v)))
  }

  return (
    <div className="field">
      <div className="field-label-row">
        <label htmlFor={id}>{label}</label>
        <span className="field-hint">Balance {formatCredits(balance)}</span>
      </div>
      <div className={`bet-input ${disabled ? 'is-disabled' : ''}`}>
        <input
          id={id}
          className="bet-input-field"
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <button type="button" disabled={disabled} onClick={() => set((Number(value) || 0) / 2)} aria-label="Halve bet">
          ½
        </button>
        <button type="button" disabled={disabled} onClick={() => set((Number(value) || 0) * 2)} aria-label="Double bet">
          2×
        </button>
        <button type="button" disabled={disabled} onClick={() => set(balance)} aria-label="Bet entire balance">
          Max
        </button>
      </div>
    </div>
  )
}
