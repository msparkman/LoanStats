const express = require('express')
const pool = require('./db')
const port = 3000

const app = express()
app.use(express.json())

//routes
app.get('/', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM loans')
        res.status(200).send({ loan: data.rows })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.post('/', async (req, res) => {
    const { 
        name, 
        principal,
        rate,
        termYears,
        monthlyPayment,
        extraMonthlyPayment 
    } = req.body
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
                extraMonthlyPayment]
            )
        res.status(200).send({ message: "Successfully added loan" })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.get('/setup', async (req, res) => {
    try {
        await pool.query(
        `CREATE TABLE loans( 
            id SERIAL PRIMARY KEY, 
            name VARCHAR(100) NOT NULL, 
            principal INT NOT NULL CHECK(principal > 0),
            rate NUMERIC CHECK(rate > 0),
            termYears SMALLINT CHECK(termYears > 0),
            monthlyPayment NUMERIC CHECK(monthlyPayment > 0),
            extraMonthlyPayment NUMERIC CHECK(extraMonthlyPayment > 0)
            )`
        )
        res.status(200).send({ message: "Successfully created loans table" })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.listen(port, () => console.log(`Server has started on port ${port}`))