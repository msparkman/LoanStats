# LoanStats

A comprehensive loan calculator and management application built with Angular and Node.js. Calculate loan payments and manage multiple loan scenarios.

## Features

- 🧮 **Loan Calculator**: Calculate monthly payments, interest, and payoff schedules
- 💾 **Save & Load Loans**: Store multiple loan scenarios with unique names
- 📊 **Payment Schedule**: View detailed month-by-month payment breakdowns
- 💰 **Extra Payments**: Calculate the impact of additional principal payments
- 🎯 **Flexible Input**: Calculate by term length OR monthly payment amount

## Tech Stack

- **Frontend**: Angular 15, TypeScript, CSS3
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/msparkman/LoanStats.git
   cd LoanStats
   ```

2. **Start all services**
   ```bash
   docker compose up --build
   ```

3. **Setup the database**
   ```bash
   curl http://localhost:13000/setup
   ```

4. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:13000

### Option 2: Local Development

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/msparkman/LoanStats.git
   cd LoanStats
   npm install
   cd server && npm install && cd ..
   ```

2. **Start PostgreSQL database**
   ```bash
   docker compose up db -d
   ```

3. **Start the backend**
   ```bash
   cd server
   npm start
   ```

4. **Start the frontend** (in new terminal)
   ```bash
   npm start
   ```

5. **Setup the database**
   ```bash
   curl http://localhost:13000/setup
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all saved loans |
| POST | `/` | Save a new loan |
| GET | `/setup` | Create/reset the database table |

### Example API Usage

**Save a loan:**
```bash
curl -X POST http://localhost:13000/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home Loan",
    "principal": 300000,
    "rate": 3.5,
    "termYears": 30,
    "extraMonthlyPayment": 100
  }'
```

**Get all loans:**
```bash
curl http://localhost:13000/
```

## Configuration

### Environment Variables

**Backend (.env or docker-compose.yaml):**
- `DB_HOST`: Database host (default: `localhost` or `db` in Docker)
- `DB_PORT`: Database port (default: `5433` local, `5432` in Docker)
- `PORT`: Server port (default: `13000`)

### Database Schema

```sql
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    principal INT NOT NULL CHECK(principal > 0),
    rate NUMERIC CHECK(rate > 0),
    termYears SMALLINT,
    monthlyPayment NUMERIC,
    extraMonthlyPayment NUMERIC DEFAULT 0
);
```

## Development

### Frontend Development
```bash
npm start              # Start dev server on :4200
npm run build          # Build for production
npm test               # Run unit tests
```

### Backend Development
```bash
cd server
npm start              # Start server on :13000
npm run dev            # Start with nodemon (if configured)
```

### Docker Development
```bash
docker compose up --build     # Build and start all services
docker compose up db -d       # Start only database
docker compose logs backend   # View backend logs
docker compose down           # Stop all services
```

## Testing the API

Use the included REST client file at `server/test.rest` with VS Code REST Client extension, or use curl commands as shown above.

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find and kill process using port 13000
lsof -ti:13000 | xargs kill

# Or use different port in docker-compose.yaml
```

**Database connection issues:**
```bash
# Check if database is running
docker ps | grep postgres

# Reset database
curl http://localhost:13000/setup
```

**Frontend not loading:**
```bash
# Clear Angular cache
rm -rf .angular/cache
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.