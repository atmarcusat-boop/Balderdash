import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MatchStoreProvider } from './hooks/useMatchStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MatchStoreProvider>
      <App />
    </MatchStoreProvider>
  </StrictMode>,
)
