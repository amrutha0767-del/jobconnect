
const { Pool } = require('pg');
require('dotenv').config();
console.log('Neon DATABASE_URL detected:', Boolean(process.env.DATABASE_URL));

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })
    : new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

pool.on('connect', () => {
    console.log('PostgreSQL database connected successfully!');
});

pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL error:', error.message);
});

module.exports = pool;
