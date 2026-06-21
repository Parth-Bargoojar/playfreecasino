import { Routes, Route, useParams, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import FooterDisclaimer from './components/FooterDisclaimer.jsx'
import DisclaimerModal from './components/DisclaimerModal.jsx'
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
  return (
    <div className="app">
      <DisclaimerModal />
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/game/:id" element={<GameRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FooterDisclaimer />
    </div>
  )
}
