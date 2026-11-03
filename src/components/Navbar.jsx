import { NavLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { useWalletSheet } from './WalletSheet.jsx'
import { useInstallPrompt } from '../hooks/useInstallPrompt.js'
import Icon, { BrandMark } from './Icon.jsx'
import { formatCredits } from '../utils/format.js'

export default function Navbar() {
  const { balance } = useWallet()
  const { muted, toggleMute } = useSound()
  const { openWallet } = useWalletSheet()
  const { canPrompt, install } = useInstallPrompt()

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/" className="brand" aria-label="PlayFree Casino — Lobby">
          <BrandMark size={30} />
          <span className="wordmark">PlayFree</span>
        </NavLink>

        <nav className="top-links" aria-label="Main">
          <NavLink to="/" end>
            Lobby
          </NavLink>
          <NavLink to="/stats">Stats</NavLink>
        </nav>

        <div className="topbar-spacer" />

        {canPrompt && (
          <button className="btn btn-quiet btn-sm install-top" onClick={install}>
            <Icon name="download" size={16} />
            Install app
          </button>
        )}

        <button
          className="icon-btn"
          onClick={toggleMute}
          title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          aria-pressed={muted}
        >
          <Icon name={muted ? 'soundOff' : 'soundOn'} size={20} />
        </button>

        <button className="balance-pill" onClick={openWallet} title="Virtual credits — not real money">
          <span className="amount">{formatCredits(balance)}</span>
          <span className="unit">credits</span>
          <span className="add" aria-hidden="true">
            <Icon name="plus" size={14} strokeWidth={2.2} />
          </span>
          <span className="sr-only">Open wallet</span>
        </button>
      </div>
    </header>
  )
}
