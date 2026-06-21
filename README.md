# 🎲 PlayFree Casino — Free, Non-Monetary Demo

A single-page React app that recreates the **mechanics** of a casino "Originals" game suite
using only a **virtual, non-redeemable balance**. It is built purely for entertainment and
practice.

> ⚠️ **This is a free, non-monetary demo for entertainment purposes only. No real money is used,
> wagered, or won. There are no deposits, withdrawals, crypto, or payments of any kind. Virtual
> credits have no value and cannot be redeemed. Not affiliated with Stake.com.**

## Run locally

```bash
npm install
npm run dev      # starts Vite dev server (opens http://localhost:5173)
```

Other scripts:

```bash
npm run build    # production build into /dist
npm run preview  # serve the production build locally
```

Requires Node 18+ (developed on Node 24).

## Features

- **Shared virtual wallet** — one balance across all games, persisted in `localStorage`
  (`casino_balance`). Bets can never push the balance negative.
- **Set Balance / Add Funds** — manually set any amount, top up by +1,000 / +10,000, or reset
  to 1,000 free credits from the dashboard.
- **Net Profit/Loss** tracking and a **Stats** page with a Recharts cumulative P/L line chart,
  total wagered / returned / lost, win rate, a per-game breakdown table, and recent bets.
- **Full session history** of every round, persisted in `localStorage` (`casino_history`).
- **Disclaimer** modal on first launch + a fixed footer banner on every page.
- Dark, responsive casino theme (mobile + desktop).
- **Sound effects + animations** on every game, with a global mute toggle (🔊/🔇) in the
  navbar that persists across reloads.

## Sound & animation layer

All audio is **synthesized at runtime with the Web Audio API** — no external/asset files are
needed. Everything routes through one master gain node, so the mute toggle is instant and also
silences in-progress continuous sounds (the Crash riser, the Wheel whir).

- `src/sound/SoundEngine.js` — a single shared engine: one-shot effects (`gem`, `win`, `fail`,
  `explosion`, `card`, `cluck`, `pop`, `hiss`, `roar`, `roll`) plus managed continuous sounds
  (`crashStart/Update/Stop/Explode`, `wheelStart/Stop`). Rapid re-triggers are debounced.
- `src/context/SoundContext.jsx` — React state for the mute flag (persisted under
  `casino_muted`) wired to the engine; exposes `play(name)`, `muted`, `toggleMute`, `engine`.
- Animations are CSS keyframes / class toggles in `src/index.css` (`fx-shake`, `fx-gem-pop`,
  `fx-bomb`, `fx-crash`, `fx-card-deal`, `fx-card-flip`, `fx-burst`, `fx-hop`, `fx-pop-in`),
  and respect `prefers-reduced-motion`.

Win/loss cues fire once per round (triggered inside event handlers / settle callbacks, never in
render), and game logic, RNG, and payouts are unchanged from the base app.

## The 12 games

| Game | Mechanic |
|------|----------|
| 🎲 Dice | Roll 0–100, pick over/under a target via slider; multiplier auto-calculated. |
| 💣 Mines | 5×5 grid, choose mine count, reveal gems, cash out anytime. |
| 🃏 Blackjack | Single deck vs dealer; hit / stand / double; blackjack pays 3:2. |
| 🚀 Limbo | Set a target multiplier; win if the random draw reaches it. |
| 🐔 Chicken | Cross lanes for rising multipliers; cash out before a crash. |
| 🎯 Keno | Pick up to 10 of 40 numbers; payout scales with matches. |
| 📈 Crash | Multiplier rises from 1.00×; cash out (or auto-cash) before the crash. |
| 🐉 Dragon Tower | Climb 9 rows, dodge the dragon each row; cash out anytime. |
| 🂡 Hilo | Guess higher/lower; stack a running multiplier; cash out anytime. |
| 🎡 Wheel | Choose risk (low/med/high) and spin for a multiplier segment. |
| 🎈 Pump | Inflate a balloon for rising multipliers; cash out before it pops. |
| 🐍 Snake | Slither step by step for rising multipliers; cash out before a bite. |

All outcomes use `Math.random()` (no provably-fair seed system) with a simple ~1% house edge
baked into the payout math (`src/utils/odds.js`).

## Project structure

```
src/
  main.jsx                 # entry + providers (Router, Wallet)
  App.jsx                  # routes: /, /stats, /game/:id
  index.css                # global dark theme
  context/WalletContext.jsx# shared balance + history + persistence
  components/              # Navbar, GameFrame, BetAmountField, ResultBanner, disclaimers
  pages/                   # Dashboard, Stats
  games/                   # the 12 games + registry.js (single source of truth)
  utils/                   # rng, odds, formatting helpers
```

To add or change the dashboard tiles/routes, edit `src/games/registry.js`.
