const pool = require('./db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function createUser(username, password) {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    await pool.query(
        `INSERT INTO users (
            username,
            password_hash
        ) VALUES (
            $1,
            $2
        )`,
        [
            username,
            passwordHash
        ]
    );
}

async function getUsers() {
    const data = await pool.query('SELECT * FROM users');
    return data.rows;
}

async function deleteUser(id) {
    return await pool.query(
        `DELETE FROM users
            WHERE id = $1`,
        [id]
    );
}

module.exports = {
    createUser,
    getUsers,
    deleteUser
};