import React, { useState, useEffect, useMemo, useRef } from 'react'
import TinderCard from 'react-tinder-card'
import './VotingPage.css'

function VotingPage() {
  const [contestants, setContestants] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastDirection, setLastDirection] = useState()
  const [loading, setLoading] = useState(true)
  const [votingComplete, setVotingComplete] = useState(false)
  const childRefs = useMemo(
    () => Array(contestants.length).fill(0).map(() => React.createRef()),
    [contestants.length]
  )

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

    // Always record that this contestant was viewed
    try {
      await fetch('/api/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestant_id: contestant.id,
          session: sessionId
        })
      })
    } catch (error) {
      console.error('Error recording view:', error)
    }

    // If swiped right, also record the vote
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
      // Check if there are new contestants before showing complete message
      setTimeout(async () => {
        const response = await fetch(`/api/contestants/vote?session=${sessionId}`)
        const data = await response.json()
        if (data.length > 0) {
          setContestants(data)
          setCurrentIndex(data.length - 1)
          setVotingComplete(false)
        } else {
          setVotingComplete(true)
        }
      }, 500)
    }
  }

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!')
  }

  const swipe = async (dir) => {
    if (currentIndex >= 0 && currentIndex < contestants.length) {
      await childRefs[currentIndex].current.swipe(dir)
    }
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
            ref={childRefs[index]}
            key={contestant.id}
            onSwipe={(dir) => swiped(dir, contestant)}
            onCardLeftScreen={() => outOfFrame(contestant.name)}
            preventSwipe={['up', 'down']}
            swipeRequirementType="position"
            swipeThreshold={100}
            className="swipe"
          >
            <div className="card">
              <img
                src={contestant.image_path}
                alt={contestant.name}
                className="card-image"
                onError={(e) => {
                  console.error('Failed to load image:', contestant.image_path)
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">Image not found</text></svg>'
                }}
              />
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
          onClick={() => swipe('left')}
        >
          Skip
        </button>
        <button
          className="btn vote"
          onClick={() => swipe('right')}
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
