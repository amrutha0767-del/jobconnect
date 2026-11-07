
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Database connection
const pool = require('./db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobsRoutes = require('./routes/jobsRoutes');
const applicationsRoutes = require('./routes/applicationsRoutes');
const employerProfileRoutes = require('./routes/employerProfileRoutes');

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to JobConnect API'
    });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            success: true,
            message: 'PostgreSQL connected successfully',
            time: result.rows[0].now
        });

    } catch (error) {
        console.error('Database connection error:', error);

        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Job seeker profile routes
app.use('/api/profile', profileRoutes);

// Resume upload, download and delete routes
app.use('/api/resume', resumeRoutes);

// Job posting and job search routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/employer-profile', employerProfileRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);

    res.status(error.status || 500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`JobConnect server running on port ${PORT}`);
});
