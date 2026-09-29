import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@app/App'
import { AuthProvider } from '@shared/context/AuthContext'
import { ToastProvider } from '@shared/context/ToastContext'
import { initializeSessionCache } from '@shared/lib/sessionCache'
import './index.css'

initializeSessionCache()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Não foi possível registrar o service worker do CineSorte.', error)
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>,
)
