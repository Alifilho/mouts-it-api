.PHONY: down
down:
	docker compose -f docker/local.docker-compose.yml -p api-mouts down --volumes --remove-orphans

.PHONY: up
up:
	docker compose -f docker/local.docker-compose.yml -p api-mouts up -d
