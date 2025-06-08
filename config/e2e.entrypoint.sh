#!/bin/sh
set -e

echo "waiting for database..."
while ! nc -z test-database-mouts 5432; do
  sleep 1
done

echo "connected! running migrations..."
npx prisma migrate deploy

echo "Running E2E tests..."
exec "$@"
