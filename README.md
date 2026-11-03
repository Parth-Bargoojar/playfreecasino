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

## Install it on your phone (PWA)

PlayFree is a Progressive Web App: it installs to the home screen, opens full-screen with no
browser bar, and works offline (every game, font and icon is precached by a service worker).

Browsers only allow installing from **HTTPS** (or `localhost`), so deploy the `dist/` folder to any
static host first (Netlify, Vercel, Cloudflare Pages, GitHub Pages…). Configure the host to serve
`index.html` for unknown paths so routes like `/stats` work on refresh.

- **Android (Chrome / Edge):** open the site and tap **Install** on the lobby card, or the browser
  menu → *Install app*.
- **iPhone / iPad (Safari):** tap **Share** → **Add to Home Screen**. The lobby shows these steps.
- **Desktop (Chrome / Edge):** use the **Install app** button in the top bar.

PWA files: `vite.config.js` (manifest + Workbox service worker via `vite-plugin-pwa`),
`public/logo.svg` (source mark), the generated PNG icons in `public/`
(`npm run generate-pwa-assets` rebuilds them from the logo), and `src/hooks/useInstallPrompt.js`.

## Design system

A private card-room look: baize-green ground, champagne gold for actions and figures, ivory text,
and every game stage drawn as a felt table. Tokens (colours, radii, safe-area insets) live at the
top of `src/index.css`. Type is self-hosted (works offline): **Manrope** for all UI and numbers
(tabular figures), **Cormorant Garamond** only for the wordmark and titles. Icons are hand-drawn
SVGs in `src/components/Icon.jsx`. Phones get a bottom tab bar (Lobby, Wallet, Stats) and bottom
sheets; desktop gets a top bar and centred dialogs.

## Features

- **Shared virtual wallet** — one balance across all games, persisted in `localStorage`
  (`casino_balance`). Bets can never push the balance negative.
- **Wallet** — tap the balance (or the Wallet tab on phones) to top up by 1K / 10K / 100K, set
  any exact amount, or reset to 1,000 free credits.
- **Net Profit/Loss** tracking and a **Stats** page with a Recharts cumulative P/L line chart,
  total wagered / returned / lost, win rate, a per-game breakdown table, and recent bets.
- **Full session history** of every round, persisted in `localStorage` (`casino_history`).
- **Disclaimer** sheet on first launch + a footer disclaimer on every page.
- Dark, responsive luxury theme, built mobile-first with safe-area support for notched phones.
- **Sound effects + animations** on every game, with a global mute toggle in the
  top bar that persists across reloads.

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
