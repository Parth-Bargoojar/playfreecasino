import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt.js'
import Icon, { BrandMark } from './Icon.jsx'

const DISMISS_KEY = 'casino_install_dismissed'

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

// Lobby card that offers to install the PWA: a native prompt on Android/Chrome,
// Share → Add to Home Screen instructions on iPhone/iPad.
export default function InstallBanner() {
  const { canPrompt, ios, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(wasDismissed)

  if (dismissed || (!canPrompt && !ios)) return null

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  return (
    <section className="install-card" aria-label="Install the app">
      <BrandMark size={44} />
      <div className="install-copy">
        <div className="install-title">Put PlayFree on your home screen</div>
        {ios ? (
          <div className="install-sub">
            Tap <Icon name="share" size={15} className="inline-icon" /> Share in Safari, then{' '}
            <strong>Add to Home Screen</strong>. It opens full-screen and works offline.
          </div>
        ) : (
          <div className="install-sub">Opens full-screen like an app and works offline.</div>
        )}
      </div>
      <div className="install-actions">
        {canPrompt && (
          <button className="btn btn-primary btn-sm" onClick={install}>
            Install
          </button>
        )}
        <button className="icon-btn" onClick={dismiss} aria-label="Dismiss">
          <Icon name="close" size={16} />
        </button>
      </div>
    </section>
  )
}
