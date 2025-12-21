import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';

// Load .env file from server directory
// Try multiple paths to handle both development (ts-node) and production (compiled) scenarios
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

if (!process.env.DATABASE_PATH) {
  throw new Error('❌ DATABASE_PATH environment variable is not set.');
}

const sqlite = new Database(process.env.DATABASE_PATH);
export const db = drizzle(sqlite, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
