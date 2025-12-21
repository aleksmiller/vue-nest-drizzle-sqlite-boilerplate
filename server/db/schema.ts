import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm"; // For SQL functions like default timestamps

export const usersTable = sqliteTable("users", {
  id: text("id").notNull().primaryKey(), // Lucia expects id to be string for adaptability
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const sessionsTable = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }), // Important for data integrity
  expiresAt: integer("expires_at").notNull(),
});

export const userProfilesTable = sqliteTable("user_profiles", {
  userId: text("user_id")
    .notNull()
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdate(() => new Date()), // Automatically update timestamp on record update
});

// Types for Lucia adapter and user attributes
export type UserSchema = typeof usersTable.$inferSelect;
export type SessionSchema = typeof sessionsTable.$inferSelect;
export type UserProfileSchema = typeof userProfilesTable.$inferSelect;
