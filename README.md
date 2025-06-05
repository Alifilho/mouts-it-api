# Mouts-IT API

A Node.js + Prisma-based REST API for Mouts-IT, containerized with Docker Compose for local development and end-to-end testing.

## Features

- RESTful endpoints (see [src/routes](src/routes) for details)  
- Database migrations & seeding with Prisma  
- Local development in Docker containers  
- Hot-reload development mode  
- End-to-end tests in isolated Docker environment  

## Prerequisites

- Docker & Docker Compose (v2+)  
- Node.js (v16+) & npm (v8+)  
- `make` utility  
- [npx dotenv](https://www.npmjs.com/package/dotenv) (installed via npm)  

## Installation

1. Clone the repo  
   ```bash
   git clone https://github.com/your-org/mouts-it.git
   cd mouts-it
   ```

2. Copy environment variables  
   ```bash
   cp config/.env.example config/.env
   # Edit config/.env to match your local settings
   ```

3. Install dependencies  
   ```bash
   npm install
   ```

## Configuration

All runtime environment variables live in `config/.env`. Typical variables:

```dotenv
DATABASE_URL="postgresql://user:pass@db:5432/mouts_it?schema=public"
PORT=3000
JWT_SECRET=your_jwt_secret
# ...other settings
```

## Development

Bring up local services, database, etc.:

```bash
make up
```

Run database migrations:

```bash
make migrate
```

Start the app in hot-reload mode:

```bash
make dev
```

Browse to http://localhost:3000 (or the port you configured).

### Resetting the Database

To drop all data and re-apply migrations:

```bash
make reset
```

### Stopping & Cleaning Up

```bash
make down
```

## End-to-End Testing

Spins up a fresh environment, runs the `test-api-mouts` container suite, then tears it down:

```bash
make e2e
```

Test reports and logs will be output in your terminal.

## Scripts Reference

- `npm run start:dev` – start in development mode (hot-reload)  
- `npx dotenv -e config/.env -- npx prisma migrate dev` – apply new migrations  
- `npx dotenv -e config/.env -- npx prisma migrate reset` – reset database  

All the above are wrapped in Makefile targets (`up`, `down`, `migrate`, `reset`, `dev`, `e2e`).

## Project Structure

```
mouts-it/
├── config/                # Environment config
│   └── .env.example
├── docker/                # Docker Compose files
│   ├── local.docker-compose.yml
│   └── e2e.docker-compose.yml
├── prisma/                # Prisma schema & migrations
├── src/                   # Application source code
│   ├── controllers/
│   ├── services/
│   └── routes/
├── tests/                 # (Optional) unit & integration tests
├── Makefile               # Development & test automation
├── package.json
└── tsconfig.json
```

## License

MIT © Your Company Name