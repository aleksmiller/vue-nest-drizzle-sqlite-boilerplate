import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// In development, load `.env` from the working directory (the server/ folder).
// This must happen here because this module runs at import time, before Nest's
// ConfigModule initializes. In production, env vars come from the container.
if (process.env.NODE_ENV !== 'production') {
  try {
    // dotenv is a devDependency; ignore if it isn't installed.
    require('dotenv').config();
  } catch {
    // Not available — rely on env vars already present in the environment.
  }
}

if (!process.env.DATABASE_PATH) {
  throw new Error('❌ DATABASE_PATH environment variable is not set.');
}

const sqlite = new Database(process.env.DATABASE_PATH);
export const db = drizzle(sqlite, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
