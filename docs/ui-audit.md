# UI / UX audit and redesign notes

Audit of every screen as it was before the redesign, checked at 375px (phone) and 1280px (desktop).
Standards used: Apple HIG (touch targets, safe areas, sheets), the ui-ux-pro-max checklist
(contrast, 44px targets, no emoji icons, no horizontal scroll), taste-skill's app-screen rules
(KPIs as type not tiles, one lead figure, colour on data and actions only, sentence-case labels),
and the luxury references in awesome-design-md (restrained palette, one accent, generous space).

## What was wrong

### App-wide
| Problem | Why it hurt | Fix |
| --- | --- | --- |
| Not installable: no manifest, service worker, icons or iOS meta tags | Could not be added to a home screen; nothing worked offline | Full PWA: manifest, Workbox service worker, maskable + Apple icons, install prompt |
| Navbar overflowed at 375px: balance pill pushed off-screen, page scrolled sideways | Balance (the most important number) invisible on phones | Compact top bar on phones + bottom tab bar (Lobby / Wallet / Stats) |
| Neon green (#00e701) on navy with a glowing dot | Read as a generic crypto template, not luxury | Baize-green ground, champagne gold accent, ivory ink; no glows |
| Emoji used as UI icons (🔊 🔇 🎲 ⚠️ ←) | Render differently per OS, look cheap, not accessible | Hand-drawn SVG icon set + brand chip mark |
| One font (Segoe UI fallback), every heading the same weight | No hierarchy, no brand | Manrope for UI + numbers (tabular), Cormorant Garamond for titles/wordmark, self-hosted |
| Fixed footer disclaimer covered content on every page | Ate 40px of a phone screen permanently | Disclaimer kept on every page, as a footer at the end of the content |
| Tiny uppercase tracked labels everywhere | Hard to read, dated | Sentence-case 13px labels |
| No safe-area handling | Content under the notch / home indicator when installed | `viewport-fit=cover` + `env(safe-area-inset-*)` on bars, sheets, footer |
| Inputs at 15px | iOS zooms the page when you tap a bet field | 16px inputs; number spinners hidden |
| No focus styles | Keyboard users lost | Gold focus ring on every control |

### Dashboard (now "The Lobby")
| Problem | Fix |
| --- | --- |
| Three stat cards stacked one per row on phones (≈300px of scrolling before any game) | One divided summary: balance as the lead figure, net result + rounds side by side |
| "Set Balance / Add Funds" panel wrapped into a ragged block of 5 buttons | Moved into a Wallet sheet (top bar balance, Wallet tab, or "Add credits") |
| Game tiles: emoji on a flat card, all identical | Card art with an SVG glyph on a felt colour per family (instant / cash-out / cards), name, description, and your rounds + net result per game |
| No way to narrow 12 games | Filter chips: All, Instant, Cash out, Cards |
| No way back into the last game | "Last played" row with Play again |

### Game screens (shared frame only, game files untouched)
| Problem | Fix |
| --- | --- |
| Stage was a flat panel the same colour as the controls | Felt table: radial baize, lacquered rail, thin gold inlay |
| On phones the controls came first and the board was below the fold | Board first, controls under it |
| Bet field: input + a separate row of three buttons | ½ / 2× / Max attached to the input, balance shown beside the label |
| "Selected" options (difficulty, risk, mode) and "Cash out" used the same yellow | Selected option = gold outline; Cash out / Stand = jade (money coming back) |
| Playing cards were plain white boxes | Ivory cards with serif ranks; burgundy card back with a gold ring |
| Tiles were flat squares | Raised lacquer tiles with press feedback; jade / coral / gold states |
| "← Back to Dashboard" text button | Round back control + game glyph + serif title |

### Stats
| Problem | Fix |
| --- | --- |
| Six identical stat cards (six screens of scrolling on a phone) | One KPI block: net result leads, six figures in a 2-column grid on phones |
| Tables scrolled sideways on phones | Two-line ledger rows (game + detail on the left, result on the right) |
| `window.confirm` for Clear history | Styled confirmation sheet that says what is kept (balance) and what is lost |
| Plain line chart with default grid | Area chart in the outcome colour, faint grid, no axis chrome |
| Empty states were a bare grey sentence | Empty panels keep their frame and offer "Go to the lobby" |

## Left for later (inside game files, which were out of scope)
- **Wheel** (`src/games/Wheel.jsx` `colorFor`): hard-coded neon segment colours (#00e701, #4f9fff) clash with the new palette.
- **Keno** legend uses emoji squares (🟡 🟦 🟢) whose colours no longer match the tile states.
- **Snake** body uses 🟢 emoji instead of a drawn segment.
- Game stages still use emoji for gems, bombs, dragons and the chicken; a drawn set would match the SVG icons.
- The JS bundle is 625 kB (Recharts). Lazy-loading the Stats page would cut first load roughly in half.
