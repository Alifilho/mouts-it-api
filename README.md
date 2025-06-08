# Mouts API

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Installation](#installation)  
4. [Environment](#environment)  
5. [Running the App](#running-the-app)  
6. [Testing](#testing)  
7. [Default Credentials](#default-credentials)
8. [Commits](#commits)
9. [Contact/Support](#contact--support)

## Prerequisites
- Docker  
- Node.js v22 or higher  
- Make utility (optional, for convenience)

## Tech Stack & Architecture

This API is built with:

- NestJS (TypeScript) for the backend framework
- Prisma ORM for database access
- PostgreSQL as the primary datastore
- Redis for caching
- Docker for containerization
- Winston for structured logging
- Jest for testing
- dotenv for configuration management
- ESLint for linting
- Make for task utility

The application follows a modular architecture:

- Controllers handle HTTP requests
- Services contain business logic
- Data-access layer uses Prisma
- Authentication with JWT tokens
- Cache layer via NestJS’s cache-manager and Redis

## Installation
```bash
    git clone https://github.com/Alifilho/mouts-it-api && cd mouts-it-api
    npm install
```

## Environment

### Environment Variables
- `POSTGRES_DB` — database name  
- `POSTGRES_USER` — DB username  
- `POSTGRES_PASSWORD` — DB password  
- `DATABASE_URL` — full PostgreSQL connection string  
- `REDIS_HOST` — Redis host  
- `REDIS_PORT` — Redis port  
- `REDIS_TTL` — cache TTL (seconds)  
- `JWT_SECRET` — JWT signing secret  
- `JWT_REFRESH_SECRET` — (for E2E only) refresh-token secret  
- `PORT` — HTTP port (default: 3001)  

Create your `.env` files from the example:
```bash
    make env

    # or
    cp config/.example.env config/.env        # for production/dev  
    cp config/.example.env config/.local.env  # for local development  
    cp config/.example.env config/.e2e.env    # for isolated E2E testing  
```

## Running the App

### With Docker
```bash
    make up
    
    # or
    docker compose -f docker/docker-compose.yml -p api-mouts up -d
```

### Locally (Postgres + Redis on localhost)
```bash
    make up-local
    make migrate # run database migrations  
    make seed # seed default data (creates admin user) 
    make dev

    # or
    docker compose -f docker/local.docker-compose.yml -p api-mouts up -d
    npx dotenv -e config/.local.env -- npx prisma migrate dev
    npx dotenv -e config/.local.env -- npx prisma db seed
    npx dotenv -e config/.local.env -- npm run start:dev

```

Once running, access the OpenAPI (Swagger) docs at:  
    http://localhost:3001/docs   

## Testing

### E2E with Docker
```bash
    make e2e

    # or
    docker compose -f docker/e2e.docker-compose.yml -p test-api-mouts-v2 up --build --abort-on-container-exit test-api-mouts && docker compose -f docker/e2e.docker-compose.yml -p test-api-mouts-v2 down --volumes
```
This brings up an isolated test environment, runs migrations and E2E tests, then tears down the containers.

### E2E Locally
```bash
    make up-local
    make migrate
    make e2e-local

    # or
    docker compose -f docker/local.docker-compose.yml -p api-mouts up -d
    npx dotenv -e config/.local.env -- npx prisma migrate dev
    npx dotenv -e config/.local.env -- npm run test:e2e
```

## Default Credentials
After seeding, the default admin user is:  
- **Email:** admin@mouts.com  
- **Password:** 12345

## Commits

This repository follows the [Conventional Commits](https://www.conventionalcommits.org/) specification to maintain a clear, structured commit history.

## Contact / Support

For questions, bug reports, or help, please reach out to the maintainer at alissonoliveiram@gmail.com.
