
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'

function FindJobs() {
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchJobs = async (filters = {}) => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      const params = new URLSearchParams()

      if (filters.search?.trim()) {
        params.append('search', filters.search.trim())
      }

      if (filters.location?.trim()) {
        params.append('location', filters.location.trim())
      }

      if (filters.employmentType) {
        params.append('employment_type', filters.employmentType)
      }

      const response = await fetch(
        `${API_BASE_URL}/api/jobs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load jobs')
      }

      setJobs(data.jobs || [])
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()

    fetchJobs({
      search,
      location,
      employmentType
    })
  }

  const handleClear = () => {
    setSearch('')
    setLocation('')
    setEmploymentType('')
    fetchJobs({})
  }

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

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Find Jobs</h1>
          <p style={styles.subtitle}>
            Discover opportunities across India.
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </header>

      <form onSubmit={handleSearch} style={styles.searchForm}>

        <input
          style={styles.input}
          type="text"
          placeholder="Search job title, skills or company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          style={styles.input}
          type="text"
          placeholder="Enter city or location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <select
          style={styles.input}
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
        >
          <option value="">All Employment Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
        </select>

        <button type="submit" style={styles.searchButton}>
          Search Jobs
        </button>

        <button
          type="button"
          style={styles.clearButton}
          onClick={handleClear}
        >
          Clear
        </button>

      </form>

      <div style={styles.resultsHeading}>
        <h2>Available Jobs</h2>
        {!loading && <span>{jobs.length} job(s) found</span>}
      </div>

      {loading && (
        <p style={styles.message}>Loading jobs...</p>
      )}

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div style={styles.empty}>
          <h3>No jobs found</h3>
          <p>Try changing your search or location.</p>
        </div>
      )}

      {!loading && !error && jobs.map((job) => (
        <article key={job.id} style={styles.jobCard}>

          <div style={styles.jobTop}>
            <div>
              <h3 style={styles.jobTitle}>{job.title}</h3>
              <p style={styles.company}>
                {job.company_name || 'Company not specified'}
              </p>
            </div>

            <span style={styles.status}>{job.status}</span>
          </div>

          <div style={styles.details}>
            <span>
              📍 {job.location || 'Location not specified'}
            </span>

            <span>
              💼 {job.employment_type || 'Not specified'}
            </span>

            <span>
              💰 {formatSalary(job.salary_min, job.salary_max)}
            </span>
          </div>

          <p style={styles.description}>
            {job.description}
          </p>

          <p style={styles.date}>
            Posted: {job.created_at
              ? new Date(job.created_at).toLocaleDateString('en-IN')
              : 'Date not available'}
          </p>

          <button
            style={styles.viewButton}
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            View Details
          </button>

        </article>
      ))}

    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '30px',
    background: '#f4f6fc',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    marginBottom: '25px'
  },
  heading: {
    color: '#172554',
    margin: 0,
    fontSize: '30px'
  },
  subtitle: {
    color: '#64748b',
    marginTop: '8px'
  },
  backButton: {
    padding: '11px 18px',
    background: '#ffffff',
    color: '#243b8a',
    border: '1px solid #dbe2f0',
    borderRadius: '7px',
    cursor: 'pointer'
  },
  searchForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    background: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 3px 12px rgba(0,0,0,0.05)'
  },
  input: {
    width: '100%',
    minWidth: 0,
    padding: '12px',
    border: '1px solid #dbe2f0',
    borderRadius: '7px',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#172554'
  },
  searchButton: {
    padding: '12px',
    background: '#4338ca',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer'
  },
  clearButton: {
    padding: '12px',
    background: '#e2e8f0',
    color: '#172554',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer'
  },
  resultsHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#172554',
    marginBottom: '15px'
  },
  jobCard: {
    background: '#ffffff',
    padding: '22px',
    borderRadius: '12px',
    marginBottom: '18px',
    boxShadow: '0 3px 12px rgba(0,0,0,0.05)'
  },
  jobTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px'
  },
  jobTitle: {
    margin: 0,
    color: '#172554',
    fontSize: '21px'
  },
  company: {
    color: '#64748b',
    marginTop: '7px'
  },
  status: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  details: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '18px',
    color: '#475569',
    fontSize: '14px',
    margin: '15px 0'
  },
  description: {
    color: '#334155',
    lineHeight: '1.6'
  },
  date: {
    color: '#94a3b8',
    fontSize: '12px'
  },
  viewButton: {
    padding: '11px 20px',
    background: '#243b8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    marginTop: '8px'
  },
  message: {
    color: '#475569'
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '15px',
    borderRadius: '8px'
  },
  empty: {
    background: '#ffffff',
    padding: '35px',
    textAlign: 'center',
    borderRadius: '12px',
    color: '#64748b'
  }
}

export default FindJobs
