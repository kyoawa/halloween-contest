import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import VotingPage from './pages/VotingPage'
import AdminPage from './pages/AdminPage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>🎃 Halloween Costume Contest</h1>
          <nav className="nav">
            <Link to="/">Vote</Link>
            <Link to="/results">Results</Link>
            <Link to="/admin">Admin</Link>
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
