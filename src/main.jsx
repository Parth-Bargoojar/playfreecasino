import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { WalletProvider } from './context/WalletContext.jsx'
import { SoundProvider } from './context/SoundContext.jsx'
import './hooks/useInstallPrompt.js'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SoundProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </SoundProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
