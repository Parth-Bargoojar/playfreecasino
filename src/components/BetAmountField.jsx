import { useWallet } from '../context/WalletContext.jsx'
import { round2 } from '../utils/format.js'

// Reusable "Bet Amount" input with ½ / 2× / Max quick-adjust chips.
export default function BetAmountField({ value, onChange, disabled, label = 'Bet Amount' }) {
  const { balance } = useWallet()

  function set(v) {
    onChange(round2(Math.max(0, v)))
  }

  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="input"
        type="number"
        min="0"
        step="1"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
      <div className="chips" style={{ marginTop: 8 }}>
        <button className="btn btn-sm" disabled={disabled} onClick={() => set((Number(value) || 0) / 2)}>
          ½
        </button>
        <button className="btn btn-sm" disabled={disabled} onClick={() => set((Number(value) || 0) * 2)}>
          2×
        </button>
        <button className="btn btn-sm" disabled={disabled} onClick={() => set(balance)}>
          Max
        </button>
      </div>
    </div>
  )
}
