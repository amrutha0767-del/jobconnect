
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api';

function PostJob() {
  const navigate = useNavigate();

  const initialFormData = {
    title: '',
    description: '',
    location: '',
    employment_type: 'Full-time',
    salary_min: '',
    salary_max: '',
    status: 'open'
  };

  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please login before posting a job.');
      return;
    }

    if (
      formData.salary_min !== '' &&
      formData.salary_max !== '' &&
      Number(formData.salary_max) < Number(formData.salary_min)
    ) {
      setError('Maximum salary must be greater than or equal to minimum salary.');
      return;
    }

    const requestData = {
      ...formData,
      salary_min:
        formData.salary_min === '' ? null : Number(formData.salary_min),
      salary_max:
        formData.salary_max === '' ? null : Number(formData.salary_max)
    };

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to post job.');
      }

      setMessage('Job posted successfully!');
      setFormData(initialFormData);

    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginTop: '8px',
    marginBottom: '18px',
    border: '1px solid #d1d5db',
    borderRadius: '7px',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    color: '#263445'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3f5f9',
        padding: '35px 15px'
      }}
    >
      <div
        style={{
          maxWidth: '750px',
          margin: 'auto',
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 18px rgba(0,0,0,0.08)'
        }}
      >
        <h1 style={{ color: '#172554', marginTop: 0 }}>
          Post a Job
        </h1>

        <p style={{ color: '#64748b', marginBottom: '25px' }}>
          Enter the job details to publish an opportunity for job seekers.
        </p>

        {message && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '12px',
              borderRadius: '7px',
              marginBottom: '18px'
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '7px',
              marginBottom: '18px'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Job Title *</label>
          <input
            style={inputStyle}
            type="text"
            name="title"
            placeholder="Example: Software Developer"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label style={labelStyle}>Job Description *</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: '130px',
              resize: 'vertical'
            }}
            name="description"
            placeholder="Describe job responsibilities, qualifications and skills..."
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label style={labelStyle}>Job Location</label>
          <input
            style={inputStyle}
            type="text"
            name="location"
            placeholder="Example: Vijayawada, Andhra Pradesh, India or Remote - India"
            value={formData.location}
            onChange={handleChange}
          />

          <label style={labelStyle}>Employment Type</label>
          <select
            style={inputStyle}
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>

          <label style={labelStyle}>
            Minimum Salary (₹ per year)
          </label>
          <input
            style={inputStyle}
            type="number"
            name="salary_min"
            placeholder="Example: 300000"
            min="0"
            value={formData.salary_min}
            onChange={handleChange}
          />

          <label style={labelStyle}>
            Maximum Salary (₹ per year)
          </label>
          <input
            style={inputStyle}
            type="number"
            name="salary_max"
            placeholder="Example: 600000"
            min="0"
            value={formData.salary_max}
            onChange={handleChange}
          />

          <label style={labelStyle}>Job Status</label>
          <select
            style={inputStyle}
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#64748b' : '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '7px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting...' : 'Post Job'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '18px',
            padding: '10px 15px',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default PostJob;
