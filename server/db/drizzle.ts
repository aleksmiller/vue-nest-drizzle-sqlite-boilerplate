import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';

// Load .env file from server directory (only in development)
// In production, environment variables should be set directly (e.g., via Docker)
if (process.env.NODE_ENV !== 'production') {
  try {
    // Dynamically import dotenv only if available (devDependency)
    const dotenv = require('dotenv');
    const envPaths = [
      path.resolve(__dirname, '../../.env'), // Production: dist/db/ -> server/.env
      path.resolve(__dirname, '../.env'), // Development: db/ -> server/.env
      path.resolve(process.cwd(), '.env'), // Current working directory
    ];

    let envLoaded = false;
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        envLoaded = true;
        break;
      }
    }

    // Fallback: try loading from current directory (for when running from server/)
    if (!envLoaded) {
      dotenv.config({ path: '.env' });
    }
  } catch (error) {
    // dotenv not available (production build), skip loading .env file
    // Environment variables should be set via Docker/container environment
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
