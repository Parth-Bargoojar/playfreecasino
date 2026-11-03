import { useEffect, useState } from 'react'
import Sheet from './Sheet.jsx'
import { BrandMark } from './Icon.jsx'

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

  return (
    <Sheet open={open} dismissible={false} size="sm">
      <div className="welcome">
        <BrandMark size={64} />
        <h2 className="welcome-title">Welcome to PlayFree</h2>
        <p className="welcome-lede">
          Twelve casino-style games played with free virtual credits. Practise the mechanics with
          nothing at stake.
        </p>

        <div className="notice">
          <strong>Entertainment only.</strong> No real money is used, wagered, or won. There are no
          deposits, withdrawals, or payouts of any kind. Virtual credits have no value and cannot be
          redeemed. Not affiliated with Stake.com.
        </div>

        <p className="welcome-foot">
          You start with 1,000 credits. Top up or reset anytime from your wallet.
        </p>

        <button className="btn btn-primary btn-block btn-lg" onClick={acknowledge} data-autofocus>
          I understand, let me play
        </button>
      </div>
    </Sheet>
  )
}
