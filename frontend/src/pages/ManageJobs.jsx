
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api';

function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  const inputStyle = {
    width: '100%',
    padding: '11px',
    marginTop: '7px',
    marginBottom: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    boxSizing: 'border-box',
    fontSize: '14px'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    color: '#263445'
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError('');

    if (!token) {
      setError('Please login as an employer.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load jobs.');
      }

      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const changeStatus = async (jobId, status) => {
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs/${jobId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to change status.');
      }

      setMessage('Job status updated successfully.');
      fetchJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteJob = async (job) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}"?`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs/${job.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete job.');
      }

      setMessage('Job deleted successfully.');
      fetchJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditing = (job) => {
    setEditingJob({
      id: job.id,
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      employment_type: job.employment_type || 'Full-time',
      salary_min: job.salary_min ?? '',
      salary_max: job.salary_max ?? '',
      status: job.status || 'open'
    });

    setError('');
    setMessage('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingJob(previous => ({
      ...previous,
      [name]: value
    }));
  };

  const saveJob = async (e) => {
    e.preventDefault();

    if (
      editingJob.salary_min !== '' &&
      editingJob.salary_max !== '' &&
      Number(editingJob.salary_max) < Number(editingJob.salary_min)
    ) {
      setError('Maximum salary cannot be less than minimum salary.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs/${editingJob.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...editingJob,
            salary_min:
              editingJob.salary_min === ''
                ? null
                : Number(editingJob.salary_min),
            salary_max:
              editingJob.salary_max === ''
                ? null
                : Number(editingJob.salary_max)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update job.');
      }

      setEditingJob(null);
      setMessage('Job updated successfully.');
      fetchJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'open') return '#15803d';
    if (status === 'closed') return '#b91c1c';
    return '#a16207';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f5f9',
      padding: '30px 15px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: 'auto',
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 18px rgba(0,0,0,0.07)'
      }}>
        <h1 style={{ color: '#172554', marginTop: 0 }}>
          Manage Jobs
        </h1>

        <p style={{ color: '#64748b' }}>
          View, edit, close and manage the jobs you have posted.
        </p>

        {message && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '12px',
            borderRadius: '7px',
            marginBottom: '15px'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '7px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={fetchJobs}
          style={{
            padding: '10px 16px',
            background: '#1e3a8a',
            color: 'white',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Refresh Jobs
        </button>

        {loading ? (
          <p>Loading your jobs...</p>
        ) : jobs.length === 0 ? (
          <div style={{
            padding: '25px',
            background: '#f8fafc',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p>You have not posted any jobs yet.</p>
            <button
              onClick={() => navigate('/post-job')}
              style={{
                padding: '11px 18px',
                background: '#1e3a8a',
                color: 'white',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer'
              }}
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          jobs.map(job => (
            <div
              key={job.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '9px',
                padding: '20px',
                marginBottom: '17px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <h2 style={{
                  color: '#172554',
                  marginTop: 0,
                  marginBottom: '10px'
                }}>
                  {job.title}
                </h2>

                <strong style={{
                  color: statusColor(job.status),
                  textTransform: 'uppercase'
                }}>
                  {job.status}
                </strong>
              </div>

              <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
              <p><strong>Employment:</strong> {job.employment_type || 'Not specified'}</p>
              <p>
                <strong>Salary:</strong>{' '}
                {job.salary_min != null
                  ? `₹${Number(job.salary_min).toLocaleString('en-IN')}`
                  : 'Not specified'}
                {' - '}
                {job.salary_max != null
                  ? `₹${Number(job.salary_max).toLocaleString('en-IN')}`
                  : 'Not specified'}
              </p>

              <p style={{
                color: '#475569',
                whiteSpace: 'pre-wrap'
              }}>
                {job.description}
              </p>

              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginTop: '15px'
              }}>
                <button
                  onClick={() => startEditing(job)}
                  style={{
                    padding: '9px 15px',
                    background: '#1e40af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>

                <select
                  value={job.status}
                  onChange={e => changeStatus(job.id, e.target.value)}
                  style={{
                    padding: '9px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px'
                  }}
                >
                  <option value="open">Open</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  onClick={() => deleteJob(job)}
                  style={{
                    padding: '9px 15px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '15px',
            padding: '10px 16px',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>

      {editingJob && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.65)',
          padding: '20px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: '650px',
            margin: '20px auto',
            background: 'white',
            padding: '25px',
            borderRadius: '12px'
          }}>
            <h2 style={{ color: '#172554', marginTop: 0 }}>
              Edit Job
            </h2>

            <form onSubmit={saveJob}>
              <label style={labelStyle}>Job Title *</label>
              <input
                style={inputStyle}
                name="title"
                value={editingJob.title}
                onChange={handleEditChange}
                required
              />

              <label style={labelStyle}>Description *</label>
              <textarea
                style={{ ...inputStyle, minHeight: '110px' }}
                name="description"
                value={editingJob.description}
                onChange={handleEditChange}
                required
              />

              <label style={labelStyle}>Location</label>
              <input
                style={inputStyle}
                name="location"
                value={editingJob.location}
                onChange={handleEditChange}
              />

              <label style={labelStyle}>Employment Type</label>
              <select
                style={inputStyle}
                name="employment_type"
                value={editingJob.employment_type}
                onChange={handleEditChange}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>

              <label style={labelStyle}>Minimum Salary</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                name="salary_min"
                value={editingJob.salary_min}
                onChange={handleEditChange}
              />

              <label style={labelStyle}>Maximum Salary</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                name="salary_max"
                value={editingJob.salary_max}
                onChange={handleEditChange}
              />

              <label style={labelStyle}>Status</label>
              <select
                style={inputStyle}
                name="status"
                value={editingJob.status}
                onChange={handleEditChange}
              >
                <option value="open">Open</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '11px 18px',
                  background: '#1e3a8a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={() => setEditingJob(null)}
                style={{
                  padding: '11px 18px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageJobs;
