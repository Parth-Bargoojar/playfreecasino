import { NavLink, useLocation } from 'react-router-dom'
import { useWalletSheet } from './WalletSheet.jsx'
import Icon from './Icon.jsx'

// Phone-only tab bar. Hidden inside a game so the table gets the full screen.
export default function BottomNav() {
  const { pathname } = useLocation()
  const { openWallet } = useWalletSheet()
  if (pathname.startsWith('/game/')) return null

  return (
    <nav className="tabbar" aria-label="Main">
      <NavLink to="/" end className="tab">
        <Icon name="lobby" size={22} />
        <span>Lobby</span>
      </NavLink>
      <button className="tab" onClick={openWallet}>
        <Icon name="wallet" size={22} />
        <span>Wallet</span>
      </button>
      <NavLink to="/stats" className="tab">
        <Icon name="stats" size={22} />
        <span>Stats</span>
      </NavLink>
    </nav>
  )
}
