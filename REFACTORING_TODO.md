# Refactoring Plan: Next.js to Vue SPA + NestJS Backend

## Overview
This document outlines the step-by-step plan to refactor the Next.js application into:
- **Vue SPA** (in `client/` folder) - Frontend application
- **NestJS API** (in `server/` folder) - Backend API server
- **Shared DB/ORM** - Drizzle ORM with SQLite (moved to server, shared config)

---

## Phase 1: Setup NestJS Backend

### Step 1.1: Initialize NestJS Project
1. Create `server/` directory
2. Initialize NestJS project:
   ```bash
   cd server
   npm i -g @nestjs/cli
   nest new . --package-manager npm --skip-git
   ```
3. Install required dependencies:
   ```bash
   npm install @lucia-auth/adapter-drizzle lucia oslo drizzle-orm better-sqlite3 zod
   npm install -D drizzle-kit @types/better-sqlite3
   ```

### Step 1.2: Move Database Configuration
1. Move `db/` folder to `server/db/`
2. Move `drizzle.config.ts` to `server/drizzle.config.ts`
3. Update `drizzle.config.ts` paths:
   - `out: "./db/migrations"` (relative to server/)
   - `schema: "./db/schema.ts"` (relative to server/)
4. Update `server/db/drizzle.ts` to use correct path for schema import

### Step 1.3: Move Shared Libraries
1. Move `lib/` folder to `server/lib/`
2. Update imports in `lib/lucia.ts`:
   - Remove Next.js specific imports (`cookies`, `cache`)
   - Adapt session cookie handling for NestJS (using Express/HTTP context)
3. Update `lib/auth.ts` - should work as-is (no Next.js dependencies)

### Step 1.4: Create NestJS Modules Structure
1. **Auth Module** (`server/src/auth/`):
   - `auth.module.ts` - Module definition
   - `auth.controller.ts` - Auth endpoints (login, register, sign-out)
   - `auth.service.ts` - Business logic for authentication
   - `auth.guard.ts` - Guard for protected routes
   - `dto/` - DTOs for login, register (using Zod schemas)

2. **User Module** (`server/src/user/`):
   - `user.module.ts` - Module definition
   - `user.controller.ts` - User profile endpoints
   - `user.service.ts` - Business logic for user operations
   - `dto/` - DTOs for profile updates

3. **Database Module** (`server/src/database/`):
   - `database.module.ts` - Database connection module
   - Export `db` instance for use in other modules

### Step 1.5: Implement Auth Controller
1. Convert Next.js route handlers to NestJS controllers:
   - `POST /api/auth/login` → `AuthController.login()`
   - `POST /api/auth/register` → `AuthController.register()`
   - `POST /api/auth/sign-out` → `AuthController.signOut()`
2. Use NestJS decorators (`@Post()`, `@Body()`, `@Res()`, etc.)
3. Handle cookies using NestJS cookie handling (install `cookie-parser`)
4. Implement session validation using Lucia

### Step 1.6: Implement User Controller
1. Convert Next.js route handlers:
   - `GET /api/user/profile` → `UserController.getProfile()`
   - `PUT /api/user/profile` → `UserController.updateProfile()`
2. Use `@UseGuards(AuthGuard)` for protected routes
3. Extract user from session/request

### Step 1.7: Configure CORS and Middleware
1. Enable CORS in `main.ts` for Vue app origin
2. Configure cookie parser middleware
3. Set up environment variables (`.env` file in server/)

### Step 1.8: Update Package Scripts
1. Update `server/package.json` scripts:
   - `db:generate` - Generate migrations
   - `db:migrate` - Run migrations
   - `db:studio` - Drizzle Studio
   - `start:dev` - Development server
   - `start:prod` - Production server

---

## Phase 2: Setup Vue SPA Frontend

### Step 2.1: Create Vue App in Client Folder
1. Navigate to project root
2. Create Vue app:
   ```bash
   npm create vue@latest client
   ```
   - Select options:
     - TypeScript: Yes
     - JSX: No
     - Router: Yes (for SPA routing)
     - Pinia: Yes (for state management)
     - Vitest: Optional
     - E2E Testing: Optional
     - ESLint: Yes
     - Prettier: Optional

### Step 2.2: Install Additional Dependencies
1. Install HTTP client:
   ```bash
   cd client
   npm install axios
   ```
2. Install form validation (if needed):
   ```bash
   npm install zod @vueuse/core
   ```
3. Install UI library (optional, e.g., Vuetify, Quasar, or Tailwind CSS):
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   ```

### Step 2.3: Configure API Client
1. Create `client/src/api/` directory
2. Create `client/src/api/axios.ts` - Axios instance with base URL and interceptors
3. Create `client/src/api/auth.ts` - Auth API functions (login, register, signOut)
4. Create `client/src/api/user.ts` - User API functions (getProfile, updateProfile)
5. Configure withCredentials: true for cookies

### Step 2.4: Setup Pinia Stores
1. Create `client/src/stores/` directory
2. Create `client/src/stores/auth.ts`:
   - State: user, isAuthenticated, session
   - Actions: login, register, logout, checkAuth
   - Getters: isLoggedIn
3. Create `client/src/stores/user.ts`:
   - State: profile
   - Actions: fetchProfile, updateProfile

### Step 2.5: Create Vue Components
1. Convert React components to Vue:
   - `components/AuthForm.tsx` → `client/src/components/AuthForm.vue`
   - `components/SignOutButton.tsx` → `client/src/components/SignOutButton.vue`
   - `components/UserProfileClient.tsx` → `client/src/components/UserProfile.vue`
2. Use Vue Composition API with `<script setup>`
3. Integrate with Pinia stores

### Step 2.6: Setup Vue Router
1. Configure routes in `client/src/router/index.ts`:
   - `/` - Home page
   - `/login` - Login page
   - `/register` - Register page
   - `/profile` - Profile page (protected)
2. Create route guards:
   - `authGuard` - Redirect to login if not authenticated
   - `guestGuard` - Redirect to home if already authenticated
3. Create pages:
   - `client/src/views/LoginView.vue`
   - `client/src/views/RegisterView.vue`
   - `client/src/views/ProfileView.vue`
   - `client/src/views/HomeView.vue`

### Step 2.7: Configure Environment Variables
1. Create `client/.env.development`:
   ```
   VITE_API_URL=http://localhost:3000
   ```
2. Create `client/.env.production`:
   ```
   VITE_API_URL=https://your-api-domain.com
   ```

### Step 2.8: Update Vue App Configuration
1. Update `client/vite.config.ts` if needed for proxy/dev server
2. Configure build output directory
3. Update `client/package.json` scripts if needed

---

## Phase 3: Cleanup and Migration

### Step 3.1: Remove Next.js Files
1. Delete `app/` directory
2. Delete `components/` directory (React components)
3. Delete `next.config.ts`
4. Delete `next-env.d.ts`
5. Delete `postcss.config.mjs` (if not needed for Vue)
6. Delete `eslint.config.mjs` (will be replaced by Vue ESLint config)

### Step 3.2: Update Root Package.json
1. Update root `package.json`:
   - Remove Next.js dependencies
   - Add workspace scripts:
     ```json
     {
       "scripts": {
         "dev:client": "cd client && npm run dev",
         "dev:server": "cd server && npm run start:dev",
         "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
         "build:client": "cd client && npm run build",
         "build:server": "cd server && npm run build",
         "start:server": "cd server && npm run start:prod"
       }
     }
     ```
2. Install `concurrently` for running both servers:
   ```bash
   npm install -D concurrently
   ```

### Step 3.3: Update Root Configuration Files
1. Update `tsconfig.json` - may need separate configs for client/server
2. Create `.gitignore` entries for:
   - `client/dist/`
   - `client/node_modules/`
   - `server/dist/`
   - `server/node_modules/`
   - `.env` files

### Step 3.4: Database Migration
1. Ensure database file (`db/sqlite.db`) is accessible from server
2. Test migrations work from server directory
3. Verify database connection in NestJS

### Step 3.5: Update Environment Variables
1. Create `server/.env`:
   ```
   DATABASE_PATH=./db/sqlite.db
   PORT=3000
   NODE_ENV=development
   ```
2. Ensure `.env.local` is migrated or removed

---

## Phase 4: Testing and Verification

### Step 4.1: Test Backend API
1. Start NestJS server: `cd server && npm run start:dev`
2. Test endpoints with Postman/curl:
   - POST `/api/auth/register`
   - POST `/api/auth/login`
   - GET `/api/user/profile` (with auth cookie)
   - PUT `/api/user/profile` (with auth cookie)
   - POST `/api/auth/sign-out`

### Step 4.2: Test Frontend
1. Start Vue dev server: `cd client && npm run dev`
2. Test authentication flow:
   - Register new user
   - Login
   - Access protected routes
   - Update profile
   - Sign out

### Step 4.3: Integration Testing
1. Test full flow: Register → Login → Profile → Sign Out
2. Verify cookies are set correctly
3. Verify CORS is working
4. Test error handling

### Step 4.4: Update Documentation
1. Update `README.md` with new structure
2. Document how to run client and server
3. Document environment variables
4. Document API endpoints

---

## Phase 5: Final Cleanup

### Step 5.1: Code Review
1. Remove unused imports
2. Remove commented code
3. Ensure consistent code style
4. Add JSDoc comments where needed

### Step 5.2: Optimize Build
1. Configure production builds
2. Set up proper error handling
3. Add logging
4. Configure security headers in NestJS

### Step 5.3: Deployment Preparation
1. Create Dockerfiles (if needed):
   - `Dockerfile.client` for Vue app
   - `Dockerfile.server` for NestJS app
2. Create `docker-compose.yml` if using Docker
3. Update deployment documentation

---

## File Structure After Refactoring

```
vue-drizzle-sqlite-boilerplate/
├── client/                    # Vue SPA
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/        # Vue components
│   │   ├── router/           # Vue Router config
│   │   ├── stores/           # Pinia stores
│   │   ├── views/            # Page components
│   │   └── main.ts
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # NestJS API
│   ├── src/
│   │   ├── auth/             # Auth module
│   │   ├── user/             # User module
│   │   ├── database/         # Database module
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

---

## Important Notes

1. **Session Management**: Lucia sessions use cookies. Ensure:
   - CORS credentials are enabled (`credentials: true`)
   - Cookies are sent with requests (`withCredentials: true` in axios)
   - Same-origin or proper CORS configuration

2. **Database Path**: Ensure database path is relative to server directory or use absolute paths

3. **TypeScript**: May need separate `tsconfig.json` files for client and server

4. **Environment Variables**: 
   - Server uses `process.env`
   - Client uses `import.meta.env.VITE_*` (Vite convention)

5. **Ports**: 
   - NestJS default: 3000
   - Vue dev server default: 5173
   - Configure accordingly

---

## Estimated Timeline

- Phase 1 (NestJS Setup): 2-3 hours
- Phase 2 (Vue Setup): 2-3 hours
- Phase 3 (Cleanup): 1 hour
- Phase 4 (Testing): 1-2 hours
- Phase 5 (Final Cleanup): 1 hour

**Total: ~7-10 hours**
