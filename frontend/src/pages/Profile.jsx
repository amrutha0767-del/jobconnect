
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    education: '',
    skills: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Load profile from PostgreSQL
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load profile.')
        }

        const profile = data.profile

        setFormData({
          fullName: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          education: profile.education || '',
          skills: profile.skills || ''
        })

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadProfile()
    }
  }, [token])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Save profile to PostgreSQL
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed.')
      }

      // Update the locally stored name
      const storedUser = JSON.parse(
        localStorage.getItem('user') || '{}'
      )

      localStorage.setItem(
        'user',
        JSON.stringify({
          ...storedUser,
          fullName: formData.fullName
        })
      )

      setMessage('Your profile has been updated successfully!')

    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return <div className="profile-loading">Loading your profile...</div>
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-brand">
          <span>J</span> JobConnect
        </div>

        <button
          className="profile-back"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="profile-container">

        <div className="profile-heading">
          <span>ACCOUNT MANAGEMENT</span>
          <h1>My Profile</h1>
          <p>Manage your personal and professional information.</p>
        </div>

        <section className="profile-card">

          <div className="profile-card-heading">
            <div className="profile-avatar">
              {formData.fullName.charAt(0).toUpperCase() || 'U'}
            </div>

            <div>
              <h2>{formData.fullName || 'Your Name'}</h2>
              <p>Job Seeker</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          <form onSubmit={handleSubmit}>

            <h3>Personal Information</h3>

            <div className="profile-form-grid">

              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="profile-readonly"
                />
                <small>Email cannot be changed here.</small>
              </div>

              <div className="profile-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="profile-field">
                <label>City and State / Union Territory</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your city and state"
                />
              </div>

            </div>

            <div className="profile-divider"></div>

            <h3>Professional Information</h3>

            <div className="profile-field profile-full-field">
              <label>Education</label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="Enter your degree, college and qualifications"
                rows="3"
              />
            </div>

            <div className="profile-field profile-full-field">
              <label>Skills</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Enter your skills, separated by commas"
                rows="3"
              />
            </div>

            {error && (
              <p className="profile-error">{error}</p>
            )}

            {message && (
              <p className="profile-success">{message}</p>
            )}

            <div className="profile-actions">
              <button
                type="button"
                className="profile-cancel"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </section>

      </main>
    </div>
  )
}

export default Profile
