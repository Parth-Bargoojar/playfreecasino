import { useEffect } from 'react'
import { Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import BottomNav from './components/BottomNav.jsx'
import FooterDisclaimer from './components/FooterDisclaimer.jsx'
import DisclaimerModal from './components/DisclaimerModal.jsx'
import { WalletSheetProvider } from './components/WalletSheet.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Stats from './pages/Stats.jsx'
import { getGame } from './games/registry.js'

function GameRoute() {
  const { id } = useParams()
  const game = getGame(id)
  if (!game) return <Navigate to="/" replace />
  const Game = game.component
  return <Game />
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <WalletSheetProvider>
      <div className="app">
        <DisclaimerModal />
        <Navbar />
        <main key={pathname} className="route">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/game/:id" element={<GameRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FooterDisclaimer />
        </main>
        <BottomNav />
      </div>
    </WalletSheetProvider>
  )
}
