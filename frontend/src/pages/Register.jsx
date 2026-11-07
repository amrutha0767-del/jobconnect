
import { Link } from 'react-router-dom'
import './Register.css'

function Register() {
  return (
    <div className="register-page">
      <Link to="/" className="register-logo">
        <span>J</span> JobConnect
      </Link>

      <div className="register-container">
        <div className="register-heading">
          <span className="register-label">GET STARTED</span>
          <h1>Join JobConnect</h1>
          <p>Choose how you want to use our platform.</p>
        </div>

        <div className="role-cards">
          <div className="role-card">
            <div className="role-icon">👩‍💻</div>
            <h2>Job Seeker</h2>
            <p>
              Discover opportunities, create your profile
              and apply for jobs that match your skills.
            </p>
            <Link
              to="/register/jobseeker"
              className="role-button"
            >
              Register as Job Seeker
            </Link>
          </div>

          <div className="role-card">
            <div className="role-icon">🏢</div>
            <h2>Employer</h2>
            <p>
              Publish job vacancies, find talented people
              and manage your recruitment process.
            </p>
            <Link
              to="/register/employer"
              className="role-button employer-button"
            >
              Register as Employer
            </Link>
          </div>
        </div>

        <p className="register-login">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
