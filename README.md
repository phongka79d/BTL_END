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
