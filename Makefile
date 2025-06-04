.PHONY: down
down:
	docker compose -f docker/local.docker-compose.yml -p api-mouts down --volumes --remove-orphans

.PHONY: up
up:
	docker compose -f docker/local.docker-compose.yml -p api-mouts up -d

.PHONY: migrate
migrate:
	npx dotenv -e config/.env -- npx prisma migrate dev

.PHONY: dev
dev:
	npm run start:dev

.PHONY: e2e
e2e:
	npx dotenv -e config/.env -- npm run test:e2e

