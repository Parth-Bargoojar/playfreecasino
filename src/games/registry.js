import Dice from './Dice.jsx'
import Mines from './Mines.jsx'
import Blackjack from './Blackjack.jsx'
import Limbo from './Limbo.jsx'
import Chicken from './Chicken.jsx'
import Keno from './Keno.jsx'
import Crash from './Crash.jsx'
import DragonTower from './DragonTower.jsx'
import Hilo from './Hilo.jsx'
import Wheel from './Wheel.jsx'
import Pump from './Pump.jsx'
import Snake from './Snake.jsx'

// Single source of truth for the 12 games: dashboard tiles + routes.
export const GAMES = [
  { id: 'dice', name: 'Dice', icon: '🎲', desc: 'Roll over/under your target', component: Dice },
  { id: 'mines', name: 'Mines', icon: '💣', desc: 'Reveal gems, avoid the mines', component: Mines },
  { id: 'blackjack', name: 'Blackjack', icon: '🃏', desc: 'Beat the dealer to 21', component: Blackjack },
  { id: 'limbo', name: 'Limbo', icon: '🚀', desc: 'Beat your target multiplier', component: Limbo },
  { id: 'chicken', name: 'Chicken', icon: '🐔', desc: 'Cross the road, cash out early', component: Chicken },
  { id: 'keno', name: 'Keno', icon: '🎯', desc: 'Pick numbers, match the draw', component: Keno },
  { id: 'crash', name: 'Crash', icon: '📈', desc: 'Cash out before it crashes', component: Crash },
  { id: 'dragon-tower', name: 'Dragon Tower', icon: '🐉', desc: 'Climb, dodge the dragon', component: DragonTower },
  { id: 'hilo', name: 'Hilo', icon: '🂡', desc: 'Guess higher or lower', component: Hilo },
  { id: 'wheel', name: 'Wheel', icon: '🎡', desc: 'Spin for a multiplier', component: Wheel },
  { id: 'pump', name: 'Pump', icon: '🎈', desc: 'Pump it, cash out before it pops', component: Pump },
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Slither on, cash out early', component: Snake },
]

export function getGame(id) {
  return GAMES.find((g) => g.id === id)
}
