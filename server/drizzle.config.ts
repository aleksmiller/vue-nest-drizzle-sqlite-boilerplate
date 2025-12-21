import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

if (!process.env.DATABASE_PATH) {
  throw new Error("❌ DATABASE_PATH environment variable is not set.");
}

export default defineConfig({
  out: "./db/migrations",
  dialect: "sqlite",
  schema: "./db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_PATH,
  },
  strict: true,
  verbose: true,
});
