import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getEngine } from '../sound/SoundEngine.js'

const MUTE_KEY = 'casino_muted'
const SoundContext = createContext(null)

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(loadMuted)
  const engine = getEngine()

  // Keep the audio engine + persisted preference in sync with React state.
  useEffect(() => {
    engine.setMuted(muted)
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    } catch {
      /* storage unavailable */
    }
  }, [muted, engine])

  const toggleMute = useCallback(() => setMuted((m) => !m), [])
  const play = useCallback((name) => engine.play(name), [engine])

  const value = useMemo(
    () => ({ muted, toggleMute, play, engine }),
    [muted, toggleMute, play, engine]
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within a SoundProvider')
  return ctx
}
