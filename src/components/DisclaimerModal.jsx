import { useEffect, useState } from 'react'

const ACK_KEY = 'casino_disclaimer_ack'

export default function DisclaimerModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(ACK_KEY)) setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [])

  function acknowledge() {
    try {
      localStorage.setItem(ACK_KEY, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>🎲 Welcome to PlayFree Casino</h2>
        <p>
          A free, <strong>non-monetary</strong> arcade of casino-style mini-games. Play with
          virtual credits just for fun — practice the mechanics with zero risk.
        </p>
        <div className="warn-box">
          ⚠️ This is a demo for entertainment only. No real money is used, wagered, or won. There
          are no deposits, withdrawals, or payouts of any kind. Virtual credits have no value and
          cannot be redeemed. Not affiliated with Stake.com.
        </div>
        <p className="muted">
          You start with 1,000 free virtual credits. Reset or top up anytime from the dashboard.
        </p>
        <button className="btn btn-primary btn-block btn-lg" onClick={acknowledge}>
          I understand — let me play for fun
        </button>
      </div>
    </div>
  )
}
