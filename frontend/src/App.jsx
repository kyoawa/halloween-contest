import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import VotingPage from './pages/VotingPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function AppContent() {
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'

  return (
    <div className="App">
      {!isAdminPage && (
        <header className="header">
          <h1>🎃 Halloween Costume Contest</h1>
          <nav className="nav">
            <Link to="/">Vote</Link>
          </nav>
        </header>
      )}

      <Routes>
        <Route path="/" element={<VotingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
