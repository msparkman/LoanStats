const request = require('supertest');
const pool = require('./db');
const app = require('./server');

// Mock the database module
jest.mock('./db', () => ({
    query: jest.fn(),
}));

describe('LoanStats API', () => {
    // Reset mocks before each test
    beforeEach(() => {
        pool.query.mockClear();
    });

    describe('GET /', () => {
        it('should fetch all loans and return them in camelCase', async () => {
            const mockLoans = [
                {
                    id: 1,
                    name: 'Home Loan',
                    principal: 300000,
                    rate: '3.5',
                    termyears: 30,
                    monthlypayment: '1347.13',
                    extramonthlypayment: '100'
                }
            ];
            pool.query.mockResolvedValue({ rows: mockLoans });

            const res = await request(app).get('/');

            expect(res.statusCode).toEqual(200);
            expect(res.body.loan).toEqual([
                {
                    id: 1,
                    name: 'Home Loan',
                    principal: 300000,
                    rate: '3.5',
                    termYears: 30,
                    monthlyPayment: '1347.13',
                    extraPrincipalPayment: '100'
                }
            ]);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM loans');
        });

        it('should return 500 on database error', async () => {
            pool.query.mockRejectedValue(new Error('DB connection failed'));

            const res = await request(app).get('/');

            expect(res.statusCode).toEqual(500);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM loans');
        });
    });

    describe('POST /', () => {
        const newLoan = {
            name: 'Car Loan',
            principal: 25000,
            rate: 4.5,
            termYears: 5,
            monthlyPayment: 466.09,
            extraMonthlyPayment: 50
        };

        it('should create a new loan successfully', async () => {
            pool.query.mockResolvedValue({ rowCount: 1 });

            const res = await request(app)
                .post('/')
                .send(newLoan);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Successfully added loan' });
            expect(pool.query).toHaveBeenCalledTimes(1);

            const [query, params] = pool.query.mock.calls[0];
            expect(query.replace(/\s+/g, ' ').trim()).toContain("INSERT INTO loans");
            expect(params).toEqual([
                newLoan.name,
                newLoan.principal,
                newLoan.rate,
                newLoan.termYears,
                newLoan.monthlyPayment,
                newLoan.extraMonthlyPayment
            ]);
        });

        it('should default extraMonthlyPayment to 0 if not provided', async () => {
            const { extraMonthlyPayment, ...loanWithoutExtra } = newLoan;
            pool.query.mockResolvedValue({ rowCount: 1 });

            await request(app)
                .post('/')
                .send(loanWithoutExtra);

            const [, params] = pool.query.mock.calls[0];
            expect(params[5]).toBe(0);
        });

        it('should return 400 if required fields are missing', async () => {
            const incompleteLoan = { name: 'Incomplete', principal: 1000 }; // Missing rate
            const res = await request(app)
                .post('/')
                .send(incompleteLoan);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: 'Name, principal, and rate are required' });
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('should return 409 if loan name already exists', async () => {
            const duplicateError = new Error('duplicate key value violates unique constraint "loans_name_key"');
            duplicateError.code = '23505';
            duplicateError.constraint = 'loans_name_key';
            pool.query.mockRejectedValue(duplicateError);

            const res = await request(app)
                .post('/')
                .send(newLoan);

            expect(res.statusCode).toEqual(409);
            expect(res.body).toEqual({ message: `A loan with the name "${newLoan.name}" already exists. Please choose a different name.` });
        });

        it('should return 500 on other database errors', async () => {
            const dbError = new Error('Some other DB error');
            pool.query.mockRejectedValue(dbError);

            const res = await request(app)
                .post('/')
                .send(newLoan);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: `Error saving loan: ${dbError.message}` });
        });
    });

    describe('DELETE /loans/:id', () => {
        it('should delete a loan successfully', async () => {
            pool.query.mockResolvedValue({ rowCount: 1 });

            const res = await request(app).delete('/loans/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Successfully deleted loan with ID 1' });
            expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/DELETE FROM loans/), [1]);
        });

        it('should return 500 on database error', async () => {
            const dbError = new Error('Deletion failed');
            pool.query.mockRejectedValue(dbError);

            const res = await request(app).delete('/loans/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: `Error deleting loan: ${dbError.message}` });
        });
    });

    describe('GET /setup', () => {
        it('should drop and create the loans table', async () => {
            pool.query.mockResolvedValue({}); // Mock a successful query for both calls

            const res = await request(app).get('/setup');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Successfully created loans table with unique name constraint' });
            expect(pool.query).toHaveBeenCalledWith('DROP TABLE IF EXISTS loans');
            expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/CREATE TABLE loans/));
            expect(pool.query).toHaveBeenCalledTimes(2);
        });

        it('should return 500 if creating table fails', async () => {
            const dbError = new Error('CREATE failed');
            pool.query
                .mockResolvedValueOnce({}) // for DROP
                .mockRejectedValueOnce(dbError); // for CREATE

            const res = await request(app).get('/setup');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: `Error setting up database: ${dbError.message}` });
            expect(pool.query).toHaveBeenCalledTimes(2);
        });
    });

    describe('CORS Middleware', () => {
        it('should handle OPTIONS request and return 200', async () => {
            const res = await request(app).options('/');
            expect(res.statusCode).toEqual(200);
            expect(res.headers['access-control-allow-origin']).toBe('*');
            expect(res.headers['access-control-allow-methods']).toBe('GET, POST, PUT, DELETE, OPTIONS');
        });
    });
});