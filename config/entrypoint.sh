#!/bin/sh
set -e

echo "waiting for database..."
while ! nc -z database-mouts 5432; do
  sleep 1
done

echo "connected! running migrations..."
npx prisma migrate deploy
npx prisma db seed

echo "Running E2E tests..."
exec "$@"
