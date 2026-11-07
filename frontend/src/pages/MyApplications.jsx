
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'

function MyApplications() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch(
          `${API_BASE_URL}/api/applications/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to fetch applications'
          )
        }

        setApplications(data.applications || [])
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [navigate])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return styles.pending
      case 'shortlisted':
        return styles.shortlisted
      case 'rejected':
        return styles.rejected
      case 'selected':
        return styles.selected
      default:
        return styles.pending
    }
  }

  const formatSalary = (min, max) => {
    if (min == null && max == null) {
      return 'Not disclosed'
    }

    const formatAmount = (amount) =>
      `₹${Number(amount).toLocaleString('en-IN')}`

    if (min != null && max != null) {
      return `${formatAmount(min)} - ${formatAmount(max)}`
    }

    if (min != null) {
      return `From ${formatAmount(min)}`
    }

    return `Up to ${formatAmount(max)}`
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>My Applications</h1>
          <p style={styles.subtitle}>
            View and track all your submitted job applications.
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      {loading && (
        <p style={styles.message}>
          Loading your applications...
        </p>
      )}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={styles.summary}>
            <h2>{applications.length}</h2>
            <p>Total Applications</p>
          </div>

          {applications.length === 0 ? (
            <div style={styles.empty}>
              <h2>No Applications Yet</h2>
              <p>
                You have not applied for any jobs yet.
              </p>

              <button
                style={styles.primaryButton}
                onClick={() => navigate('/find-jobs')}
              >
                Find Jobs
              </button>
            </div>
          ) : (
            <div style={styles.list}>
              {applications.map((application) => (
                <div
                  key={application.application_id}
                  style={styles.card}
                >
                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.jobTitle}>
                        {application.title}
                      </h2>

                      <p style={styles.company}>
                        {application.company_name ||
                          'Company not specified'}
                      </p>
                    </div>

                    <span style={getStatusStyle(application.status)}>
                      {application.status}
                    </span>
                  </div>

                  <hr style={styles.line} />

                  <p style={styles.detail}>
                    <strong>Location:</strong>{' '}
                    {application.location || 'Not specified'}
                  </p>

                  <p style={styles.detail}>
                    <strong>Employment Type:</strong>{' '}
                    {application.employment_type || 'Not specified'}
                  </p>

                  <p style={styles.detail}>
                    <strong>Salary:</strong>{' '}
                    {formatSalary(
                      application.salary_min,
                      application.salary_max
                    )}
                  </p>

                  <p style={styles.detail}>
                    <strong>Applied Date:</strong>{' '}
                    {application.applied_at
                      ? new Date(
                          application.applied_at
                        ).toLocaleDateString('en-IN')
                      : 'Not available'}
                  </p>

                  <p style={styles.detail}>
                    <strong>Resume:</strong>{' '}
                    {application.resume_path
                      ? 'Attached'
                      : 'No resume attached'}
                  </p>

                  <p style={styles.detail}>
                    <strong>Cover Letter:</strong>{' '}
                    {application.cover_letter || 'Not provided'}
                  </p>

                  <button
                    style={styles.viewButton}
                    onClick={() =>
                      navigate(`/jobs/${application.job_id}`)
                    }
                  >
                    View Job Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
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
  header: {
    maxWidth: '1000px',
    margin: '0 auto 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  heading: {
    color: '#172554',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#64748b'
  },
  backButton: {
    padding: '11px 18px',
    background: '#243b8a',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer'
  },
  summary: {
    maxWidth: '1000px',
    margin: '0 auto 25px',
    padding: '20px',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  list: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'grid',
    gap: '20px'
  },
  card: {
    background: '#fff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  jobTitle: {
    color: '#172554',
    margin: '0 0 8px'
  },
  company: {
    color: '#64748b'
  },
  detail: {
    color: '#475569',
    lineHeight: '1.7',
    overflowWrap: 'anywhere'
  },
  line: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '18px 0'
  },
  pending: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '8px 14px',
    borderRadius: '20px',
    textTransform: 'capitalize'
  },
  shortlisted: {
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '8px 14px',
    borderRadius: '20px',
    textTransform: 'capitalize'
  },
  rejected: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '8px 14px',
    borderRadius: '20px',
    textTransform: 'capitalize'
  },
  selected: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '8px 14px',
    borderRadius: '20px',
    textTransform: 'capitalize'
  },
  viewButton: {
    padding: '11px 18px',
    background: '#243b8a',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  primaryButton: {
    padding: '12px 20px',
    background: '#243b8a',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer'
  },
  empty: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px',
    background: '#fff',
    textAlign: 'center',
    borderRadius: '10px'
  },
  message: {
    textAlign: 'center',
    color: '#475569'
  },
  error: {
    maxWidth: '1000px',
    margin: '20px auto',
    padding: '15px',
    background: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '8px'
  }
}

export default MyApplications
