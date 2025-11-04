import React, { useState, useEffect } from 'react'
import './AdminPage.css'

function AdminPage() {
  const [contestants, setContestants] = useState([])
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState(null)
  const [results, setResults] = useState([])

  useEffect(() => {
    fetchContestants()
    fetchStats()
    fetchResults()
  }, [])

  const fetchContestants = async () => {
    try {
      const response = await fetch('/api/contestants')
      const data = await response.json()
      setContestants(data)
    } catch (error) {
      console.error('Error fetching contestants:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error fetching results:', error)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setImages(files)

      // Create previews for all selected files
      const newPreviews = []
      let loadedCount = 0

      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result)
          loadedCount++

          // Update previews once all files are loaded
          if (loadedCount === files.length) {
            setPreviews(newPreviews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (images.length === 0) {
      alert('Please select at least one image')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()

      // Append all images
      images.forEach((image) => {
        formData.append('images', image)
      })

      const response = await fetch('/api/contestants', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setImages([])
        setPreviews([])
        // Reset the file input
        document.getElementById('images').value = ''
        fetchContestants()
        fetchStats()
        alert(`${result.count} contestant(s) added successfully!`)
      } else {
        const error = await response.json()
        alert('Error: ' + error.error)
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Error uploading contestant(s)')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contestant?')) {
      return
    }

    try {
      const response = await fetch(`/api/contestants/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchContestants()
        fetchStats()
        alert('Contestant deleted successfully!')
      } else {
        alert('Error deleting contestant')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error deleting contestant')
    }
  }

  const handleResetVotes = async () => {
    if (!confirm('Are you sure you want to reset ALL votes? This will keep all contestants but clear all voting data.')) {
      return
    }

    try {
      const response = await fetch('/api/reset-votes', {
        method: 'POST'
      })

      if (response.ok) {
        fetchContestants()
        fetchStats()
        fetchResults()
        alert('All votes have been reset!')
      } else {
        alert('Error resetting votes')
      }
    } catch (error) {
      console.error('Error resetting votes:', error)
      alert('Error resetting votes')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1>🎃 Halloween Costume Contest - Admin</h1>
        </header>

        <section className="upload-section">
          <h2>Add New Contestant</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="images">Images (select one or multiple):</label>
              <input
                type="file"
                id="images"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                required
              />
              {images.length > 0 && (
                <p style={{ color: '#667eea', fontWeight: 'bold', marginTop: '0.5rem' }}>
                  {images.length} file(s) selected
                </p>
              )}
            </div>

            {previews.length > 0 && (
              <div className="preview-grid">
                {previews.map((preview, index) => (
                  <img key={index} src={preview} alt={`Preview ${index + 1}`} />
                ))}
              </div>
            )}

            <button type="submit" disabled={uploading} className="submit-btn">
              {uploading ? 'Uploading...' : `Add ${images.length || ''} Contestant${images.length !== 1 ? 's' : ''}`}
            </button>
          </form>
        </section>

        {stats && (
          <section className="stats-section">
            <h2>Contest Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.total_contestants}</div>
                <div className="stat-label">Total Contestants</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.total_votes}</div>
                <div className="stat-label">Total Votes</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.unique_voters}</div>
                <div className="stat-label">Unique Voters</div>
              </div>
            </div>
            <button onClick={handleResetVotes} className="reset-btn">
              Reset All Votes
            </button>
          </section>
        )}

        {results.length > 0 && (
          <section className="results-section">
            <h2>🏆 Top 3 Winners</h2>
            <div className="winners-grid">
              {results.map((winner, index) => (
                <div key={winner.id} className={`winner-card rank-${index + 1}`}>
                  <div className="rank-badge">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <img src={winner.image_path} alt={winner.name} />
                  <div className="winner-info">
                    <h3>{winner.name}</h3>
                    <p className="vote-count">{winner.votes} votes</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="contestants-section">
          <h2>All Contestants ({contestants.length})</h2>
          <div className="contestants-grid">
            {contestants.map((contestant) => (
              <div key={contestant.id} className="contestant-card">
                <img src={contestant.image_path} alt={contestant.name} />
                <div className="contestant-info">
                  <h3>{contestant.name}</h3>
                  <p className="votes">{contestant.votes} votes</p>
                  <button
                    onClick={() => handleDelete(contestant.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminPage
