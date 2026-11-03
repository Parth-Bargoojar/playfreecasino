import { Link, useParams } from 'react-router-dom'
import Icon from './Icon.jsx'

// Shared shell for every game: back link, title header, then the game body.
// The glyph comes from the route id, so game files keep passing their own `icon` untouched.
export default function GameFrame({ title, desc, children }) {
  const { id } = useParams()

  return (
    <div className="page page-game">
      <div className="game-head">
        <Link to="/" className="back-link" aria-label="Back to the lobby">
          <Icon name="back" size={20} strokeWidth={2} />
        </Link>
        <span className="game-glyph" aria-hidden="true">
          <Icon name={id} size={22} />
        </span>
        <div className="game-head-text">
          <h1>{title}</h1>
          <p className="desc">{desc}</p>
        </div>
      </div>

      {children}
    </div>
  )
}
