
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'
import './Resume.css'

function Resume() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [file, setFile] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const headers = {
    Authorization: `Bearer ${token}`
  }

  // Check existing resume
  const checkResume = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/resume`,
        { headers }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to check resume.')
      }

      setUploaded(data.uploaded)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      checkResume()
    }
  }, [token])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Upload resume
  const handleUpload = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a resume first.')
      return
    }

    const extension = file.name.split('.').pop().toLowerCase()

    if (!['pdf', 'doc', 'docx'].includes(extension)) {
      setError('Only PDF, DOC and DOCX files are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Resume must not exceed 5 MB.')
      return
    }

    setProcessing(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch(
        `${API_BASE_URL}/api/resume/upload`,
        {
          method: 'POST',
          headers,
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed.')
      }

      setMessage(data.message)
      setFile(null)

      document.getElementById('resume-file').value = ''

      await checkResume()

    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  // Download resume
  const handleDownload = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/resume/download`,
        { headers }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Download failed.')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'JobConnect-Resume'
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)

    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  // Delete resume
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) {
      return
    }

    setProcessing(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/resume`,
        {
          method: 'DELETE',
          headers
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Delete failed.')
      }

      setUploaded(false)
      setFile(null)
      setMessage(data.message)

    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="resume-loading">
        Checking your resume...
      </div>
    )
  }

  return (
    <div className="resume-page">

      <header className="resume-header">
        <div className="resume-brand">
          <span>J</span> JobConnect
        </div>

        <button
          className="resume-back"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="resume-container">

        <div className="resume-heading">
          <span>CAREER MANAGEMENT</span>
          <h1>My Resume</h1>
          <p>
            Upload and manage your resume to help employers
            discover your professional profile.
          </p>
        </div>

        <section className="resume-card">

          <div className="resume-icon">📄</div>

          <h2>Upload Your Resume</h2>

          <p className="resume-description">
            Keep your resume updated so employers can
            understand your qualifications and experience.
          </p>

          <div className={`resume-status ${uploaded ? 'uploaded' : ''}`}>
            <span>{uploaded ? '✓' : '○'}</span>
            {uploaded
              ? 'Resume uploaded'
              : 'No resume uploaded yet'}
          </div>

          <form onSubmit={handleUpload}>

            <label
              htmlFor="resume-file"
              className="resume-file-label"
            >
              Select Resume

              <input
                id="resume-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setFile(e.target.files[0] || null)
                }
              />
            </label>

            {file && (
              <p className="resume-file-name">
                Selected: {file.name}
              </p>
            )}

            <p className="resume-hint">
              Supported formats: PDF, DOC and DOCX.
              Maximum size: 5 MB.
            </p>

            <button
              type="submit"
              className="resume-upload-button"
              disabled={processing || !file}
            >
              {processing
                ? 'Processing...'
                : uploaded
                  ? 'Replace Resume'
                  : 'Upload Resume'}
            </button>

          </form>

          {uploaded && (
            <div className="resume-actions">

              <button
                onClick={handleDownload}
                disabled={processing}
                className="resume-download"
              >
                Download Resume
              </button>

              <button
                onClick={handleDelete}
                disabled={processing}
                className="resume-delete"
              >
                Delete Resume
              </button>

            </div>
          )}

          {error && (
            <p className="resume-error">{error}</p>
          )}

          {message && (
            <p className="resume-success">{message}</p>
          )}

        </section>

        <section className="resume-tip">
          <span>💡</span>

          <div>
            <strong>Resume tip</strong>
            <p>
              Keep your resume updated with your latest education,
              skills and work experience.
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}

export default Resume
