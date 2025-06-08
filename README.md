Mouts Api

Prerequisites

- Docker
- Node.js 22+
- Make utility (optional, for convenience commands)

Installation

1. Clone the repository

git clone <repository-url>
cd <repository-directory>

2. Create environment configuration
- Copy the example environment file

cp config/.example.env config/.env

- If you plan to run E2E tests on a separate environment, also create

cp config/.example.env config/.e2e.env

- If you plan to run and test locally, also create

cp config/.example.env config/.local.env

or make env with make utility:

make env

(for testing purposes i will share this .env .e2e.env .local.env to facilitate your experience:

// .env
POSTGRES_DB="mouts"
POSTGRES_USER="mouts"
POSTGRES_PASSWORD="06pOsopkEIehgez6th6Hh7Vx1b2FQuq0"

REDIS_HOST=cache-mouts
REDIS_PORT=6379
REDIS_TTL=60

DATABASE_URL="postgresql://mouts:06pOsopkEIehgez6th6Hh7Vx1b2FQuq0@database-mouts:5432/mouts?schema=public"

JWT_SECRET="ldC62rkdvIuVhe8XdavszyUwKvt7T0CF"

PORT=3001

// .e2e.env
POSTGRES_DB="test-mouts"
POSTGRES_USER="test-mouts"
POSTGRES_PASSWORD="06pOsopkEIehgez6th6Hh7Vx1b2FQuq0"

REDIS_HOST=test-cache-mouts
REDIS_PORT=6379
REDIS_TTL=60

DATABASE_URL="postgresql://test-mouts:06pOsopkEIehgez6th6Hh7Vx1b2FQuq0@test-database-mouts:5432/test-mouts?schema=public"

JWT_SECRET="ldC62rkdvIuVhe8XdavszyUwKvt7T0CF"
JWT_REFRESH_SECRET="mO7YnMcsduNy3MBBb7dPDkJvH1ad666V"

PORT=3001

// .local.env
POSTGRES_DB="mouts"
POSTGRES_USER="mouts"
POSTGRES_PASSWORD="06pOsopkEIehgez6th6Hh7Vx1b2FQuq0"

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=60

DATABASE_URL="postgresql://mouts:06pOsopkEIehgez6th6Hh7Vx1b2FQuq0@localhost:5432/mouts?schema=public"

JWT_SECRET="ldC62rkdvIuVhe8XdavszyUwKvt7T0CF"

PORT=3001
)

3. Install dependencies

npm install

Development

- I configured two ways to run the project, (it is not possible to run both forms at the same time, you must turn off the container to change the form)
the first one being with docker (.env file must be configured):

docker compose -f docker/docker-compose.yml -p api-mouts up -d

or with make:

make up

- the second way is to run postgres and redis locally and run the api through node (.local.env must be configured):

docker compose -f docker/local.docker-compose.yml -p api-mouts up -d
npx dotenv -e config/.local.env -- npx prisma migrate dev
npx dotenv -e config/.local.env -- npx prisma db seed
npx dotenv -e config/.local.env -- npm run start:dev

or with make:

make up-local
make migrate
make seed
make dev

- the default admin user in seed is admin@mouts.com / 12345

Testing

- I also configured two ways to run the e2e tests, the first being in an isolated environment with docker:

docker compose -f docker/e2e.docker-compose.yml -p test-api-mouts-v2 up --build --abort-on-container-exit test-api-mouts && docker compose -f docker/e2e.docker-compose.yml -p test-api-mouts-v2 down --volumes

or with make:

make e2e

I also configured two ways to run the e2e tests, the first being in an isolated environment with docker:

it will bring up the database, run the migrations, and the tests configured in /test

- or if using local configuration:

docker compose -f docker/local.docker-compose.yml -p api-mouts up -d
npx dotenv -e config/.local.env -- npx prisma migrate dev
npx dotenv -e config/.local.env -- npm run test:e2e

or with make:

make up-local
make migrate
make e2e-local
