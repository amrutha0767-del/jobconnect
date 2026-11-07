
import { Navigate, useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user'))
  } catch {
    user = null
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  const role = user.role
  const isJobSeeker = role === 'jobseeker'
  const isEmployer = role === 'employer'
  const isAdmin = role === 'admin'

  if (!isJobSeeker && !isEmployer && !isAdmin) {
    return <Navigate to="/login" replace />
  }

  const fullName = (user.fullName || 'User').trim()

  const firstName =
    fullName.length <= 25 ? fullName.split(/\s+/)[0] : ''

  const displayName =
    fullName.length > 24
      ? fullName.substring(0, 21) + '...'
      : fullName

  const initial = fullName.charAt(0).toUpperCase()

  const roleLabel = isJobSeeker
    ? 'Job Seeker'
    : isEmployer
      ? 'Employer'
      : 'Administrator'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const modules = isJobSeeker
    ? [
        {
          id: 'profile',
          icon: '👤',
          title: 'My Profile',
          description: 'Manage your personal information, education and skills.',
          label: 'View Profile',
          available: true
        },
        {
          id: 'find-jobs',
          icon: '💼',
          title: 'Find Jobs',
          description: 'Discover job opportunities across India.',
          label: 'Explore opportunities',
          available: true
        },
        {
          id: 'applications',
          icon: '📋',
          title: 'My Applications',
          description: 'View and track the status of your job applications.',
          label: 'Track applications',
          available: true
        },
        {
          id: 'resume',
          icon: '📄',
          title: 'My Resume',
          description: 'Upload and manage your professional resume.',
          label: 'Manage Resume',
          available: true
        }
      ]
    : isEmployer
      ? [
          {
            id: 'company-profile',
            icon: '🏢',
            title: 'Company Profile',
            description: 'Manage your company information and details.',
            label: 'Company information',
            available: true
          },
          {
            id: 'post-job',
            icon: '➕',
            title: 'Post a Job',
            description: 'Publish vacancies and find suitable candidates.',
            label: 'Create vacancy',
            available: true
          },
          {
            id: 'manage-jobs',
            icon: '💼',
            title: 'Manage Jobs',
            description: 'View and manage your published job vacancies.',
            label: 'Manage vacancies',
            available: true
          },
          {
            id: 'applications',
            icon: '👥',
            title: 'Applications',
            description: 'Review candidates who have applied to your jobs.',
            label: 'View candidates',
            available: true
          }
        ]
      : [
          {
            id: 'users',
            icon: '👥',
            title: 'Manage Users',
            description: 'View and manage registered accounts.',
            label: 'User management',
            available: false
          },
          {
            id: 'jobs',
            icon: '💼',
            title: 'Manage Jobs',
            description: 'Monitor job postings across the platform.',
            label: 'Job management',
            available: false
          },
          {
            id: 'applications',
            icon: '📋',
            title: 'Applications',
            description: 'Monitor job applications.',
            label: 'Application management',
            available: false
          },
          {
            id: 'reports',
            icon: '📊',
            title: 'Reports',
            description: 'View platform activity and statistics.',
            label: 'Analytics',
            available: false
          }
        ]

  const handleModuleClick = (item) => {
    if (item.id === 'company-profile' && isEmployer) {
      navigate('/company-profile')
    } else if (item.id === 'profile' && isJobSeeker) {
      navigate('/profile')
    } else if (item.id === 'resume' && isJobSeeker) {
      navigate('/resume')
    } else if (item.id === 'find-jobs' && isJobSeeker) {
      navigate('/find-jobs')
    } else if (item.id === 'applications' && isJobSeeker) {
      navigate('/my-applications')
    } else if (item.id === 'post-job' && isEmployer) {
      navigate('/post-job')
    } else if (item.id === 'manage-jobs' && isEmployer) {
      navigate('/manage-jobs')
    } else if (item.id === 'applications' && isEmployer) {
      navigate('/employer-applications')
    }
  }

  const handleSidebarClick = (event, item) => {
    if (
      (item.id === 'find-jobs' && isJobSeeker) ||
      (item.id === 'applications' && isJobSeeker) ||
      (item.id === 'profile' && isJobSeeker) ||
      (item.id === 'resume' && isJobSeeker) ||
      (item.id === 'company-profile' && isEmployer) ||
      (item.id === 'post-job' && isEmployer) ||
      (item.id === 'manage-jobs' && isEmployer) ||
      (item.id === 'applications' && isEmployer)
    ) {
      event.preventDefault()
      handleModuleClick(item)
    }
  }

  const getSidebarLink = (item) => {
    if (isJobSeeker) {
      if (item.id === 'profile') return '/profile'
      if (item.id === 'find-jobs') return '/find-jobs'
      if (item.id === 'applications') return '/my-applications'
      if (item.id === 'resume') return '/resume'
    }

    if (isEmployer && item.id === 'company-profile') {
      return '/company-profile'
    }

    if (isEmployer && item.id === 'applications') {
      return '/employer-applications'
    }

    if (isEmployer && item.id === 'post-job') {
      return '/post-job'
    }

    if (isEmployer && item.id === 'manage-jobs') {
      return '/manage-jobs'
    }

    return `#${item.id}`
  }

  return (
    <div className="jc-dashboard">

      <aside className="jc-sidebar">

        <div className="jc-brand">
          <span className="jc-brand-icon">J</span>
          <span>JobConnect</span>
        </div>

        <div className="jc-sidebar-heading">
          WORKSPACE
        </div>

        <nav className="jc-navigation">

          <a href="#overview" className="jc-nav-link active">
            <span>⌂</span>
            Overview
          </a>

          {modules.map((item) => (
            <a
              href={getSidebarLink(item)}
              className="jc-nav-link"
              key={item.id}
              onClick={(event) => handleSidebarClick(event, item)}
            >
              <span>{item.icon}</span>
              {item.title}
            </a>
          ))}

        </nav>

        <div className="jc-sidebar-bottom">

          <div className="jc-india-card">
            <span>🇮🇳</span>
            <div>
              <strong>India-wide Jobs</strong>
              <small>Opportunities across India</small>
            </div>
          </div>

          <p>© 2026 JobConnect</p>

        </div>
      </aside>

      <div className="jc-main-column">

        <header className="jc-topbar">

          <div>
            <span className="jc-breadcrumb">
              Workspace /
            </span>
            <strong>Overview</strong>
          </div>

          <div className="jc-user-area">

            <div className="jc-user-details">
              <div className="jc-avatar">
                {initial}
              </div>

              <div>
                <strong title={fullName}>
                  {displayName}
                </strong>
                <small>{roleLabel}</small>
              </div>
            </div>

            <button
              className="jc-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        </header>

        <main className="jc-content" id="overview">

          <section className="jc-welcome">

            <div className="jc-welcome-text">

              <span className="jc-eyebrow">
                YOUR CAREER, YOUR NEXT STEP
              </span>

              <h1>
                Welcome back{firstName ? `, ${firstName}` : ''}!
              </h1>

              <p>
                {isJobSeeker
                  ? 'Explore opportunities, discover new careers and take your next professional step.'
                  : isEmployer
                    ? 'Find talented people and build your team with JobConnect.'
                    : 'Manage and monitor the JobConnect recruitment platform.'}
              </p>

              <button
                type="button"
                className="jc-primary-button"
                onClick={() => {
                  if (isJobSeeker) {
                    navigate('/find-jobs')
                  } else if (isEmployer) {
                    navigate('/post-job')
                  }
                }}
              >
                {isJobSeeker
                  ? 'Explore Opportunities'
                  : isEmployer
                    ? 'Manage Recruitment'
                    : 'Manage Platform'}

                <span>→</span>
              </button>

            </div>

            <div className="jc-welcome-art">

              <div className="jc-art-circle">
                <span>🚀</span>
              </div>

              <div className="jc-art-caption">
                <strong>Build Your Future</strong>
                <small>Connect with opportunities</small>
              </div>

            </div>
          </section>

          <section className="jc-workspace">

            <div className="jc-section-heading">

              <div>
                <span className="jc-eyebrow">
                  YOUR WORKSPACE
                </span>

                <h2>
                  {isJobSeeker
                    ? 'Manage Your Career'
                    : isEmployer
                      ? 'Manage Your Recruitment'
                      : 'Platform Management'}
                </h2>

                <p>
                  Everything you need, all in one place.
                </p>
              </div>

              <span className="jc-account-badge">
                {roleLabel} Account
              </span>

            </div>

            <div className="jc-module-grid">

              {modules.map((item) => (

                <article
                  className="jc-module-card"
                  id={item.id}
                  key={item.id}
                >

                  <div className="jc-card-top">

                    <div className="jc-module-icon">
                      {item.icon}
                    </div>

                    <span className={
                      item.available
                        ? 'jc-available-badge'
                        : 'jc-coming-badge'
                    }>
                      {item.available ? 'Available' : 'Coming next'}
                    </span>

                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <div className="jc-card-footer">

                    {item.available ? (

                      <button
                        type="button"
                        className="jc-card-action"
                        onClick={() => handleModuleClick(item)}
                      >
                        {item.label} →
                      </button>

                    ) : (

                      <>
                        <span>{item.label}</span>
                        <span className="jc-card-arrow">→</span>
                      </>

                    )}

                  </div>

                </article>

              ))}

            </div>
          </section>

          <section className="jc-info-banner">

            <div className="jc-info-icon">
              ✓
            </div>

            <div>
              <strong>Your account is ready!</strong>

              <p>
                Your JobConnect account has been created successfully.
                Continue setting up your workspace to access more features.
              </p>
            </div>

          </section>

          <footer className="jc-footer">
            <span>
              JobConnect – Connecting talent with opportunity.
            </span>

            <span>
              © 2026 All rights reserved.
            </span>
          </footer>

        </main>
      </div>
    </div>
  )
}

export default Dashboard
