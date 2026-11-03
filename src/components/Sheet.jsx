import { useEffect, useId, useRef } from 'react'
import Icon from './Icon.jsx'

// Modal surface: a bottom sheet on phones, a centred dialog on wider screens.
export default function Sheet({ open, onClose, title, children, dismissible = true, size = 'md' }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const prevFocus = document.activeElement

    // focus the first control inside the sheet
    const t = setTimeout(() => {
      const el = panelRef.current?.querySelector('[data-autofocus], button, input, a[href]')
      el?.focus({ preventScroll: true })
    }, 30)

    function onKey(e) {
      if (e.key === 'Escape' && dismissible) onCloseRef.current?.()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      prevFocus?.focus?.({ preventScroll: true })
    }
  }, [open, dismissible])

  if (!open) return null

  return (
    <div
      className="sheet-overlay"
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={panelRef}
        className={`sheet sheet-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        <div className="sheet-grabber" aria-hidden="true" />
        {(title || dismissible) && (
          <div className="sheet-head">
            {title && (
              <h2 id={titleId} className="sheet-title">
                {title}
              </h2>
            )}
            {dismissible && (
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
