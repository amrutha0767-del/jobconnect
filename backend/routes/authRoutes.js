const jwt = require('jsonwebtoken')
const express = require('express')
const bcrypt = require('bcrypt')
const pool = require('../db')

const router = express.Router()

// Job Seeker Registration API
router.post('/register/jobseeker', async (req, res) => {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    location
  } = req.body

  if (
    !fullName?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !password ||
    !confirmPassword ||
    !location?.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all fields.'
    })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.'
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least 8 characters.'
    })
  }

  let client

  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    client = await pool.connect()
    await client.query('BEGIN')

    const userResult = await client.query(
      `INSERT INTO users
      (full_name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, phone, role`,
      [
        fullName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        hashedPassword,
        'jobseeker'
      ]
    )

    const user = userResult.rows[0]

    await client.query(
      `INSERT INTO job_seeker_profiles
      (user_id, location)
      VALUES ($1, $2)`,
      [user.id, location.trim()]
    )

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      message: 'Job Seeker registered successfully!',
      user
    })

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {})
    }

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.'
      })
    }

    console.error('Registration error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Registration failed.'
    })

  } finally {
    if (client) {
      client.release()
    }
  }
})
// Employer Registration API
router.post('/register/employer', async (req, res) => {
  const {
    companyName,
    contactPerson,
    email,
    phone,
    location,
    password,
    confirmPassword
  } = req.body

  // Validate required fields
  if (
    !companyName?.trim() ||
    !contactPerson?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !location?.trim() ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all fields.'
    })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.'
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least 8 characters.'
    })
  }

  let client

  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    client = await pool.connect()
    await client.query('BEGIN')

    // Save employer account
    const userResult = await client.query(
      `INSERT INTO users
       (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, role`,
      [
        contactPerson.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        hashedPassword,
        'employer'
      ]
    )

    const user = userResult.rows[0]

    // Save company profile
    await client.query(
      `INSERT INTO employer_profiles
       (user_id, company_name, company_location)
       VALUES ($1, $2, $3)`,
      [
        user.id,
        companyName.trim(),
        location.trim()
      ]
    )

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      message: 'Employer registered successfully!',
      user
    })

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {})
    }

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.'
      })
    }

    console.error('Employer registration error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Employer registration failed.'
    })

  } finally {
    if (client) {
      client.release()
    }
  }
})
module.exports = router
// User Login API
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    })
  }

  try {
    // Find user by email
    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role, is_active
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    // Check account status
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive.'
      })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    // Check JWT configuration
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Authentication configuration error.'
      })
    }

    // Generate authentication token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      }
    )

    // Send login response
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Login error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    })
  }
})