
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API_BASE_URL from '../api'

function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [coverLetter, setCoverLetter] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [applicationError, setApplicationError] = useState('')
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch(
          `${API_BASE_URL}/api/jobs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load job details')
        }

        setJob(data.job)
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [id, navigate])

  const formatSalary = (min, max) => {
    const formatAmount = (amount) =>
      `₹${Number(amount).toLocaleString('en-IN')}`

    if (min == null && max == null) {
      return 'Salary not disclosed'
    }

    if (min != null && max != null) {
      return `${formatAmount(min)} - ${formatAmount(max)} per year`
    }

    if (min != null) {
      return `From ${formatAmount(min)} per year`
    }

    return `Up to ${formatAmount(max)} per year`
  }

  const handleApply = async () => {
    setApplicationMessage('')
    setApplicationError('')

    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setIsApplying(true)

      const response = await fetch(
        `${API_BASE_URL}/api/applications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            job_id: Number(id),
            cover_letter: coverLetter.trim() || null
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Application submission failed')
      }

      setHasApplied(true)
      setApplicationMessage('Your application has been submitted successfully!')
      setCoverLetter('')

    } catch (err) {
      setApplicationError(err.message || 'Something went wrong')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div style={styles.page}>

      <button
        style={styles.backButton}
        onClick={() => navigate('/find-jobs')}
      >
        ← Back to Find Jobs
      </button>

      {loading && (
        <p style={styles.message}>Loading job details...</p>
      )}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {!loading && !error && job && (
        <div style={styles.card}>

          <span style={styles.status}>
            {job.status}
          </span>

          <h1 style={styles.title}>{job.title}</h1>

          <h2 style={styles.company}>
            {job.company_name || 'Company not specified'}
          </h2>

          <hr style={styles.line} />

          <h3 style={styles.sectionTitle}>Job Information</h3>

          <p style={styles.detail}>
            <strong>Location:</strong>{' '}
            {job.location || 'Not specified'}
          </p>

          <p style={styles.detail}>
            <strong>Company Location:</strong>{' '}
            {job.company_location || 'Not specified'}
          </p>

          <p style={styles.detail}>
            <strong>Employment Type:</strong>{' '}
            {job.employment_type || 'Not specified'}
          </p>

          <p style={styles.detail}>
            <strong>Salary:</strong>{' '}
            {formatSalary(job.salary_min, job.salary_max)}
          </p>

          <p style={styles.detail}>
            <strong>Posted Date:</strong>{' '}
            {job.created_at
              ? new Date(job.created_at).toLocaleDateString('en-IN')
              : 'Not available'}
          </p>

          <hr style={styles.line} />

          <h3 style={styles.sectionTitle}>Job Description</h3>

          <p style={styles.description}>
            {job.description}
          </p>

          {job.status === 'open' && (
            <>
              <hr style={styles.line} />

              <h3 style={styles.sectionTitle}>Apply for this Job</h3>

              <p style={styles.detail}>
                Your uploaded resume will be attached automatically.
                You can also write an optional cover letter.
              </p>

              <textarea
                style={styles.textarea}
                placeholder="Write your cover letter here (optional)..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                disabled={hasApplied}
              />

              {applicationMessage && (
                <p style={styles.success}>
                  {applicationMessage}
                </p>
              )}

              {applicationError && (
                <p style={styles.applicationError}>
                  {applicationError}
                </p>
              )}

              <button
                style={{
                  ...styles.applyButton,
                  opacity: isApplying || hasApplied ? 0.6 : 1,
                  cursor: isApplying || hasApplied ? 'not-allowed' : 'pointer'
                }}
                onClick={handleApply}
                disabled={isApplying || hasApplied}
              >
                {isApplying
                  ? 'Submitting...'
                  : hasApplied
                    ? 'Application Submitted'
                    : 'Apply Now'}
              </button>
            </>
          )}

          {job.status !== 'open' && (
            <p style={styles.applicationError}>
              This job is currently not accepting applications.
            </p>
          )}

          <hr style={styles.line} />

          <button
            style={styles.backButton}
            onClick={() => navigate('/find-jobs')}
          >
            Back to Find Jobs
          </button>

        </div>
      )}

    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f6fc',
    padding: '30px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    maxWidth: '850px',
    margin: '25px auto',
    background: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 3px 12px rgba(0,0,0,0.06)'
  },
  title: {
    color: '#172554',
    fontSize: '30px',
    marginBottom: '8px'
  },
  company: {
    color: '#64748b',
    fontSize: '20px',
    fontWeight: 'normal'
  },
  status: {
    display: 'inline-block',
    background: '#dcfce7',
    color: '#15803d',
    padding: '7px 14px',
    borderRadius: '20px',
    fontSize: '13px'
  },
  sectionTitle: {
    color: '#172554',
    marginTop: '25px'
  },
  detail: {
    color: '#475569',
    lineHeight: '1.8'
  },
  description: {
    color: '#334155',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap'
  },
  line: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '22px 0'
  },
  backButton: {
    padding: '11px 18px',
    background: '#243b8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer'
  },
  applyButton: {
    padding: '13px 25px',
    background: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '15px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical'
  },
  success: {
    color: '#15803d',
    background: '#dcfce7',
    padding: '12px',
    borderRadius: '7px'
  },
  applicationError: {
    color: '#b91c1c',
    background: '#fee2e2',
    padding: '12px',
    borderRadius: '7px'
  },
  message: {
    color: '#475569',
    textAlign: 'center',
    marginTop: '30px'
  },
  error: {
    maxWidth: '850px',
    margin: '25px auto',
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '15px',
    borderRadius: '8px'
  }
}

export default JobDetails
