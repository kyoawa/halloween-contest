import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import VotingPage from './pages/VotingPage'
import AdminPage from './pages/AdminPage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

function AppContent() {
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'
  const isResultsPage = location.pathname === '/results'

  return (
    <div className="App">
      {!isAdminPage && !isResultsPage && (
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
        <Route path="/results" element={<ResultsPage />} />
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
