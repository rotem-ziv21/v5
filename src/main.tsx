import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { TenantProvider } from './contexts/TenantContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <TenantProvider>
        <App />
      </TenantProvider>
    </Router>
  </React.StrictMode>,
)