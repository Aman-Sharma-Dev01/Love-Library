import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LibraryProvider } from './Context/LibraryContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <LibraryProvider>
    <App />
    </LibraryProvider>
    </BrowserRouter>
  </StrictMode>,
)
