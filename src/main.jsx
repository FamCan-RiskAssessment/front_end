import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ToastProvider from './toaster.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
    <App />
    </ToastProvider>
  </StrictMode>,
)
