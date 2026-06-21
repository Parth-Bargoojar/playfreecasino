import { NavLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext.jsx'
import { useSound } from '../context/SoundContext.jsx'
import { formatCredits } from '../utils/format.js'

export default function Navbar() {
  const { balance } = useWallet()
  const { muted, toggleMute } = useSound()

  return (
    <nav className="navbar">
      <NavLink to="/" className="brand">
        <span className="dot" />
        PlayFree <span className="gold">Casino</span>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/stats">Stats</NavLink>
      </div>

      <div className="nav-spacer" />

      <button
        className="mute-btn"
        onClick={toggleMute}
        title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
        aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <div className="balance-pill" title="Virtual credits — not real money">
        <div>
          <div className="label">Credits</div>
          <div className="amount">{formatCredits(balance)}</div>
        </div>
      </div>
    </nav>
  )
}
