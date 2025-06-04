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
	docker compose -f docker/e2e.docker-compose.yml -p test-api-mouts-v2 up --build --abort-on-container-exit test-api-mouts && docker compose -f docker/e2e.docker-compose.yml -p test-api-mouts-v2 down --volumes

