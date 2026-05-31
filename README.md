# Vue + NestJS + Drizzle ORM + SQLite Boilerplate

A modern full-stack application boilerplate featuring:
- **Vue 3** (SPA) - Frontend with Composition API, Vue Router, and Pinia
- **NestJS** - Backend API with TypeScript
- **Drizzle ORM** - Type-safe database queries
- **SQLite** - Lightweight database
- **Lucia Auth** - Session-based authentication

## Project Structure

```
vue-drizzle-sqlite-boilerplate/
├── client/                    # Vue SPA Frontend
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/        # Vue components
│   │   ├── router/           # Vue Router config & guards
│   │   ├── stores/           # Pinia stores
│   │   ├── views/            # Page components
│   │   └── main.ts
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/             # Auth module
│   │   ├── user/             # User module
│   │   ├── database/          # Database module
│   │   └── main.ts
│   ├── db/                   # Database files
│   │   ├── schema.ts
│   │   ├── drizzle.ts
│   │   ├── migrations/
│   │   └── sqlite.db
│   ├── lib/                  # Shared libraries
│   │   ├── auth.ts
│   │   ├── lucia.ts
│   │   └── validators.ts
│   ├── drizzle.config.ts
│   └── package.json
│
├── package.json              # Root workspace scripts
└── README.md
```

## Prerequisites

- Node.js (v20.19.0 or >=22.12.0)
- npm

## Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Configure Environment Variables

#### Server Environment (`server/.env`)

Create `server/.env` file:

```env
DATABASE_PATH=./db/sqlite.db
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

#### Client Environment (`client/.env.development`)

The client `.env.development` file is already configured:

```env
VITE_API_URL=http://localhost:3000
```

For production, create `client/.env.production`:

```env
VITE_API_URL=https://your-api-domain.com
```

### 3. Database Setup

The SQLite database file is **not** committed (it's gitignored), so a fresh clone
has no database. Create it by applying the migrations:

```bash
cd server
npm run db:migrate
```

This creates `server/db/sqlite.db` with the `users`, `sessions`, and `user_profiles`
tables. To change the schema later, edit `server/db/schema.ts`, then regenerate and
re-apply:

```bash
npm run db:generate   # writes a new migration to db/migrations/
npm run db:migrate
```

> In Docker, migrations are applied automatically on container start (see
> `server/docker-entrypoint.sh`).

To view the database:

```bash
cd server
npm run db:studio
```

Then open [https://local.drizzle.studio/](https://local.drizzle.studio/)

## Running the Application

### Development Mode

**Run both client and server together:**

```bash
npm run dev
```

This will start:
- NestJS server on `http://localhost:3000`
- Vue dev server on `http://localhost:5173`

**Run separately:**

```bash
# Terminal 1: Start backend server
npm run dev:server
# or
cd server && npm run start:dev

# Terminal 2: Start frontend client
npm run dev:client
# or
cd client && npm run dev
```

### Production Build

```bash
# Build both client and server
npm run build

# Build separately
npm run build:client
npm run build:server
```

### Production Server

```bash
npm run start:server
# or
cd server && npm run start:prod
```

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | Path to SQLite database file | `./db/sqlite.db` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_URL` | Vue app URL (for CORS) | `http://localhost:5173` |

### Client (`client/.env.development`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "userId": "..."
}
```

**Sets:** Session cookie

---

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged in successfully",
  "userId": "..."
}
```

**Sets:** Session cookie

---

#### POST `/api/auth/sign-out`
Sign out the current user.

**Requires:** Authentication cookie

**Response:** `200 OK`
```json
{
  "message": "Signed out successfully"
}
```

**Clears:** Session cookie

---

### User Endpoints

#### GET `/api/user/profile`
Get the current user's profile.

**Requires:** Authentication cookie

**Response:** `200 OK`
```json
{
  "id": "...",
  "username": "testuser",
  "email": "test@example.com",
  "createdAt": "...",
  "profile": {
    "userId": "...",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "My bio",
    "updatedAt": "..."
  }
}
```

---

#### PUT `/api/user/profile`
Update the current user's profile.

**Requires:** Authentication cookie

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "My bio"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "userId": "...",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "My bio",
    "updatedAt": "..."
  }
}
```

---

## Frontend Routes

- `/` - Home page
- `/login` - Login page (redirects to home if authenticated)
- `/register` - Register page (redirects to home if authenticated)
- `/profile` - Profile page (requires authentication)

## Features

### Authentication
- ✅ User registration with validation
- ✅ Login with email/password
- ✅ Session-based authentication (Lucia Auth)
- ✅ Cookie-based session management
- ✅ Protected routes with route guards
- ✅ Sign out functionality

### User Profile
- ✅ View user profile
- ✅ Update profile information
- ✅ Form validation
- ✅ Error handling

### Security
- ✅ Password hashing (Argon2id)
- ✅ Session management
- ✅ CORS configuration
- ✅ Input validation (Zod)
- ✅ Route protection

## Scripts

### Root Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start Vue dev server only
- `npm run dev:server` - Start NestJS dev server only
- `npm run build` - Build both client and server
- `npm run build:client` - Build Vue app only
- `npm run build:server` - Build NestJS app only
- `npm run start:server` - Start NestJS production server
- `npm run lint` - Lint both client and server code

### Server Scripts (`cd server`)

- `npm run start:dev` - Start development server with watch mode
- `npm run start:prod` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Client Scripts (`cd client`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Testing

### Backend API Testing

Use the provided test script:

```bash
./test-api.sh
```

Or test manually with curl (see script for examples).

### Frontend Testing

1. Start both servers: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Test the authentication flow:
   - Register a new user
   - Login
   - Access protected routes
   - Update profile
   - Sign out

## Database

The application uses SQLite with Drizzle ORM. The database file is located at `server/db/sqlite.db`.

### Schema

- `users` - User accounts
- `sessions` - User sessions (Lucia Auth)
- `user_profiles` - User profile information

### Migrations

Migrations are stored in `server/db/migrations/`. To create a new migration:

```bash
cd server
npm run db:generate
npm run db:migrate
```

## Technologies

### Frontend
- Vue 3 (Composition API)
- Vue Router
- Pinia (State Management)
- Axios (HTTP Client)
- Zod (Validation)
- Tailwind CSS

### Backend
- NestJS
- Drizzle ORM
- Better SQLite3
- Lucia Auth
- Zod (Validation)
- Cookie Parser

## Deployment

For deployment instructions using Docker, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick start with Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## License

Private/Unlicensed
