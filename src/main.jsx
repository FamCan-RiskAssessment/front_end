import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import ToastProvider from './toaster.jsx'
import App from './App.jsx'
import { queryClient } from './api/queryClient.js'
import { setTokenProvider } from './api/client.js'
import { useAuthStore } from './stores/authStore.js'

setTokenProvider(() => useAuthStore.getState().token)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)
