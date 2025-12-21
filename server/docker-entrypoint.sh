#!/bin/sh
set -e

# Run database migrations if migration files exist
if [ -f "/app/db/migrations/0000_clammy_la_nuit.sql" ]; then
  echo "Running database migrations..."
  node -e "
    const Database = require('better-sqlite3');
    const dbPath = process.env.DATABASE_PATH || '/app/db/data/sqlite.db';
    const db = new Database(dbPath);
    const fs = require('fs');
    
    // Check if users table exists (simple check to see if migrations have run)
    const tables = db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' AND name='users'\").get();
    
    if (!tables) {
      console.log('Applying migrations...');
      const migrationFile = '/app/db/migrations/0000_clammy_la_nuit.sql';
      if (fs.existsSync(migrationFile)) {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        // Split by statement breakpoint and execute each statement
        const statements = sql.split('--> statement-breakpoint')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        statements.forEach(stmt => {
          if (stmt) {
            try {
              db.exec(stmt);
            } catch (err) {
              // Ignore errors if table/index already exists
              if (!err.message.includes('already exists')) {
                console.error('Migration error:', err.message);
                throw err;
              }
            }
          }
        });
        
        console.log('Migrations applied successfully');
      }
    } else {
      console.log('Migrations already applied');
    }
    db.close();
  "
fi

# Start the application
exec node dist/src/main.js
