#!/bin/sh
set -e

# Apply database migrations via Drizzle's programmatic migrator (idempotent,
# journal-aware). Compiled from db/migrate.ts.
echo "Running database migrations..."
node dist/db/migrate.js

# Start the application
exec node dist/src/main.js
