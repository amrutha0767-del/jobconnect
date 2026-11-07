
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const pool = require('../db')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()

// Resume storage folder
const UPLOAD_DIR = path.join(
  __dirname,
  '..',
  'uploads',
  'resumes'
)

// Create folder if it does not exist.
// If it already exists as a directory, reuse it.
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// Verify that the upload path is a directory
if (!fs.statSync(UPLOAD_DIR).isDirectory()) {
  throw new Error('uploads/resumes must be a directory.')
}

// Allowed file extensions and MIME types
const allowedTypes = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const uniqueName = crypto.randomUUID() + extension

    cb(null, uniqueName)
  }
})

// Configure Multer upload
const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const allowedMimes = allowedTypes[extension]

    if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
      return cb(
        new Error('Only PDF, DOC and DOCX files are allowed.')
      )
    }

    cb(null, true)
  }
})

// All resume routes require authentication
router.use(authenticateToken)

// Only Job Seekers can manage resumes
router.use((req, res, next) => {
  if (req.user.role !== 'jobseeker') {
    return res.status(403).json({
      success: false,
      message: 'Only Job Seekers can manage resumes.'
    })
  }

  next()
})

// 1. CHECK RESUME STATUS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT resume_path
       FROM job_seeker_profiles
       WHERE user_id = $1`,
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
      uploaded: Boolean(result.rows[0].resume_path),
      message: result.rows[0].resume_path
        ? 'Resume is uploaded.'
        : 'No resume uploaded yet.'
    })

  } catch (error) {
    console.error('Resume status error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to check resume status.'
    })
  }
})

// 2. UPLOAD OR REPLACE RESUME
router.post('/upload', (req, res, next) => {

  upload.single('resume')(req, res, (error) => {
    if (error) {
      let message = error.message

      if (
        error instanceof multer.MulterError &&
        error.code === 'LIMIT_FILE_SIZE'
      ) {
        message = 'Resume must not exceed 5 MB.'
      }

      return res.status(400).json({
        success: false,
        message
      })
    }

    next()
  })

}, async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please select a resume file.'
    })
  }

  try {
    // Get previous resume
    const oldResult = await pool.query(
      `SELECT resume_path
       FROM job_seeker_profiles
       WHERE user_id = $1`,
      [req.user.userId]
    )

    if (oldResult.rows.length === 0) {
      throw new Error('Job Seeker profile not found.')
    }

    const oldFile = oldResult.rows[0].resume_path

    // Save new resume path in PostgreSQL
    const updateResult = await pool.query(
      `UPDATE job_seeker_profiles
       SET resume_path = $2
       WHERE user_id = $1
       RETURNING user_id`,
      [req.user.userId, req.file.filename]
    )

    if (updateResult.rowCount === 0) {
      throw new Error('Unable to update resume record.')
    }

    // Delete old resume after successfully saving the new one
    if (oldFile) {
      const oldFilePath = path.join(
        UPLOAD_DIR,
        path.basename(oldFile)
      )

      await fs.promises.unlink(oldFilePath).catch(() => {})
    }

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully!'
    })

  } catch (error) {
    console.error('Resume upload error:', error.message)

    // Remove new file if database update fails
    await fs.promises.unlink(req.file.path).catch(() => {})

    res.status(500).json({
      success: false,
      message: 'Unable to save resume.'
    })
  }
})

// 3. DOWNLOAD OWN RESUME
router.get('/download', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT resume_path
       FROM job_seeker_profiles
       WHERE user_id = $1`,
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      })
    }

    const storedFile = result.rows[0].resume_path

    if (!storedFile) {
      return res.status(404).json({
        success: false,
        message: 'No resume uploaded yet.'
      })
    }

    const safeFileName = path.basename(storedFile)
    const filePath = path.join(UPLOAD_DIR, safeFileName)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found.'
      })
    }

    res.download(
      filePath,
      `JobConnect-Resume${path.extname(safeFileName)}`
    )

  } catch (error) {
    console.error('Resume download error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to download resume.'
    })
  }
})

// 4. DELETE OWN RESUME
router.delete('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT resume_path
       FROM job_seeker_profiles
       WHERE user_id = $1`,
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      })
    }

    const oldFile = result.rows[0].resume_path

    await pool.query(
      `UPDATE job_seeker_profiles
       SET resume_path = NULL
       WHERE user_id = $1`,
      [req.user.userId]
    )

    if (oldFile) {
      const filePath = path.join(
        UPLOAD_DIR,
        path.basename(oldFile)
      )

      await fs.promises.unlink(filePath).catch(() => {})
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully!'
    })

  } catch (error) {
    console.error('Resume deletion error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to delete resume.'
    })
  }
})

module.exports = router
