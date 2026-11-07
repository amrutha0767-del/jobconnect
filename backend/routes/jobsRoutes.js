const express = require('express');
const router = express.Router();

const pool = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

// All job routes require login
router.use(authenticateToken);

// Check whether the logged-in user is an employer
const requireEmployer = (req, res, next) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({
            success: false,
            message: 'Only employers can manage jobs'
        });
    }

    next();
};

// Validate salary values
const validateSalary = (salaryMin, salaryMax) => {
    const min =
        salaryMin === '' || salaryMin === undefined || salaryMin === null
            ? null
            : Number(salaryMin);

    const max =
        salaryMax === '' || salaryMax === undefined || salaryMax === null
            ? null
            : Number(salaryMax);

    if (
        (min !== null && (!Number.isFinite(min) || min < 0)) ||
        (max !== null && (!Number.isFinite(max) || max < 0))
    ) {
        return { valid: false };
    }

    if (min !== null && max !== null && max < min) {
        return { valid: false };
    }

    return { valid: true, min, max };
};

// GET: View jobs posted by the logged-in employer
// Keep this route before GET '/:id'
router.get('/my', requireEmployer, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                j.id,
                j.employer_id,
                j.title,
                j.description,
                j.location,
                j.employment_type,
                j.salary_min,
                j.salary_max,
                j.status,
                j.created_at,
                ep.company_name,
                ep.company_location
             FROM jobs j
             LEFT JOIN employer_profiles ep
                ON ep.user_id = j.employer_id
             WHERE j.employer_id = $1
             ORDER BY j.created_at DESC`,
            [req.user.userId]
        );

        res.json({
            success: true,
            jobs: result.rows
        });
    } catch (error) {
        console.error('My jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch your jobs'
        });
    }
});

// GET: View all open jobs with optional search filters
router.get('/', async (req, res) => {
    try {
        const { search, location, employment_type } = req.query;

        let query = `
            SELECT
                j.id,
                j.employer_id,
                j.title,
                j.description,
                j.location,
                j.employment_type,
                j.salary_min,
                j.salary_max,
                j.status,
                j.created_at,
                ep.company_name,
                ep.company_location
            FROM jobs j
            LEFT JOIN employer_profiles ep
                ON ep.user_id = j.employer_id
            WHERE j.status = 'open'
        `;

        const values = [];

        if (search && search.trim()) {
            values.push(`%${search.trim()}%`);
            query += `
                AND (
                    j.title ILIKE $${values.length}
                    OR j.description ILIKE $${values.length}
                    OR ep.company_name ILIKE $${values.length}
                )
            `;
        }

        if (location && location.trim()) {
            values.push(`%${location.trim()}%`);
            query += ` AND j.location ILIKE $${values.length}`;
        }

        if (employment_type && employment_type.trim()) {
            values.push(employment_type.trim());
            query += ` AND j.employment_type = $${values.length}`;
        }

        query += ' ORDER BY j.created_at DESC';

        const result = await pool.query(query, values);

        res.json({
            success: true,
            jobs: result.rows
        });
    } catch (error) {
        console.error('Find jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch jobs'
        });
    }
});

// GET: View one open job by ID
router.get('/:id', async (req, res) => {
    try {
        const jobId = Number(req.params.id);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const result = await pool.query(
            `SELECT
                j.*,
                ep.company_name,
                ep.company_location
             FROM jobs j
             LEFT JOIN employer_profiles ep
                ON ep.user_id = j.employer_id
             WHERE j.id = $1 AND j.status = 'open'`,
            [jobId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.json({
            success: true,
            job: result.rows[0]
        });
    } catch (error) {
        console.error('Job details error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch job details'
        });
    }
});

// POST: Employer creates a job
router.post('/', requireEmployer, async (req, res) => {
    try {
        const {
            title,
            description,
            location,
            employment_type,
            salary_min,
            salary_max,
            status
        } = req.body;

        if (
            !title ||
            !title.trim() ||
            !description ||
            !description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Job title and description are required'
            });
        }

        const salary = validateSalary(salary_min, salary_max);

        if (!salary.valid) {
            return res.status(400).json({
                success: false,
                message: 'Please enter valid salary values. Maximum salary must not be less than minimum salary.'
            });
        }

        const jobStatus = status || 'open';

        if (!['open', 'closed', 'draft'].includes(jobStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job status'
            });
        }

        const result = await pool.query(
            `INSERT INTO jobs (
                employer_id,
                title,
                description,
                location,
                employment_type,
                salary_min,
                salary_max,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                req.user.userId,
                title.trim(),
                description.trim(),
                location?.trim() || null,
                employment_type?.trim() || null,
                salary.min,
                salary.max,
                jobStatus
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job: result.rows[0]
        });
    } catch (error) {
        console.error('Post job error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to post job'
        });
    }
});

// PUT: Employer edits their own job
router.put('/:id', requireEmployer, async (req, res) => {
    try {
        const jobId = Number(req.params.id);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const {
            title,
            description,
            location,
            employment_type,
            salary_min,
            salary_max,
            status
        } = req.body;

        if (
            !title ||
            !title.trim() ||
            !description ||
            !description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Job title and description are required'
            });
        }

        const salary = validateSalary(salary_min, salary_max);

        if (!salary.valid) {
            return res.status(400).json({
                success: false,
                message: 'Please enter valid salary values. Maximum salary must not be less than minimum salary.'
            });
        }

        if (!['open', 'closed', 'draft'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job status'
            });
        }

        const result = await pool.query(
            `UPDATE jobs
             SET
                title = $1,
                description = $2,
                location = $3,
                employment_type = $4,
                salary_min = $5,
                salary_max = $6,
                status = $7
             WHERE id = $8 AND employer_id = $9
             RETURNING *`,
            [
                title.trim(),
                description.trim(),
                location?.trim() || null,
                employment_type?.trim() || null,
                salary.min,
                salary.max,
                status,
                jobId,
                req.user.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or you do not have permission to edit it'
            });
        }

        res.json({
            success: true,
            message: 'Job updated successfully',
            job: result.rows[0]
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to update job'
        });
    }
});

// PATCH: Employer changes the status of their own job
router.patch('/:id/status', requireEmployer, async (req, res) => {
    try {
        const jobId = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        if (!['open', 'closed', 'draft'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be open, closed, or draft'
            });
        }

        const result = await pool.query(
            `UPDATE jobs
             SET status = $1
             WHERE id = $2 AND employer_id = $3
             RETURNING *`,
            [status, jobId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or you do not have permission to update it'
            });
        }

        res.json({
            success: true,
            message: 'Job status updated successfully',
            job: result.rows[0]
        });
    } catch (error) {
        console.error('Update job status error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to update job status'
        });
    }
});

// DELETE: Employer deletes their own job
router.delete('/:id', requireEmployer, async (req, res) => {
    try {
        const jobId = Number(req.params.id);

        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const result = await pool.query(
            `DELETE FROM jobs
             WHERE id = $1 AND employer_id = $2
             RETURNING id`,
            [jobId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error('Delete job error:', error);

        if (error.code === '23503') {
            return res.status(409).json({
                success: false,
                message: 'This job has applications and cannot be deleted. Please close the job instead.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Unable to delete job'
        });
    }
});

module.exports = router;