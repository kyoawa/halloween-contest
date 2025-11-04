import React, { useState, useEffect, useMemo } from 'react'
import TinderCard from 'react-tinder-card'
import './VotingPage.css'

function VotingPage() {
  const [contestants, setContestants] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastDirection, setLastDirection] = useState()
  const [loading, setLoading] = useState(true)
  const [votingComplete, setVotingComplete] = useState(false)

  // Generate or retrieve session ID
  const sessionId = useMemo(() => {
    let session = localStorage.getItem('voter_session')
    if (!session) {
      session = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('voter_session', session)
    }
    return session
  }, [])

  useEffect(() => {
    fetchContestants()
  }, [])

  const fetchContestants = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contestants/vote?session=${sessionId}`)
      const data = await response.json()
      setContestants(data)
      setCurrentIndex(data.length - 1)
      setVotingComplete(data.length === 0)
    } catch (error) {
      console.error('Error fetching contestants:', error)
    } finally {
      setLoading(false)
    }
  }

  const swiped = async (direction, contestant) => {
    setLastDirection(direction)
    setCurrentIndex(currentIndex - 1)

    if (direction === 'right') {
      try {
        await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contestant_id: contestant.id,
            session: sessionId
          })
        })
      } catch (error) {
        console.error('Error voting:', error)
      }
    }

    if (currentIndex === 0) {
      setVotingComplete(true)
    }
  }

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!')
  }

  if (loading) {
    return (
      <div className="voting-page">
        <div className="loading">Loading contestants...</div>
      </div>
    )
  }

  if (votingComplete) {
    return (
      <div className="voting-page">
        <div className="complete-message">
          <h2>Thanks for voting!</h2>
          <p>You've seen all the costumes. Check out the results page to see who's winning!</p>
          <button onClick={fetchContestants} className="refresh-btn">
            Refresh to see new contestants
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="voting-page">
      <div className="instructions">
        <p>👈 Swipe left to skip • Swipe right to vote 👉</p>
        <p className="counter">{currentIndex + 1} / {contestants.length} remaining</p>
      </div>

      <div className="card-container">
        {contestants.map((contestant, index) => (
          <TinderCard
            key={contestant.id}
            onSwipe={(dir) => swiped(dir, contestant)}
            onCardLeftScreen={() => outOfFrame(contestant.name)}
            preventSwipe={['up', 'down']}
            className="swipe"
          >
            <div
              className="card"
              style={{ backgroundImage: `url(${contestant.image_path})` }}
            >
              <div className="card-content">
                <h3>{contestant.name}</h3>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>

      <div className="buttons">
        <button
          className="btn skip"
          onClick={() => {
            if (currentIndex >= 0) {
              const card = contestants[currentIndex]
              swiped('left', card)
            }
          }}
        >
          Skip
        </button>
        <button
          className="btn vote"
          onClick={() => {
            if (currentIndex >= 0) {
              const card = contestants[currentIndex]
              swiped('right', card)
            }
          }}
        >
          Vote
        </button>
      </div>

      {lastDirection && (
        <div className={`swipe-indicator ${lastDirection}`}>
          {lastDirection === 'right' ? '❤️ Voted!' : '👎 Skipped'}
        </div>
      )}
    </div>
  )
}

export default VotingPage
