
import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../api';

function EmployerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/api/applications/employer`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load applications');
      }

      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications();
    } else {
      setError('Please login again.');
      setLoading(false);
    }
  }, []);

  // Download applicant resume
  const downloadResume = async (applicationId) => {
    try {
      setDownloadingId(applicationId);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/resume`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message || 'Unable to download resume.'
        );
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'Applicant-Resume';
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      alert(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  // Update application status
  const updateStatus = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Status update failed');
      }

      setApplications(previous =>
        previous.map(application =>
          application.application_id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      );

      alert('Application status updated successfully!');

    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'selected':
        return '#15803d';
      case 'shortlisted':
        return '#2563eb';
      case 'rejected':
        return '#dc2626';
      default:
        return '#b45309';
    }
  };

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '30px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>

      <h1>Applications Received</h1>

      <p>Review candidates who applied for your job vacancies.</p>

      <button
        onClick={fetchApplications}
        disabled={loading}
        style={{
          padding: '10px 18px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Loading...' : 'Refresh Applications'}
      </button>

      {loading && <p>Loading applications...</p>}

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

      {!loading && !error && (
        <>
          <h3>Total Applications: {applications.length}</h3>

          {applications.length === 0 ? (
            <p>No candidates have applied for your jobs yet.</p>
          ) : (
            applications.map(application => (
              <div
                key={application.application_id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '20px',
                  background: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >

                <h2>{application.applicant_name}</h2>

                <h3 style={{ color: '#2563eb' }}>
                  {application.job_title}
                </h3>

                <p>
                  <strong>Email:</strong> {application.applicant_email}
                </p>

                <p>
                  <strong>Phone:</strong>{' '}
                  {application.applicant_phone || 'Not provided'}
                </p>

                <p>
                  <strong>Applied Date:</strong>{' '}
                  {application.created_at
                    ? new Date(application.created_at).toLocaleDateString()
                    : application.applied_at
                      ? new Date(application.applied_at).toLocaleDateString()
                      : 'Not available'}
                </p>

                <p>
                  <strong>Cover Letter:</strong>
                </p>

                <p style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {application.cover_letter || 'No cover letter provided.'}
                </p>

                <p>
                  <strong>Resume:</strong>{' '}
                  {application.resume_path
                    ? 'Resume uploaded'
                    : 'No resume attached'}
                </p>

                {application.resume_path && (
                  <button
                    onClick={() => downloadResume(application.application_id)}
                    disabled={downloadingId === application.application_id}
                    style={{
                      padding: '10px 16px',
                      background: '#15803d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '15px'
                    }}
                  >
                    {downloadingId === application.application_id
                      ? 'Downloading...'
                      : 'Download Resume'}
                  </button>
                )}

                <p>
                  <strong>Current Status:</strong>{' '}
                  <span style={{
                    color: getStatusColor(application.status),
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {application.status}
                  </span>
                </p>

                <label>
                  <strong>Update Application Status:</strong>
                </label>

                <br />

                <select
                  value={application.status}
                  disabled={updatingId === application.application_id}
                  onChange={event =>
                    updateStatus(
                      application.application_id,
                      event.target.value
                    )
                  }
                  style={{
                    padding: '10px',
                    marginTop: '10px',
                    borderRadius: '6px',
                    border: '1px solid #aaa',
                    minWidth: '180px'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="selected">Selected</option>
                </select>

                {updatingId === application.application_id && (
                  <p>Updating status...</p>
                )}

              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default EmployerApplications;
