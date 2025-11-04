import React, { useState, useEffect } from 'react'
import './AdminPage.css'

function AdminPage() {
  const [contestants, setContestants] = useState([])
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchContestants()
    fetchStats()
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!image) {
      alert('Please provide an image')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', image)

      const response = await fetch('/api/contestants', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setImage(null)
        setPreview(null)
        fetchContestants()
        fetchStats()
        alert('Contestant added successfully!')
      } else {
        const error = await response.json()
        alert('Error: ' + error.error)
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Error uploading contestant')
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

  return (
    <div className="admin-page">
      <div className="admin-container">
        <section className="upload-section">
          <h2>Add New Contestant</h2>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="image">Image:</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>

            {preview && (
              <div className="preview">
                <img src={preview} alt="Preview" />
              </div>
            )}

            <button type="submit" disabled={uploading} className="submit-btn">
              {uploading ? 'Uploading...' : 'Add Contestant'}
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
