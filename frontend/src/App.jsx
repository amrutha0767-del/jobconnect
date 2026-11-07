
import './App.css'

import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom'

import Register from './pages/Register'
import JobSeekerRegister from './pages/JobSeekerRegister'
import EmployerRegister from './pages/EmployerRegister'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Resume from './pages/Resume'
import PostJob from './pages/PostJob'
import FindJobs from './pages/FindJobs'
import JobDetails from './pages/JobDetails'
import MyApplications from './pages/MyApplications'
import EmployerApplications from './pages/EmployerApplications'
import ManageJobs from './pages/ManageJobs'
import CompanyProfile from './pages/CompanyProfile'


function HomePage() {
  const jobs = [
    {
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      location: 'Multiple locations across India',
      type: 'Full Time',
      salary: '₹3–5 LPA',
      icon: '💻'
    },
    {
      title: 'Python Developer',
      company: 'Digital Innovations',
      location: 'Multiple locations across India',
      type: 'Full Time',
      salary: '₹4–6 LPA',
      icon: '🐍'
    },
    {
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'Remote - India',
      type: 'Part Time',
      salary: '₹2–4 LPA',
      icon: '🎨'
    }
  ]

  return (
    <div className="website">

      <header className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">J</span>
          JobConnect
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#jobs">Find Jobs</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="signup-btn">
            Sign Up
          </Link>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="hero-label">
            YOUR CAREER STARTS HERE
          </span>

          <h1>
            Find Your <span>Dream Job</span>
            <br />
            Build Your Future
          </h1>

          <p>
            Discover exciting career opportunities, connect
            with top employers and take the next step in
            your professional journey with JobConnect.
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Job title or skills"
            />

            <input
              type="text"
              placeholder="City, State or Location"
            />

            <Link to="/login">
              <button type="button">Search Jobs</button>
            </Link>
          </div>

          <p className="popular">
            Popular: Web Developer · Python · Designer · Java
          </p>
        </div>

        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-icon">🚀</div>

            <h3>Your Next Opportunity</h3>

            <p>Find the job that matches your skills.</p>

            <div className="visual-stat">
              <strong>Grow</strong>
              <span>Your Career With Us</span>
            </div>
          </div>

          <div className="floating-card">
            ✓ Career opportunities await!
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <span className="section-label">ABOUT US</span>

        <h2>Welcome to JobConnect</h2>

        <p>
          JobConnect is an online job recruitment platform
          that connects job seekers with employers across India.
          Candidates can explore opportunities and apply
          for jobs, while employers can publish vacancies
          and discover suitable talent.
        </p>
      </section>

      <section className="features-section">
        <span className="section-label">OUR SERVICES</span>

        <h2>Everything You Need</h2>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find Jobs</h3>
            <p>Explore job opportunities that match your skills.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Easy Applications</h3>
            <p>Apply for suitable jobs through one platform.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>For Employers</h3>
            <p>Post vacancies and find talented candidates.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Applications</h3>
            <p>Monitor your job application progress easily.</p>
          </div>

        </div>
      </section>

      <section className="jobs-section" id="jobs">
        <span className="section-label">CAREER OPPORTUNITIES</span>

        <h2>Featured Jobs</h2>

        <p className="jobs-intro">
          Explore example opportunities on JobConnect.
        </p>

        <div className="jobs-grid">

          {jobs.map((job, index) => (
            <div className="job-card" key={index}>

              <div className="job-top">
                <div className="job-icon">{job.icon}</div>
                <span className="job-type">{job.type}</span>
              </div>

              <h3>{job.title}</h3>

              <p className="company">{job.company}</p>

              <div className="job-details">
                <span>📍 {job.location}</span>
                <strong>{job.salary}</strong>
              </div>

              <Link to="/login">
                <button type="button" className="apply-btn">
                  View Details
                </button>
              </Link>

            </div>
          ))}

        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Start Your Career Journey?</h2>

        <p>
          Create your account and discover new opportunities.
        </p>

        <Link to="/register" className="cta-button">
          Join JobConnect
        </Link>
      </section>

      <footer className="footer" id="contact">

        <div>
          <a href="#home" className="logo footer-logo">
            <span className="logo-icon">J</span>
            JobConnect
          </a>

          <p>Connecting talent with opportunity.</p>
        </div>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#jobs">Jobs</a>
          <a href="#contact">Contact</a>
        </div>

        <p className="copyright">
          © 2026 JobConnect. All rights reserved.
        </p>

      </footer>

    </div>
  )
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/register/jobseeker"
          element={<JobSeekerRegister />}
        />

        <Route
          path="/register/employer"
          element={<EmployerRegister />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />
        <Route
  path="/company-profile"
  element={<CompanyProfile />}
/>

        <Route path="/resume" element={<Resume />} />

        <Route path="/post-job" element={<PostJob />} />

        <Route path="/manage-jobs" element={<ManageJobs />} />

        <Route path="/find-jobs" element={<FindJobs />} />

        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route
          path="/my-applications"
          element={<MyApplications />}
        />

        <Route
          path="/employer-applications"
          element={<EmployerApplications />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
