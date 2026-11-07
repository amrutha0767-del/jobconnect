
const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

// Only employers can access company profiles
router.use((req, res, next) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({
            success: false,
            message: 'Only employers can access company profiles.'
        });
    }
    next();
});

// GET Company Profile
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT company_name, company_location,
                    company_description, website
             FROM employer_profiles
             WHERE user_id = $1`,
            [req.user.userId]
        );

        res.json({
            success: true,
            profile: result.rows[0] || null
        });

    } catch (error) {
        console.error('Company profile error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Unable to retrieve company profile.'
        });
    }
});

// CREATE OR UPDATE Company Profile
router.put('/', async (req, res) => {
    const {
        company_name,
        company_location,
        company_description,
        website
    } = req.body;

    if (!company_name || !company_name.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Company name is required.'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO employer_profiles
                (user_id, company_name, company_location,
                 company_description, website)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id)
             DO UPDATE SET
                company_name = EXCLUDED.company_name,
                company_location = EXCLUDED.company_location,
                company_description = EXCLUDED.company_description,
                website = EXCLUDED.website
             RETURNING *`,
            [
                req.user.userId,
                company_name.trim(),
                company_location || '',
                company_description || '',
                website || ''
            ]
        );

        res.json({
            success: true,
            message: 'Company profile saved successfully!',
            profile: result.rows[0]
        });

    } catch (error) {
        console.error('Company profile update error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Unable to save company profile.'
        });
    }
});

module.exports = router;
