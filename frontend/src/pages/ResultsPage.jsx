import React, { useState, useEffect } from 'react'
import './ResultsPage.css'

function ResultsPage() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchResults, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results')
      const data = await response.json()
      setWinners(data)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPodiumPosition = (index) => {
    const positions = ['first', 'second', 'third']
    return positions[index] || ''
  }

  const getMedal = (index) => {
    const medals = ['🥇', '🥈', '🥉']
    return medals[index] || ''
  }

  if (loading) {
    return (
      <div className="results-page">
        <div className="loading">Loading results...</div>
      </div>
    )
  }

  if (winners.length === 0) {
    return (
      <div className="results-page">
        <div className="no-results">
          <h2>No votes yet!</h2>
          <p>Be the first to vote and see the results here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="results-page">
      <div className="results-container">
        <h1 className="results-title">🎃 Top 3 Winners 🎃</h1>

        <div className="podium">
          {winners.map((winner, index) => (
            <div key={winner.id} className={`podium-place ${getPodiumPosition(index)}`}>
              <div className="medal">{getMedal(index)}</div>
              <div className="winner-card">
                <img src={winner.image_path} alt={winner.name} />
                <div className="winner-info">
                  <h2>{winner.name}</h2>
                  <div className="vote-count">
                    <span className="votes">{winner.votes}</span>
                    <span className="votes-label">votes</span>
                  </div>
                </div>
              </div>
              <div className="rank-number">{index + 1}</div>
            </div>
          ))}
        </div>

        <button onClick={fetchResults} className="refresh-btn">
          Refresh Results
        </button>
      </div>
    </div>
  )
}

export default ResultsPage
