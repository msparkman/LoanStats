const express = require('express')
const pool = require('./db')
const port = 13000

const app = express()
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Client: ${req.ip}`)
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log(`[${new Date().toISOString()}] Request headers:`, {
            'content-type': req.get('content-type'),
            'user-agent': req.get('user-agent'),
            'origin': req.get('origin')
        })
    }
    next()
})

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
})

//routes
app.get('/', async (req, res) => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] GET / - Fetching all loans`)
    try {
        const data = await pool.query('SELECT * FROM loans')
        
        // Map database column names to camelCase for frontend
        const mappedLoans = data.rows.map(loan => ({
            id: loan.id,
            name: loan.name,
            principal: loan.principal,
            rate: loan.rate,
            termYears: loan.termyears,
            monthlyPayment: loan.monthlypayment,
            extraPrincipalPayment: loan.extramonthlypayment
        }))
        
        const duration = Date.now() - startTime
        console.log(`[${new Date().toISOString()}] GET / - Found ${data.rows.length} loans (${duration}ms)`)
        res.status(200).send({ loan: mappedLoans })
    } catch (err) {
        const duration = Date.now() - startTime
        console.error(`[${new Date().toISOString()}] GET / - Database error after ${duration}ms:`, err.message)
        res.sendStatus(500)
    }
})

app.post('/', async (req, res) => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] POST / - Creating new loan | Request body:`, JSON.stringify(req.body, null, 2))
    
    const { 
        name, 
        principal,
        rate,
        termYears,
        monthlyPayment,
        extraMonthlyPayment 
    } = req.body
    
    // Validate required fields
    if (!name || !principal || !rate) {
        const duration = Date.now() - startTime
        console.log(`[${new Date().toISOString()}] POST / - Validation failed after ${duration}ms: Missing required fields`)
        return res.status(400).send({ message: "Name, principal, and rate are required" })
    }

    console.log(`[${new Date().toISOString()}] POST / - Validation passed, inserting loan: ${name}`)
    
    try {
        await pool.query(
            `INSERT INTO loans (
                name, 
                principal,
                rate,
                termYears,
                monthlyPayment,
                extraMonthlyPayment
            ) VALUES (
                $1, 
                $2,
                $3,
                $4,
                $5,
                $6)`, 
            [
                name, 
                principal,
                rate,
                termYears,
                monthlyPayment,
                extraMonthlyPayment || 0]
            )
        const duration = Date.now() - startTime
        console.log(`[${new Date().toISOString()}] POST / - Successfully saved loan: ${name} (${duration}ms)`)
        res.status(200).send({ message: "Successfully added loan" })
    } catch (err) {
        const duration = Date.now() - startTime
        console.error(`[${new Date().toISOString()}] POST / - Database error after ${duration}ms:`, err.message)
        console.error(`[${new Date().toISOString()}] POST / - Error code:`, err.code)
        
        // Handle duplicate name error (PostgreSQL error code 23505)
        if (err.code === '23505' && err.constraint === 'loans_name_key') {
            console.log(`[${new Date().toISOString()}] POST / - Duplicate loan name rejected: ${name}`)
            res.status(409).send({ message: `A loan with the name "${name}" already exists. Please choose a different name.` })
        } else {
            console.error(`[${new Date().toISOString()}] POST / - Full error:`, err)
            res.status(500).send({ message: "Error saving loan: " + err.message })
        }
    }
})

app.delete('/clear', async (req, res) => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] DELETE /clear - Clearing all loans from database`)
    try {
        const result = await pool.query('DELETE FROM loans')
        const duration = Date.now() - startTime
        console.log(`[${new Date().toISOString()}] DELETE /clear - Cleared ${result.rowCount} loans (${duration}ms)`)
        res.status(200).send({ message: `Successfully cleared ${result.rowCount} loans from database` })
    } catch (err) {
        const duration = Date.now() - startTime
        console.error(`[${new Date().toISOString()}] DELETE /clear - Database error after ${duration}ms:`, err.message)
        console.error(`[${new Date().toISOString()}] DELETE /clear - Full error:`, err)
        res.status(500).send({ message: "Error clearing loans: " + err.message })
    }
})

app.get('/setup', async (req, res) => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] GET /setup - Setting up database table`)
    try {
        // Drop table if it exists and recreate with UNIQUE constraint
        await pool.query('DROP TABLE IF EXISTS loans')
        console.log(`[${new Date().toISOString()}] GET /setup - Dropped existing table`)
        
        await pool.query(
        `CREATE TABLE loans( 
            id SERIAL PRIMARY KEY, 
            name VARCHAR(100) NOT NULL UNIQUE, 
            principal INT NOT NULL CHECK(principal > 0),
            rate NUMERIC CHECK(rate > 0),
            termYears SMALLINT,
            monthlyPayment NUMERIC,
            extraMonthlyPayment NUMERIC DEFAULT 0
            )`
        )
        const duration = Date.now() - startTime
        console.log(`[${new Date().toISOString()}] GET /setup - Database table setup completed successfully (${duration}ms)`)
        res.status(200).send({ message: "Successfully created loans table with unique name constraint" })
    } catch (err) {
        const duration = Date.now() - startTime
        console.error(`[${new Date().toISOString()}] GET /setup - Database setup error after ${duration}ms:`, err.message)
        console.error(`[${new Date().toISOString()}] GET /setup - Full error:`, err)
        res.status(500).send({ message: "Error setting up database: " + err.message })
    }
})

app.listen(port, () => {
    console.log(`[${new Date().toISOString()}] Server has started on port ${port}`)
    console.log(`[${new Date().toISOString()}] Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`[${new Date().toISOString()}] Database host: ${process.env.DB_HOST || 'localhost'}`)
    console.log(`[${new Date().toISOString()}] Database port: ${process.env.DB_PORT || 5433}`)
})