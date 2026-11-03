// Hand-drawn 24×24 line icons for the app chrome and the game glyphs.
// Stroke icons inherit currentColor so they follow the surrounding text colour.

const PATHS = {
  lobby: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  stats: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M16 13.5h1.5" />
    </>
  ),
  soundOn: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
      <path d="M18.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  soundOff: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M16 9.5l5 5" />
      <path d="M21 9.5l-5 5" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="M7.5 10.5L12 15l4.5-4.5" />
      <path d="M5 19.5h14" />
    </>
  ),
  share: (
    <>
      <path d="M12 3.5v11" />
      <path d="M8 7.5l4-4 4 4" />
      <path d="M8 10.5H6.5A1.5 1.5 0 0 0 5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7a1.5 1.5 0 0 0-1.5-1.5H16" />
    </>
  ),
  reset: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4.5v4h4" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M6.5 7l1 12.5h9l1-12.5" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),

  // ----- game glyphs -----
  dice: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  mines: (
    <>
      <path d="M7 4h10l4 5.5L12 20.5 3 9.5z" />
      <path d="M3 9.5h18" />
      <path d="M9.5 4L8 9.5l4 11 4-11L14.5 4" />
    </>
  ),
  blackjack: (
    <>
      <rect x="3.5" y="5" width="11" height="15.5" rx="2" />
      <path d="M14.5 7.2l3.9 1a1.6 1.6 0 0 1 1.1 2l-2.8 10.4a1.6 1.6 0 0 1-2 1.1l-1.9-.5" />
      <path d="M9 9.2c1.6 1.7 3 2.7 3 4.1a1.5 1.5 0 0 1-3 .5 1.5 1.5 0 0 1-3-.5c0-1.4 1.4-2.4 3-4.1z" />
      <path d="M9 13.8l-.8 2.2h1.6z" />
    </>
  ),
  limbo: (
    <>
      <path d="M12 19V5" />
      <path d="M6.5 10.5L12 5l5.5 5.5" />
      <path d="M4.5 20h15" />
    </>
  ),
  chicken: (
    <>
      <path d="M12 3c3.6 0 6.5 5.4 6.5 9.8a6.5 6.5 0 0 1-13 0C5.5 8.4 8.4 3 12 3z" />
      <path d="M8.5 13.5l2 1.5 2-2 2 2 1.5-1.2" />
    </>
  ),
  keno: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="12" cy="6" r="2" fill="currentColor" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" fill="currentColor" />
      <circle cx="6" cy="18" r="2" fill="currentColor" />
      <circle cx="12" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  crash: (
    <>
      <path d="M3.5 19.5l5.5-6 3.5 3 8-10" />
      <path d="M15.5 6.5h5v5" />
    </>
  ),
  'dragon-tower': (
    <>
      <path d="M6 20.5V9l2-1.2V4h2.2v2h3.6V4H16v3.8L18 9v11.5z" />
      <path d="M10 20.5V17a2 2 0 0 1 4 0v3.5" />
      <path d="M10.5 11h3" />
    </>
  ),
  hilo: (
    <>
      <path d="M8 19.5V4.5" />
      <path d="M4 8.5l4-4 4 4" />
      <path d="M16 4.5v15" />
      <path d="M12 15.5l4 4 4-4" />
    </>
  ),
  wheel: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3.5V10M12 14v6.5M3.5 12H10M14 12h6.5M6 6l4.6 4.6M13.4 13.4L18 18M18 6l-4.6 4.6M10.6 13.4L6 18" />
    </>
  ),
  pump: (
    <>
      <path d="M12 2.8a6.2 6.2 0 0 1 6.2 6.2c0 4.2-3.6 7.6-6.2 7.6S5.8 13.2 5.8 9A6.2 6.2 0 0 1 12 2.8z" />
      <path d="M11 16.6l-.6 1.6h3.2l-.6-1.6" />
      <path d="M12 18.2c0 1.6-2 1.8-2 3.3" />
    </>
  ),
  snake: (
    <>
      <path d="M4 19.5h8.5a3.5 3.5 0 0 0 0-7h-1a3.5 3.5 0 0 1 0-7H19" />
      <circle cx="19.5" cy="5.5" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
}

export default function Icon({ name, size = 20, strokeWidth = 1.6, className, title }) {
  const content = PATHS[name]
  if (!content) return null
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {content}
    </svg>
  )
}

// The brand mark: a casino chip with a P, matching public/logo.svg.
export function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <circle cx="256" cy="256" r="236" fill="#D9B86C" />
      <circle
        cx="256"
        cy="256"
        r="205"
        fill="none"
        stroke="#F3EEE3"
        strokeWidth="42"
        strokeDasharray="64 97"
        transform="rotate(-11 256 256)"
      />
      <circle cx="256" cy="256" r="170" fill="#0E1713" />
      <rect x="189" y="160" width="38" height="196" rx="4" fill="#D9B86C" />
      <path d="M208 179h48a48 48 0 0 1 0 96h-48" fill="none" stroke="#D9B86C" strokeWidth="38" />
    </svg>
  )
}
