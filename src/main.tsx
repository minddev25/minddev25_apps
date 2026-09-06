import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Home from './Home.tsx'

const gamePath = '/minddev25_apps/minddev25_reversi'
const isGame = window.location.pathname.replace(/\/$/, '') === gamePath
document.title = isGame ? 'MindDev25 Reversi — A clever move' : 'MindDev25 Apps — Small ideas, thoughtfully made'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isGame ? <App /> : <Home />}
  </StrictMode>,
)
