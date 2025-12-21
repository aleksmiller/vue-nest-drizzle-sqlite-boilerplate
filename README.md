# NextJS + Drizzle ORM + SQLite Boilerplate

A starter project for building fullstack NextJS application, using Drizzle ORM for database interactions with SQLite.

## Features
- NextJS
- Drizzle ORM
- SQLite

## Prerequisites

- Node.js (v18 or higher recommended)

## Setup

1.  **Clone/Download:** Get the code onto your local machine.
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment:**
    - Rename or copy `.env.example` to `.env.local` (or create `.env.local` manually).
    - Update the variables in `.env.local`:
        - `DATABASE_PATH`: Path to your SQLite database file (e.g., `./db/sqlite.db`). It will be created if it doesn't exist on first run or migration.
4.  **Generate Initial Migration (if schema exists):**
    - Make sure your database schema is defined in `./db/schema.ts`.
    - Run the generation command:
        ```bash
        npm run db:generate
        ```
5.  **Run Migrations:**
    - Apply the generated migrations to create the database tables:
        ```bash
        npm run db:migrate
        ```
6.  **Run Drizzle Studio:**
    - Run studio:
        ```bash
        npm run db:studio
        ```
    - Open [https://local.drizzle.studio/](https://local.drizzle.studio/)
## Running the App

```bash
npm run dev
```

Open your browser to `http://localhost:3000`.

Test:

Registration (/register).

Login (/login).

Accessing protected profile page (/profile) after login.

Updating profile information.

Signing out.

Attempting to access /profile when not logged in (should redirect to /login).

Input validation on forms and API errors.

This provides a comprehensive boilerplate. You can further enhance it with more detailed error messages, loading states, email verification, password reset, social logins, etc. Remember to keep your dependencies updated and follow security best practices.