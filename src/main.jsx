import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './accesibilidad.css'
import { iniciarAccesibilidad } from './saber/lib/accesibilidad.js'

// Las preferencias de accesibilidad se aplican antes de pintar para que no haya parpadeo.
iniciarAccesibilidad()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
