.PHONY: down
down:
	docker compose -f docker/docker-compose.yml -p api-mouts down --volumes --remove-orphans

.PHONY: up
up:
	docker compose -f docker/docker-compose.yml -p api-mouts up -d

.PHONY: up-local
up-local:
	docker compose -f docker/local.docker-compose.yml -p api-mouts up -d

.PHONY: down-local
down-local:
	docker compose -f docker/local.docker-compose.yml -p api-mouts down --volumes --remove-orphans

.PHONY: migrate
migrate:
	npx dotenv -e config/.local.env -- npx prisma migrate dev

.PHONY: reset
reset:
	npx dotenv -e config/.local.env -- npx prisma migrate reset

.PHONY: seed
seed:
	npx dotenv -e config/.local.env -- npx prisma db seed

.PHONY: e2e-local
e2e-local:
	npx dotenv -e config/.local.env -- npm run test:e2e

.PHONY: dev
dev:
	npx dotenv -e config/.local.env -- npm run start:dev

.PHONY: e2e
e2e:
	docker compose -f docker/e2e.docker-compose.yml -p test-api-mouts-v2 up --build --abort-on-container-exit test-api-mouts && docker compose -f docker/e2e.docker-compose.yml -p test-api-mouts-v2 down --volumes

.PHONY: env
env:
	cp config/.example.env config/.local.env && cp config/.example.env config/.e2e.env && cp config/.example.env config/.env