import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@app/App'
import { AuthProvider } from '@shared/context/AuthContext'
import { ToastProvider } from '@shared/context/ToastContext'
import { initializeSessionCache } from '@shared/lib/sessionCache'
import './index.css'

initializeSessionCache()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>,
)
