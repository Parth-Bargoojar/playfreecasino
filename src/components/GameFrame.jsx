import { useNavigate } from 'react-router-dom'

// Shared shell for every game: back button, title header, then the game body.
export default function GameFrame({ icon, title, desc, children }) {
  const navigate = useNavigate()

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
        ← Back to Dashboard
      </button>

      <div className="game-head">
        <span className="icon">{icon}</span>
        <div>
          <h1>{title}</h1>
          <div className="desc">{desc}</div>
        </div>
      </div>

      {children}
    </div>
  )
}
