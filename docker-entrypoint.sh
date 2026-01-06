#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
npx drizzle-kit push

# Start the application
echo "Starting application..."
exec node server.js
