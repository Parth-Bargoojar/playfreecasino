import { useEffect, useState } from 'react'

// Captures the browser's install prompt as early as possible (this module is imported by main.jsx,
// before React mounts) so the "Install app" button can trigger it later.
let deferred = null
const listeners = new Set()
const notify = () => listeners.forEach((fn) => fn())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
  })
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function isIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

// canPrompt: Chrome/Edge/Android can show the native install dialog.
// ios: Safari has no prompt; the user adds it via Share → Add to Home Screen.
export function useInstallPrompt() {
  const [, force] = useState(0)

  useEffect(() => {
    const fn = () => force((n) => n + 1)
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])

  async function install() {
    if (!deferred) return false
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    notify()
    return outcome === 'accepted'
  }

  const installed = isStandalone()
  return {
    installed,
    canPrompt: !installed && !!deferred,
    ios: !installed && isIOS(),
    install,
  }
}
