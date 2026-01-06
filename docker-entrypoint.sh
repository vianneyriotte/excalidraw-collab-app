#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
./node_modules/.bin/drizzle-kit push

# Start the application
echo "Starting application..."
exec node server.js
