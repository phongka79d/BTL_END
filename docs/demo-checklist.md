# Demo Checklist

This checklist records the verified Plan 1 foundation state for the electronics e-commerce MVC project.

## Plan 1 Verification Status

| Check | Status | Evidence |
|---|---|---|
| Backend dependencies install | Passed | 05A recorded `npm install` in `backend` passing. |
| Prisma schema validates | Passed | 05A recorded `npx prisma validate` passing. |
| Initial Prisma migration runs | Passed | 05A recorded `npx prisma migrate dev --name init` passing against the configured database. |
| Seed script runs | Passed | 05A recorded `npx prisma db seed` passing. |
| Backend starts | Passed | 05A recorded `npm run dev` starting the Express backend on port 5000. |
| Backend health endpoint | Passed | 05A recorded `GET http://localhost:5000/api/health` returning HTTP 200. |
| Auth and user API smoke tests | Passed | 05B recorded register, login, `/api/auth/me`, profile read/update, and `/api/admin/users` checks passing without printing secrets or tokens. |
| Frontend dependencies install | Passed | 05C recorded `npm install` in `frontend` passing after the React 19/Astryx dependency alignment. |
| Frontend starts on Vite | Passed | 05C recorded Vite serving the app and route HTTP checks for `/`, `/login`, `/register`, and `/admin` returning HTTP 200. |
| Frontend production build | Passed | 05C recorded `npm run build` passing. |
| Frontend auth UI smoke checks | Passed - user provided | 05C records user-provided manual PASS for home, login validation/error states, customer login/logout, register validation/success states, admin guards, admin dashboard, and no fatal console errors. |
| Security, MVC, and duplication audit | Passed | 05D recorded no committed real `.env` files, no frontend database access, focused MVC boundaries, and no duplicate runtime Prisma client, response helper, or JWT helper. |
| Supabase Table Editor visual table check | User-side confirmation needed | Migration passed, but the agent did not inspect the Supabase dashboard UI. User should confirm the nine main tables are visible in Supabase Table Editor. |

## Demo Flow for Plan 1

1. Start the backend with `cd backend && npm run dev`.
2. Start the frontend with `cd frontend && npm run dev`.
3. Open the Vite URL and confirm the home, login, register, and admin routes render.
4. Register or log in with demo-safe credentials without exposing passwords in reports or screenshots.
5. Confirm customer login/logout, register success/error states, and admin-only route protection.
6. Confirm API smoke behavior through the backend only; the frontend must not connect directly to Supabase PostgreSQL.
7. In Supabase Table Editor, manually confirm the Plan 1 tables exist after migration: `users`, `categories`, `products`, `carts`, `cart_items`, `orders`, `order_details`, `payments`, and `reviews`.

## Phase 2 Handoff Checklist

- Reuse `backend/src/config/database.js` as the single runtime Prisma client export.
- Reuse `backend/prisma/schema.prisma` model names, field names, relationships, and enum values.
- Reuse `backend/src/utils/response.js` for API success and error responses.
- Reuse `backend/src/middlewares/auth.middleware.js` and `backend/src/middlewares/admin.middleware.js` for protected and admin routes.
- Reuse `frontend/src/contexts/AuthContext.jsx` for frontend auth state.
- Reuse the existing frontend API helper pattern in `frontend/src/api/apiClient.js`, `authApi.js`, and `userApi.js`.
- Keep Astryx setup in `frontend/src/main.jsx` and build UI with Astryx components first.
- Do not introduce Supabase Auth, direct frontend database access, a second ORM/database client, a second response helper, or a second JWT helper.
