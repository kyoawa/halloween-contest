import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import VotingPage from './pages/VotingPage'
import AdminPage from './pages/AdminPage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

function App() {
  const [showAdminTab, setShowAdminTab] = useState(() => {
    const saved = localStorage.getItem('showAdminTab')
    return saved !== null ? JSON.parse(saved) : true
  })

  const [showResultsTab, setShowResultsTab] = useState(() => {
    const saved = localStorage.getItem('showResultsTab')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('showAdminTab', JSON.stringify(showAdminTab))
  }, [showAdminTab])

  useEffect(() => {
    localStorage.setItem('showResultsTab', JSON.stringify(showResultsTab))
  }, [showResultsTab])

  // Listen for keyboard shortcut: Ctrl+Shift+T to toggle tabs
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        const newValue = !showAdminTab
        setShowAdminTab(newValue)
        setShowResultsTab(newValue)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showAdminTab])

  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>🎃 Halloween Costume Contest</h1>
          <nav className="nav">
            <Link to="/">Vote</Link>
            {showResultsTab && <Link to="/results">Results</Link>}
            {showAdminTab && <Link to="/admin">Admin</Link>}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<VotingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
