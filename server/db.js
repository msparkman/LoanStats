const { Pool } = require('pg')
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: 'user123',
    password: 'password123',
    database: 'db123'
})

module.exports = pool