import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as path from 'path';
import { db } from './drizzle';

/**
 * Apply pending Drizzle migrations using the journal in db/migrations/meta.
 * Idempotent: drizzle tracks applied migrations in the __drizzle_migrations table.
 * Run via `node dist/db/migrate.js` (see docker-entrypoint.sh) or `npm run db:migrate:run`.
 */
const migrationsFolder = path.resolve(process.cwd(), 'db', 'migrations');

migrate(db, { migrationsFolder });
console.log(`✅ Migrations applied from ${migrationsFolder}`);
