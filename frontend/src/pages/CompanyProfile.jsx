import API_BASE_URL from "../api";
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CompanyProfile() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    company_name: '',
    company_location: '',
    company_description: '',
    website: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load existing company profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch(
          `${API_BASE_URL}/api/employer-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load profile')
        }

        if (data.profile) {
          setFormData({
            company_name: data.profile.company_name || '',
            company_location: data.profile.company_location || '',
            company_description: data.profile.company_description || '',
            website: data.profile.website || ''
          })
        }

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Save company profile
  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_BASE_URL}/api/employer-profile`,
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
        throw new Error(data.message || 'Unable to save profile')
      }

      setSuccess('Company profile saved successfully!')

    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading company profile...</p>
  }

  return (
    <div style={{
      maxWidth: '750px',
      margin: '30px auto',
      padding: '25px'
    }}>

      <button onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <h1>Company Profile</h1>

      <p>
        Manage your company information and details.
      </p>

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      {success && (
        <p style={{ color: 'green' }}>{success}</p>
      )}

      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: '20px' }}>
          <label>Company Name *</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="Enter company name"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Company Location</label>
          <input
            type="text"
            name="company_location"
            value={formData.company_location}
            onChange={handleChange}
            placeholder="Enter company location"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Company Description</label>
          <textarea
            name="company_description"
            value={formData.company_description}
            onChange={handleChange}
            placeholder="Describe your company"
            rows="5"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Company Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Company Profile'}
        </button>

      </form>
    </div>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '12px',
  marginTop: '8px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  boxSizing: 'border-box'
}

export default CompanyProfile
