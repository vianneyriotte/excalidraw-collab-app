#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
node ./node_modules/drizzle-kit/bin.cjs push

# Start the application
echo "Starting application..."
exec node server.js
