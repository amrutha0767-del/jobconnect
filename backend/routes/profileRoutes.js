
const express = require('express')
const pool = require('../db')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticateToken)

// Only Job Seekers can access these routes
router.use((req, res, next) => {
  if (req.user.role !== 'jobseeker') {
    return res.status(403).json({
      success: false,
      message: 'Only Job Seekers can access this profile.'
    })
  }
  next()
})

// GET Profile
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        p.location,
        p.education,
        p.skills,
        p.resume_path
       FROM users u
       LEFT JOIN job_seeker_profiles p
       ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      })
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully!',
      profile: result.rows[0]
    })

  } catch (error) {
    console.error('Profile error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to retrieve profile.'
    })
  }
})

// UPDATE OR CREATE Profile
router.put('/', async (req, res) => {
  const {
    fullName,
    phone,
    location,
    education,
    skills
  } = req.body

  const fields = [fullName, phone, location, education, skills]

  if (fields.some(value =>
    value !== undefined && value !== null &&
    typeof value !== 'string'
  )) {
    return res.status(400).json({
      success: false,
      message: 'Profile fields must contain text.'
    })
  }

  const clean = value =>
    typeof value === 'string' ? value.trim() : ''

  let client

  try {
    client = await pool.connect()
    await client.query('BEGIN')

    // Update user's personal information
    await client.query(
      `UPDATE users
       SET full_name = $2,
           phone = $3
       WHERE id = $1`,
      [
        req.user.userId,
        clean(fullName),
        clean(phone)
      ]
    )

    // Create profile if missing, otherwise update it
    await client.query(
      `INSERT INTO job_seeker_profiles
        (user_id, location, education, skills)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         location = EXCLUDED.location,
         education = EXCLUDED.education,
         skills = EXCLUDED.skills`,
      [
        req.user.userId,
        clean(location),
        clean(education),
        clean(skills)
      ]
    )

    await client.query('COMMIT')

    // Retrieve the updated profile
    const result = await client.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        p.location,
        p.education,
        p.skills,
        p.resume_path
       FROM users u
       LEFT JOIN job_seeker_profiles p
       ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.userId]
    )

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: result.rows[0]
    })

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {})
    }

    console.error('Profile update error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to update profile.'
    })

  } finally {
    if (client) {
      client.release()
    }
  }
})

module.exports = router
