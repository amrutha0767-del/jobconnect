
const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'resumes');

// Log application API requests
router.use((req, res, next) => {
    console.log(
        'Applications API request:',
        req.method,
        req.originalUrl
    );
    next();
});

// All application routes require login
router.use(authenticateToken);

// Check user roles
const requireJobSeeker = (req, res, next) => {
    if (req.user.role !== 'jobseeker') {
        return res.status(403).json({
            success: false,
            message: 'Only Job Seekers can perform this action.'
        });
    }
    next();
};

const requireEmployer = (req, res, next) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({
            success: false,
            message: 'Only Employers can perform this action.'
        });
    }
    next();
};

// 1. APPLY FOR A JOB
router.post('/', requireJobSeeker, async (req, res) => {
    try {
        const { job_id, cover_letter } = req.body;
        const userId = req.user.userId;

        if (!job_id) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required.'
            });
        }

        const jobResult = await pool.query(
            'SELECT id FROM jobs WHERE id = $1 AND status = $2',
            [job_id, 'open']
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or no longer open.'
            });
        }

        const profileResult = await pool.query(
            `SELECT resume_path
             FROM job_seeker_profiles
             WHERE user_id = $1`,
            [userId]
        );

        const resumePath = profileResult.rows.length > 0
            ? profileResult.rows[0].resume_path
            : null;

        const result = await pool.query(
            `INSERT INTO applications
             (job_id, job_seeker_id, cover_letter, resume_path, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING *`,
            [job_id, userId, cover_letter || null, resumePath]
        );

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully!',
            application: result.rows[0]
        });

    } catch (error) {
        console.error('Apply for job error:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'You have already applied for this job.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Unable to submit application.'
        });
    }
});

// 2. GET MY APPLICATIONS - JOB SEEKER
router.get('/my', requireJobSeeker, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                a.*,
                a.id AS application_id,
                j.title AS title,
                employer.full_name AS company_name,
                j.location,
                j.employment_type,
                j.salary_min,
                j.salary_max
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             LEFT JOIN users employer ON j.employer_id = employer.id
             WHERE a.job_seeker_id = $1
             ORDER BY a.applied_at DESC`,
            [req.user.userId]
        );

        // Debugging: display API response in backend terminal
        console.log('MY APPLICATIONS DATA:', result.rows);

        res.json({
            success: true,
            applications: result.rows
        });

    } catch (error) {
        console.error('My applications error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to fetch applications.'
        });
    }
});

// 3. GET APPLICATIONS RECEIVED - EMPLOYER
router.get('/employer', requireEmployer, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                a.id AS application_id,
                a.job_id,
                a.job_seeker_id,
                a.cover_letter,
                a.resume_path,
                a.status,
                a.applied_at,
                j.title AS job_title,
                u.full_name AS applicant_name,
                u.email AS applicant_email,
                u.phone AS applicant_phone
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON a.job_seeker_id = u.id
             WHERE j.employer_id = $1
             ORDER BY a.applied_at DESC`,
            [req.user.userId]
        );

        res.json({
            success: true,
            applications: result.rows
        });

    } catch (error) {
        console.error('Employer applications error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to fetch received applications.'
        });
    }
});

// 4. EMPLOYER DOWNLOAD APPLICANT RESUME
router.get('/:applicationId/resume', requireEmployer, async (req, res) => {
    try {
        const applicationId = Number(req.params.applicationId);
        const employerId = req.user.userId;

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID.'
            });
        }

        const result = await pool.query(
            `SELECT a.resume_path
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.id = $1 AND j.employer_id = $2`,
            [applicationId, employerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found.'
            });
        }

        const storedFile = result.rows[0].resume_path;

        if (!storedFile) {
            return res.status(404).json({
                success: false,
                message: 'No resume attached to this application.'
            });
        }

        const safeFileName = path.basename(storedFile);
        const filePath = path.join(UPLOAD_DIR, safeFileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Resume file not found.'
            });
        }

        res.download(
            filePath,
            `Applicant-Resume${path.extname(safeFileName)}`
        );

    } catch (error) {
        console.error('Applicant resume download error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to download applicant resume.'
        });
    }
});

// 5. UPDATE APPLICATION STATUS - EMPLOYER
router.patch('/:applicationId/status', requireEmployer, async (req, res) => {
    try {
        const applicationId = Number(req.params.applicationId);
        const { status } = req.body;
        const employerId = req.user.userId;

        const allowedStatuses = [
            'pending',
            'shortlisted',
            'rejected',
            'selected'
        ];

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID.'
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application status.'
            });
        }

        const result = await pool.query(
            `UPDATE applications a
             SET status = $1
             FROM jobs j
             WHERE a.job_id = j.id
             AND a.id = $2
             AND j.employer_id = $3
             RETURNING a.*`,
            [status, applicationId, employerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found.'
            });
        }

        res.json({
            success: true,
            message: 'Application status updated successfully!',
            application: result.rows[0]
        });

    } catch (error) {
        console.error('Update application status error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to update application status.'
        });
    }
});

module.exports = router;
