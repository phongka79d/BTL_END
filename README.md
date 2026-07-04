# Electronics E-Commerce Project

This is a course-project MVC web application for an electronics e-commerce store.

## Technology Stack

- **Frontend (View):** React, Vite, Astryx
- **Backend (Controller/API):** Express.js, JSON REST
- **Database (Model):** Prisma ORM, Supabase PostgreSQL
- **Auth:** JWT and bcrypt

## Setup Order

1. Setup the backend dependencies and environment variables in `backend/.env`.
2. Run Prisma schema migrations and seed the database.
3. Setup the frontend dependencies and environment variables.
4. Start both development servers.

## Configuration & Environment Variables

### Backend (`backend/.env`)

Create a `backend/.env` file with the following variables:
- `PORT`: Server port (default `5000`)
- `DATABASE_URL`: Supabase transaction connection string
- `DIRECT_URL`: Supabase direct connection string for migrations
- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., `7d`)
- `NODE_ENV`: Application environment (`development` or `production`)

## Implemented API Endpoints (Auth & Users)

All API endpoints are mounted under `/api`:

### Auth APIs
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user and receive JWT
- `GET /api/auth/me` - Get current authenticated user profile (requires JWT)

### User APIs
- `GET /api/users/profile` - Get current user profile (requires JWT)
- `PUT /api/users/profile` - Update current user profile details (requires JWT)
- `GET /api/admin/users` - List all users (requires admin JWT)

## Local Commands

### Backend
```bash
cd backend
npm install
npx prisma validate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
