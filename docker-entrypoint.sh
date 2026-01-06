#!/bin/sh
set -e

# Run database migrations from /migrations directory
echo "Running database migrations..."
cd /migrations && npx drizzle-kit push --config=/app/drizzle.config.ts
cd /app

# Start the application
echo "Starting application..."
exec node server.js
