# Electronics E-Commerce Plan 1 Execution Tasks

## Purpose

Convert Plan 1 into a detailed, batch-based execution task file for building the MVC foundation, Supabase PostgreSQL/Prisma data model, shared backend conventions, JWT authentication, and the first React/Astryx frontend shell.

This file is for future execution agents. It does not implement runtime code.

## Authoritative Source

- Primary phase source: `docs/plans/Plan_1.md`
- Master architecture source of truth: `docs/plans/Master_Plan.md`
- UI source referenced by Plan 1: `docs/design/design.md`
- Scope resolution: `docs/plans/Plan_1.md` is the approved Phase 1 slice. Where `docs/plans/Master_Plan.md` is broader or offers alternatives, follow the narrower Phase 1 decision unless the user explicitly changes the plan.

## Source Section Index

- `docs/plans/Plan_1.md` > `## 1. Objective` -> Phase 1 foundation goal and database-first intent.
- `docs/plans/Plan_1.md` > `## 2. Source of Truth` -> Master plan and design sections that drive this phase.
- `docs/plans/Plan_1.md` > `## 3. Prerequisites from Prior Phases` -> first-phase prerequisites and required agent rules.
- `docs/plans/Plan_1.md` > `## 4. Scope` -> required root, backend, database, auth, and frontend shell scope.
- `docs/plans/Plan_1.md` > `## 5. Out of Scope` -> features explicitly excluded from Phase 1.
- `docs/plans/Plan_1.md` > `## 6. Target Directory Structure` -> expected root, frontend, backend, and docs paths.
- `docs/plans/Plan_1.md` > `## 7. Technical Specifications` -> architecture decisions, env variables, Prisma schema, API response, auth API, and frontend contract.
- `docs/plans/Plan_1.md` > `## 8. Implementation Steps` -> ordered implementation checklist.
- `docs/plans/Plan_1.md` > `## 9. Verification & Testing Plan` -> required commands, smoke tests, and manual checks.
- `docs/plans/Plan_1.md` > `## 10. Handoff Notes for Phase 2` -> artifacts later phases must consume without redefining.
- `docs/plans/Master_Plan.md` > `## 1. Project Overview` -> course-project MVC goal.
- `docs/plans/Master_Plan.md` > `## 2. Technology Stack` -> React, Vite, Express, Supabase PostgreSQL, JWT, bcrypt, REST, Astryx.
- `docs/plans/Master_Plan.md` > `## 3. Supabase PostgreSQL Usage` -> Supabase is database only, not auth.
- `docs/plans/Master_Plan.md` > `## 4. MVC Architecture` -> Model/View/Controller mapping.
- `docs/plans/Master_Plan.md` > `## 8. MVC Folder Structure` -> root folder structure.
- `docs/plans/Master_Plan.md` > `## 9. Front-end MVC View Structure` -> view-layer responsibilities and design-doc requirement.
- `docs/plans/Master_Plan.md` > `## 10. Back-end MVC Structure` -> backend controller/model/routes/middleware/config/util structure.
- `docs/plans/Master_Plan.md` > `## 11. Database Design` -> nine main entities.
- `docs/plans/Master_Plan.md` > `## 12. Model Relationships` -> relationship graph.
- `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.1 AuthController` -> auth endpoints and actions.
- `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.2 UserController` -> profile and admin-user endpoints.
- `docs/plans/Master_Plan.md` > `## 18. Environment Variables` -> backend/frontend env examples and security rules.
- `docs/plans/Master_Plan.md` > `## 19. Supabase Setup Checklist` -> user Supabase setup and Prisma datasource.
- `docs/plans/Master_Plan.md` > `## 20. Recommended Commands` -> frontend, backend, and Prisma commands.
- `docs/plans/Master_Plan.md` > `## 22. MVC Acceptance Criteria` -> model, view, and controller acceptance criteria.
- `docs/plans/Master_Plan.md` > `## 24. Risk Management` -> MVC clarity, late database changes, credential exposure, migration issues.
- `docs/design/design.md` > `## 2. Design System` -> Astryx as the main UI reference.
- `docs/design/design.md` > `## 5. Main Layouts` -> customer, admin, and auth layout sections.
- `docs/design/design.md` > `# 6. Navigation Components` -> customer header, admin sidebar, and user menu requirements.
- `docs/design/design.md` > `# 9. Authentication Components` -> login and register forms and states.
- `docs/design/design.md` > `# 20. Common Form Components` -> reusable form primitives.
- `docs/design/design.md` > `# 21. Common Feedback Components` -> toast, banner, loading, empty, and confirm feedback.
- `docs/design/design.md` > `# 22. Common Utility Components` -> page headers and formatting helpers.

## Approved Architecture Summary

- Build a standard MVC web app for an electronics e-commerce course project.
- React/Vite is the View layer; Express controllers are the Controller layer; Prisma models are the Model layer; Supabase PostgreSQL is the hosted database.
- Plan 1 fixes the ORM path to Prisma, even though the master plan allows Prisma or Sequelize.
- Supabase is used only as hosted PostgreSQL. Do not use Supabase Auth, Edge Functions, or direct frontend database access.
- Authentication uses backend JWT plus bcrypt password hashing.
- Backend APIs are REST endpoints mounted under `/api`.
- Controllers return the shared JSON success/failure response shape.
- Frontend uses Astryx reset/style imports, Astryx layout/navigation/form components, and `VITE_API_BASE_URL`.
- Backend secrets and database connection strings stay backend-only and must not be exposed to React.

## Global Implementation Rules

- Read root `AGENTS.md` before implementation and follow search-before-write, reuse, SRP, YAGNI, and root-cause rules.
- Search existing files before adding helpers, utilities, configs, or business logic. Reuse or safely refactor existing code instead of duplicating it.
- Keep implementation files focused. Split files before they become broad mixed-purpose modules.
- Use Prisma only for this phase. Do not add Sequelize or a second ORM path.
- Use exactly one Prisma client export, one response helper, and one JWT helper.
- Use `.env.example` for placeholder variable names only. Never commit real `.env` values.
- Do not print, log, document, or expose real Supabase credentials, JWT secrets, or database passwords.
- Treat missing Supabase credentials as `BLOCKED_BY_USER_ACTION` for live migration/seed/startup validation.
- Keep frontend code free of Prisma imports, Supabase database credentials, backend-only config names, SQL, and database logic.
- Follow Astryx rules for frontend UI: use component primitives first, use tokens for custom styling, and avoid raw layout wrappers where Astryx layout components apply.
- Do not implement Phase 2+ behavior in this task file: product/category CRUD, product browsing, cart behavior, checkout, order, payment, reviews, reports, uploads, online payments, chatbot, recommendations, email flows, or dashboards beyond a minimal placeholder shell.

## Execution Agent Coding Style Requirements

- Write clean, idiomatic, readable code.
- Use descriptive names for modules, functions, variables, components, settings, and tests.
- Keep functions, components, and modules focused on one clear responsibility.
- Prefer simple, explicit control flow over clever abstractions.
- Follow standard conventions for React/Vite, Express, Prisma, JWT, bcrypt, and Astryx.
- Use clear typing or schema validation where the chosen stack supports it; avoid loose unvalidated request handling.
- Avoid `any`, broad exception handling, hidden global state, duplicated helpers, and hardcoded configuration values unless explicitly required by the plan.
- Add comments only for non-obvious decisions or behavior.
- Keep frontend code free of backend-only secrets and backend-only configuration names.
- Avoid adding formatters, linters, frameworks, or architecture changes outside the source plan unless already present or explicitly requested.

## Batch Map

| Batch | Name | Outcome |
|---|---|---|
| Batch01 | Repository Shell and Environment Contract | Root, backend, frontend, docs, dependency scripts, and env placeholder structure exist. |
| Batch02 | Supabase Prisma Data Model and Seed | Prisma is configured for Supabase PostgreSQL, all nine models exist, and seed/migration workflow is ready. |
| Batch03 | Backend MVC Utilities and Auth APIs | Shared backend conventions, auth/user model access, middleware, controllers, and routes work. |
| Batch04 | Frontend Astryx Shell and Auth Views | React shell, Astryx imports, auth state, route guards, layouts, and auth views are wired to APIs. |
| Batch05 | Verification, Security Audit, and Phase 2 Handoff | Automated/manual checks prove the foundation and document the handoff. |

## Mandatory Batch01 - Repository Shell and Environment Contract

### Goal

Create the minimal root, backend, frontend, and documentation shell required before database, backend, and frontend feature work begins.

### Why this batch exists

Plan 1 is the first implementation phase. Later batches need a predictable directory structure, package scripts, env placeholders, and repository hygiene before adding data and runtime behavior.

### Inputs / Dependencies

- Root `AGENTS.md`
- `docs/plans/Plan_1.md`
- `docs/plans/Master_Plan.md`
- `docs/design/design.md`
- No prior implementation phase

### Tasks

- [x] (01A): Inspect repository and establish root project files
  - Source of Truth: `docs/plans/Plan_1.md` > `## 3. Prerequisites from Prior Phases`; `docs/plans/Plan_1.md` > `## 8. Implementation Steps`
  - Source Requirements:
    - This is the first implementation phase.
    - Existing repository state must be inspected before adding files.
    - Root `.gitignore`, `README.md`, and docs support files are required.
  - Details: Confirm current repo contents, avoid duplicating existing files, and add the root non-runtime scaffolding.
  - Dependencies: None
  - User Action: None
  - Agent Work: Search the repo, preserve any existing files, add/update `.gitignore`, `README.md`, `docs/database-design.md`, and `docs/demo-checklist.md` as needed.
  - Specific Steps:
    1. Read root `AGENTS.md`.
    2. List existing repository files and search for any existing root docs or ignore rules.
    3. Add root `.gitignore` entries for Node, Vite, Prisma, logs, build output, and real `.env` files.
    4. Add a concise `README.md` describing the MVC stack, setup order, and local commands.
    5. Add `docs/database-design.md` and `docs/demo-checklist.md` placeholders that point to the implemented Prisma schema and demo checks.
  - Output: Root repository support files.
  - Acceptance: Root files exist, no existing content was overwritten blindly, and real secret files are ignored.
  - Validation: Run `rg --files` and inspect changed files.
  - Blocked Condition: None
  - Files: `.gitignore`, `README.md`, `docs/database-design.md`, `docs/demo-checklist.md`

- [x] (01B): Scaffold backend package and MVC folders
  - Source of Truth: `docs/plans/Plan_1.md` > `## 4. Scope`; `docs/plans/Plan_1.md` > `## 6. Target Directory Structure`; `docs/plans/Master_Plan.md` > `## 10. Back-end MVC Structure`
  - Source Requirements:
    - Create an Express backend shell.
    - Use MVC folders: `controllers`, `models`, `routes`, `middlewares`, `config`, and `utils`.
    - Backend includes `app.js`, `server.js`, Prisma folder, and package scripts.
  - Details: Create a runnable backend project shell without implementing controllers yet.
  - Dependencies: (01A)
  - User Action: None
  - Agent Work: Create `backend/package.json`, backend source folders, Prisma folder, and minimal script structure.
  - Specific Steps:
    1. Search for any existing backend package or server entry before creating one.
    2. Initialize backend package metadata and scripts for development/start/Prisma seed.
    3. Install or declare required backend dependencies: Express, Prisma, Prisma Client, bcrypt, jsonwebtoken, cors, dotenv, and development tooling as needed.
    4. Create the target MVC directories and placeholder entry files.
    5. Keep each placeholder focused on one responsibility.
  - Output: Backend shell and dependency manifest.
  - Acceptance: `backend/` matches the Plan 1 MVC folder shape and has scripts ready for later batches.
  - Validation: Run `cd backend && npm install` when dependency installation is available.
  - Blocked Condition: None
  - Files: `backend/package.json`, `backend/src/app.js`, `backend/src/server.js`, backend MVC folders, `backend/prisma/`

- [x] (01C): Scaffold frontend Vite React package and folders
  - Source of Truth: `docs/plans/Plan_1.md` > `## 4. Scope`; `docs/plans/Plan_1.md` > `## 6. Target Directory Structure`; `docs/plans/Master_Plan.md` > `## 9. Front-end MVC View Structure`
  - Source Requirements:
    - Create a Vite React frontend.
    - Create `api`, `components/common`, `contexts`, `layouts`, `routes`, and `views` folders.
    - React is the View layer and must call backend APIs instead of the database.
  - Details: Create a minimal frontend project shell without building full UI behavior yet.
  - Dependencies: (01A)
  - User Action: None
  - Agent Work: Create the Vite package files and folder structure needed for Batch04.
  - Specific Steps:
    1. Search for an existing frontend package before scaffolding.
    2. Create or initialize the Vite React package.
    3. Add target folders from Plan 1.
    4. Create minimal `App.jsx` and `main.jsx` entry points if no entries exist.
    5. Defer full layouts, views, auth context, and API clients to Batch04.
  - Output: Frontend shell and dependency manifest.
  - Acceptance: `frontend/` has a valid Vite React structure aligned with Plan 1.
  - Validation: Run `cd frontend && npm install` when dependency installation is available.
  - Blocked Condition: None
  - Files: `frontend/package.json`, `frontend/vite.config.js`, `frontend/src/App.jsx`, `frontend/src/main.jsx`, frontend source folders

- [x] (01D): Add environment examples and secret boundaries
  - Source of Truth: `docs/plans/Plan_1.md` > `### 7.2 Environment Variables`; `docs/plans/Master_Plan.md` > `## 18. Environment Variables`
  - Source Requirements:
    - Backend env example must include `PORT`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `NODE_ENV`.
    - Frontend env example must include `VITE_API_BASE_URL`.
    - Real `.env` files must not be committed.
  - Details: Document required configuration without adding secrets.
  - Dependencies: (01B), (01C)
  - User Action: User must later fill real `backend/.env` values for Supabase and JWT secret before live database checks.
  - Agent Work: Add placeholder-only env examples and verify `.gitignore` excludes real env files.
  - Specific Steps:
    1. Create `backend/.env.example` using placeholder Supabase connection strings.
    2. Create `frontend/.env.example` with `VITE_API_BASE_URL=http://localhost:5000/api`.
    3. Confirm `.env`, `.env.local`, and framework-specific local env files are ignored.
    4. Do not create or print real secrets.
  - Output: Backend and frontend env examples.
  - Acceptance: Env examples contain only placeholders and frontend only exposes the API base URL.
  - Validation: Inspect env examples and `.gitignore`.
  - Blocked Condition: None for placeholders; `BLOCKED_BY_USER_ACTION` for live Supabase/JWT validation until real values are provided.
  - Files: `backend/.env.example`, `frontend/.env.example`, `.gitignore`

### Files or Modules Likely Created or Updated

- `.gitignore`
- `README.md`
- `docs/database-design.md`
- `docs/demo-checklist.md`
- `backend/package.json`
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/controllers/`
- `backend/src/models/`
- `backend/src/routes/`
- `backend/src/middlewares/`
- `backend/src/config/`
- `backend/src/utils/`
- `backend/prisma/`
- `backend/.env.example`
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/.env.example`
- `frontend/src/`

### Required Outputs / Artifacts

- Root project shell.
- Backend shell.
- Frontend shell.
- Placeholder-only env examples.
- Basic docs placeholders.

### Acceptance Criteria

- Root, backend, frontend, and docs structure exists.
- Secrets are excluded from Git.
- Backend and frontend packages can install dependencies.
- No Phase 2+ behavior is implemented.

### Required Tests or Validations

- `rg --files`
- `cd backend && npm install`
- `cd frontend && npm install`
- Manual inspection of `.gitignore` and `.env.example` files.

### Explicit Non-Goals

- Prisma schema and migration.
- Auth controller implementation.
- Full frontend UI.
- Product/category/cart/order behavior.

## Mandatory Batch02 - Supabase Prisma Data Model and Seed

### Goal

Configure Prisma against Supabase PostgreSQL, define the full Plan 1 schema contract, create the initial migration path, and add seed data.

### Why this batch exists

Plan 1 intentionally finalizes the database schema early so later phases can add behavior without changing model shape unless a migration is documented.

### Inputs / Dependencies

- Batch01 output.
- User-provided Supabase project and real backend `.env` values for live migration/seed validation.

### Tasks

- [x] (02A): Configure Prisma datasource and client generation
  - Source of Truth: `docs/plans/Plan_1.md` > `### 7.1 Architecture Decisions`; `docs/plans/Master_Plan.md` > `### 19.3 Configure Prisma for Supabase PostgreSQL`
  - Source Requirements:
    - Use Prisma, not Sequelize.
    - Supabase is hosted PostgreSQL only.
    - Prisma datasource must read `DATABASE_URL` and `DIRECT_URL`.
  - Details: Establish the single ORM path for the project.
  - Dependencies: (01B), (01D)
  - User Action: User must create/provide Supabase PostgreSQL connection values in `backend/.env` before live Prisma commands can connect.
  - Agent Work: Add Prisma config and ensure generated client setup uses environment variables only.
  - Specific Steps:
    1. Search for existing Prisma setup before creating files.
    2. Add `backend/prisma/schema.prisma` datasource using PostgreSQL with `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")`.
    3. Add the Prisma Client generator.
    4. Ensure `backend/package.json` supports Prisma generate/migrate/seed commands.
    5. Do not add Sequelize or direct SQL connection helpers.
  - Output: Prisma datasource and generator configuration.
  - Acceptance: Prisma configuration points to environment variables and uses one ORM path.
  - Validation: `cd backend && npx prisma validate` after schema exists and dependencies are installed.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only for live Supabase connection if real env values are missing.
  - Files: `backend/prisma/schema.prisma`, `backend/package.json`

- [x] (02B): Implement the complete Prisma schema contract
  - Source of Truth: `docs/plans/Plan_1.md` > `### 7.3 Prisma Schema Contract`; `docs/plans/Master_Plan.md` > `## 11. Database Design`; `docs/plans/Master_Plan.md` > `## 12. Model Relationships`
  - Source Requirements:
    - Define `User`, `Category`, `Product`, `Cart`, `CartItem`, `Order`, `OrderDetail`, `Payment`, and `Review`.
    - Include required enums and relationships.
    - Preserve planned enum values and database mappings.
  - Details: Encode the full data model exactly enough for later phases to build on it.
  - Dependencies: (02A)
  - User Action: None for schema authoring.
  - Agent Work: Add all enums, models, fields, relationships, uniqueness constraints, decimal fields, cascades, timestamps, and `@map` mappings from Plan 1.
  - Specific Steps:
    1. Copy the model contract from Plan 1 into Prisma syntax carefully.
    2. Verify enum values: `Role`, `OrderStatus`, `PaymentMethod`, `PaymentStatus`, and `ReviewStatus`.
    3. Verify all relations: user/cart, user/orders/reviews, category/products, cart/items, order/details/payment, product/cart items/order details/reviews.
    4. Confirm `passwordHash` maps to `password_hash`.
    5. Confirm API-facing naming can remain consistent across later phases.
  - Output: Complete `schema.prisma`.
  - Acceptance: All nine main models and relationships exist and validate.
  - Validation: `cd backend && npx prisma validate`.
  - Blocked Condition: None for local schema validation after dependencies are installed.
  - Files: `backend/prisma/schema.prisma`

- [x] (02C): Create initial migration workflow against Supabase
  - Source of Truth: `docs/plans/Plan_1.md` > `## 9. Verification & Testing Plan`; `docs/plans/Master_Plan.md` > `## 19. Supabase Setup Checklist`; `docs/plans/Master_Plan.md` > `## 20. Recommended Commands`
  - Source Requirements:
    - Run the first Prisma migration against Supabase PostgreSQL.
    - Use `DIRECT_URL` for migrations.
    - Tables should be visible in Supabase Table Editor.
  - Details: Run or document the initial migration depending on whether user credentials are present.
  - Dependencies: (02B)
  - User Action: User must provide a ready Supabase project plus real `DATABASE_URL` and `DIRECT_URL` in local `backend/.env`.
  - Agent Work: Run the migration when possible; otherwise report the user-action blocker without fabricating success.
  - Specific Steps:
    1. Confirm `backend/.env` exists locally without printing it.
    2. Run `cd backend && npx prisma migrate dev --name init` when credentials are available.
    3. If migration fails, report a safe summary and check Plan 1 migration risk items.
    4. Confirm generated migration files are committed-ready and do not contain secrets.
    5. Ask the user to verify tables in Supabase Table Editor if live access is not available to the agent.
  - Output: Initial Prisma migration or a clear blocked report.
  - Acceptance: Migration files exist and live migration is confirmed, or the task is marked blocked by missing user setup.
  - Validation: `cd backend && npx prisma migrate dev --name init`; Supabase Table Editor manual check.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if Supabase project or real `.env` values are missing.
  - Files: `backend/prisma/migrations/`, `backend/prisma/schema.prisma`

- [x] (02D): Add seed data for demo categories, products, customer, and admin
  - Source of Truth: `docs/plans/Plan_1.md` > `## 4. Scope`; `docs/plans/Plan_1.md` > `## 8. Implementation Steps`; `docs/plans/Master_Plan.md` > `## 22. MVC Acceptance Criteria`
  - Source Requirements:
    - Seed demo categories, products, one customer, and one admin user.
    - Supabase seed data must be available.
    - Passwords must be stored as bcrypt hashes, not plain text.
  - Details: Provide reproducible starter data for authentication and later demo flows.
  - Dependencies: (02B), (02C)
  - User Action: User must provide live database credentials before seed execution.
  - Agent Work: Implement `seed.js` using Prisma Client and bcrypt, then run it when the database is available.
  - Specific Steps:
    1. Search for existing seed logic before adding a new one.
    2. Add a focused `backend/prisma/seed.js`.
    3. Create representative electronics categories and products.
    4. Create one customer and one admin with bcrypt-hashed passwords.
    5. Use idempotent upsert-style logic where practical to keep repeated seeding safe.
  - Output: Seed script and seeded database when live credentials are available.
  - Acceptance: Seed script runs without storing plain text passwords and demo users/products exist.
  - Validation: `cd backend && npx prisma db seed`; inspect rows in Supabase Table Editor without exposing secrets.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if real database env values are missing.
  - Files: `backend/prisma/seed.js`, `backend/package.json`

- [x] (02E): Document the database contract and Phase 2 stability rule
  - Source of Truth: `docs/plans/Plan_1.md` > `## 1. Objective`; `docs/plans/Plan_1.md` > `## 10. Handoff Notes for Phase 2`
  - Source Requirements:
    - Database schema is finalized early.
    - Phase 2 must consume, not redefine, model names, enum values, and relationships.
    - Schema changes require migration notes and coordinated controller/view updates.
  - Details: Make the schema contract visible to future agents and teammates.
  - Dependencies: (02B)
  - User Action: None
  - Agent Work: Update docs to summarize models, relationships, migration command, seed command, and Phase 2 constraints.
  - Specific Steps:
    1. Update `docs/database-design.md` from the implemented Prisma schema.
    2. Include model names and relationship summary.
    3. State that later phases must not change field names or enum values without a migration note.
    4. Reference the seed command and Supabase Table Editor verification.
  - Output: Database design documentation.
  - Acceptance: Documentation matches `backend/prisma/schema.prisma` and does not overstate unimplemented behavior.
  - Validation: Compare docs against schema and Plan 1 handoff notes.
  - Blocked Condition: None
  - Files: `docs/database-design.md`

### Files or Modules Likely Created or Updated

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `backend/prisma/seed.js`
- `backend/package.json`
- `docs/database-design.md`

### Required Outputs / Artifacts

- Prisma datasource and generator.
- Complete schema for all nine main entities.
- Initial migration or clear user-action blocker.
- Seed script and seeded data or clear user-action blocker.
- Database contract documentation.

### Acceptance Criteria

- Prisma validates.
- Schema includes all required models, enums, mappings, and relationships.
- Migration and seed commands are ready and run when Supabase credentials exist.
- Real secrets are never committed or printed.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- `cd backend && npx prisma migrate dev --name init`
- `cd backend && npx prisma db seed`
- Supabase Table Editor manual table/data check.

### Explicit Non-Goals

- Product/category CRUD controllers.
- Cart/order/payment/review/report behavior.
- Supabase Auth or direct frontend database calls.

## Mandatory Batch03 - Backend MVC Utilities and Auth APIs

### Goal

Implement the backend foundation: Prisma client export, model wrappers, shared response/error conventions, validation/auth/admin middleware, and auth/user endpoints.

### Why this batch exists

The frontend and later phases depend on stable backend conventions and authentication before product, cart, order, and admin behavior can safely build on top.

### Inputs / Dependencies

- Batch01 backend shell.
- Batch02 Prisma schema and client generation.
- User-provided env values for live API checks.

### Tasks

- [x] (03A): Create the single Prisma client export and model modules
  - Source of Truth: `docs/plans/Plan_1.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_1.md` > `## 8. Implementation Steps`; `docs/plans/Master_Plan.md` > `### 9.2 Model Layer Rules`
  - Source Requirements:
    - Create Prisma client export in `backend/src/config/database.js`.
    - Add model modules wrapping Prisma operations.
    - Models must not accept HTTP `req` or `res`.
  - Details: Centralize database access and keep HTTP concerns out of models.
  - Dependencies: (02B)
  - User Action: None for code authoring.
  - Agent Work: Add one Prisma client export and focused model modules for planned entities, with auth/user operations implemented for Phase 1.
  - Specific Steps:
    1. Search for any existing database client or model wrappers.
    2. Create `backend/src/config/database.js` exporting one Prisma client.
    3. Add focused model modules matching Plan 1 names.
    4. Implement required user lookup/create/update/list helpers for auth and profile endpoints.
    5. Keep future entity model modules thin if added now; do not implement Phase 2 business behavior.
  - Output: Database config and model modules.
  - Acceptance: Controllers can import model functions without touching Prisma directly in multiple places.
  - Validation: Static import check and backend startup after env is configured.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only for live DB startup if real env values are missing.
  - Files: `backend/src/config/database.js`, `backend/src/models/*.model.js`

- [x] (03B): Add shared response helper and error/validation middleware
  - Source of Truth: `docs/plans/Plan_1.md` > `### 7.4 Shared API Response Shape`; `docs/plans/Plan_1.md` > `## 8. Implementation Steps`; `docs/plans/Master_Plan.md` > `### 9.1 Controller Layer Rules`
  - Source Requirements:
    - Controllers must return consistent JSON success/failure shapes.
    - Shared error middleware is required.
    - Validation middleware is required.
  - Details: Standardize responses before controller implementation.
  - Dependencies: (01B)
  - User Action: None
  - Agent Work: Implement reusable response helpers plus focused error and validation middleware.
  - Specific Steps:
    1. Search for existing response/error helpers.
    2. Add `successResponse` and `errorResponse` helpers matching Plan 1 shapes.
    3. Add error middleware that avoids leaking stack traces in production.
    4. Add simple validation middleware for required request body fields used by auth/profile routes.
    5. Ensure all helpers are small and reusable.
  - Output: Shared backend response and middleware utilities.
  - Acceptance: Controllers can use one response convention for success and failure.
  - Validation: Unit-level manual import or backend route smoke checks in later tasks.
  - Blocked Condition: None
  - Files: `backend/src/utils/response.js`, `backend/src/middlewares/error.middleware.js`, `backend/src/middlewares/validation.middleware.js`

- [x] (03C): Implement JWT token helper and auth/admin middleware
  - Source of Truth: `docs/plans/Plan_1.md` > `### 7.1 Architecture Decisions`; `docs/plans/Plan_1.md` > `## 4. Scope`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.1 AuthController`
  - Source Requirements:
    - Use JWT plus bcrypt for authentication.
    - Implement authentication middleware.
    - Implement admin authorization middleware.
  - Details: Add the security layer required by `/api/auth/me`, profile endpoints, and admin user listing.
  - Dependencies: (03A), (03B), (01D)
  - User Action: User must set a real `JWT_SECRET` in `backend/.env` before live protected-route validation.
  - Agent Work: Add token generation and request authorization helpers without logging token values.
  - Specific Steps:
    1. Search for existing JWT helpers.
    2. Add `backend/src/utils/generateToken.js` using `JWT_SECRET` and `JWT_EXPIRES_IN`.
    3. Add auth middleware that reads `Authorization: Bearer <token>`.
    4. Ensure middleware loads the current user and never returns `passwordHash`.
    5. Add admin middleware that requires `role === "admin"`.
  - Output: Auth utility and middleware.
  - Acceptance: Protected routes can reject missing/invalid tokens and allow valid users/admins.
  - Validation: Protected-route smoke tests in (03E) and Batch05.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if `JWT_SECRET` is missing for live validation.
  - Files: `backend/src/utils/generateToken.js`, `backend/src/middlewares/auth.middleware.js`, `backend/src/middlewares/admin.middleware.js`

- [x] (03D): Implement auth controller and routes
  - Source of Truth: `docs/plans/Plan_1.md` > `### 7.5 Auth API Contract`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.1 AuthController`
  - Source Requirements:
    - Implement `POST /api/auth/register`.
    - Implement `POST /api/auth/login`.
    - Implement `GET /api/auth/me`.
    - Register and login responses include safe user data plus JWT.
  - Details: Build the Phase 1 authentication API with bcrypt hashing and shared response shapes.
  - Dependencies: (03A), (03B), (03C)
  - User Action: User must provide real database and JWT env values for live API validation.
  - Agent Work: Implement controller actions and route bindings for register, login, and current user.
  - Specific Steps:
    1. Search for existing auth controller/route files before adding code.
    2. Hash registration passwords with bcrypt.
    3. Prevent duplicate email registration with a safe error message.
    4. Verify login credentials against `passwordHash`.
    5. Return safe user fields and token; never return `passwordHash`.
    6. Use shared response helpers for all success/failure responses.
  - Output: Auth controller and routes.
  - Acceptance: Register, login, and current-user endpoints behave as specified.
  - Validation: API smoke tests for `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live database or JWT env values are missing.
  - Files: `backend/src/controllers/auth.controller.js`, `backend/src/routes/auth.routes.js`

- [x] (03E): Implement user profile/admin controller and routes
  - Source of Truth: `docs/plans/Plan_1.md` > `## 4. Scope`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.2 UserController`
  - Source Requirements:
    - Implement `GET /api/users/profile`.
    - Implement `PUT /api/users/profile`.
    - Implement `GET /api/admin/users`.
    - Admin user list must be protected by admin authorization.
  - Details: Add the first protected user APIs needed by the foundation and admin shell.
  - Dependencies: (03A), (03B), (03C)
  - User Action: User must provide real env values and an admin seed/user for live admin-route validation.
  - Agent Work: Implement user profile and admin user list endpoints with safe user serialization.
  - Specific Steps:
    1. Search for existing user controller/route files before adding code.
    2. Add current profile read and update actions.
    3. Limit profile updates to Plan 1 user fields such as username, full name, phone, and address.
    4. Add admin-only user list action.
    5. Exclude `passwordHash` from every user response.
  - Output: User controller and routes.
  - Acceptance: Authenticated users can read/update their profile and only admins can list users.
  - Validation: API smoke tests for profile read/update and admin user listing as admin/customer/anonymous.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live database, JWT env, or admin user setup is missing.
  - Files: `backend/src/controllers/user.controller.js`, `backend/src/routes/user.routes.js`

- [x] (03F): Wire Express app, route mounting, CORS, JSON parsing, and error handling
  - Source of Truth: `docs/plans/Plan_1.md` > `## 4. Scope`; `docs/plans/Plan_1.md` > `## 8. Implementation Steps`; `docs/plans/Master_Plan.md` > `## 15. API Design Summary`
  - Source Requirements:
    - Auth and user routes must be mounted under `/api`.
    - Backend listens on `PORT`, default `5000`.
    - Controllers return JSON responses.
  - Details: Make the backend runnable with the Phase 1 routes mounted consistently.
  - Dependencies: (03B), (03D), (03E)
  - User Action: User must provide env values for live DB-backed routes.
  - Agent Work: Finish backend app/server setup and route mounting.
  - Specific Steps:
    1. Search for existing app/server setup before editing.
    2. Configure CORS and JSON body parsing.
    3. Mount auth routes at `/api/auth`.
    4. Mount user routes at `/api/users` and admin user route path under `/api/admin/users`.
    5. Add a safe health or root JSON response only if useful for startup verification.
    6. Register not-found and error middleware last.
  - Output: Runnable Express backend.
  - Acceptance: Backend starts on `PORT` default `5000` and exposes the Phase 1 API paths.
  - Validation: `cd backend && npm run dev`; API smoke tests in Batch05.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if required env values are missing for DB-backed startup.
  - Files: `backend/src/app.js`, `backend/src/server.js`, backend route files

### Files or Modules Likely Created or Updated

- `backend/src/config/database.js`
- `backend/src/models/*.model.js`
- `backend/src/utils/response.js`
- `backend/src/utils/generateToken.js`
- `backend/src/middlewares/auth.middleware.js`
- `backend/src/middlewares/admin.middleware.js`
- `backend/src/middlewares/error.middleware.js`
- `backend/src/middlewares/validation.middleware.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/user.controller.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/user.routes.js`
- `backend/src/app.js`
- `backend/src/server.js`

### Required Outputs / Artifacts

- Single Prisma client export.
- Model modules with HTTP-free database access.
- Shared response/error/validation utilities.
- JWT and authorization middleware.
- Auth and user controllers/routes.
- Runnable backend app.

### Acceptance Criteria

- All Phase 1 backend endpoints are implemented.
- Passwords are hashed.
- `passwordHash` is never returned.
- Missing/invalid tokens are rejected.
- Admin-only route rejects customers.
- Shared response shape is used consistently.

### Required Tests or Validations

- `cd backend && npm run dev`
- `POST http://localhost:5000/api/auth/register`
- `POST http://localhost:5000/api/auth/login`
- `GET http://localhost:5000/api/auth/me`
- `GET http://localhost:5000/api/users/profile`
- `PUT http://localhost:5000/api/users/profile`
- `GET http://localhost:5000/api/admin/users`

### Explicit Non-Goals

- Product/category/cart/order/payment/review/report controllers.
- Service/repository architecture rename.
- Supabase Auth.

## Mandatory Batch04 - Frontend Astryx Shell and Auth Views

### Goal

Build the first React frontend shell with Astryx imports, API helpers, auth context, route guards, layouts, and minimal Home/Login/Register/AdminDashboard views connected to Phase 1 auth APIs.

### Why this batch exists

Plan 1 requires frontend auth and layout foundations so later phases can add customer product, cart, checkout, order, and admin feature pages without redefining routing, auth state, or UI conventions.

### Inputs / Dependencies

- Batch01 frontend shell.
- Batch03 auth/user API contract.
- `docs/design/design.md` UI sections referenced by Plan 1.

### Tasks

- [ ] (04A): Install Astryx and configure frontend entry/environment
  - Source of Truth: `docs/plans/Plan_1.md` > `### 7.6 Frontend Foundation Contract`; `docs/design/design.md` > `## 2. Design System`
  - Source Requirements:
    - `main.jsx` must import Astryx reset and core CSS.
    - Frontend reads `VITE_API_BASE_URL`, default `http://localhost:5000/api`.
    - Astryx is the main UI reference.
  - Details: Establish frontend styling and configuration before adding layouts/views.
  - Dependencies: (01C), (01D)
  - User Action: None
  - Agent Work: Install Astryx if not already present and wire required CSS imports.
  - Specific Steps:
    1. Search for existing Astryx imports and package dependency.
    2. Install or declare `@astryxdesign/core`.
    3. Add `import "@astryxdesign/core/reset.css";` in `frontend/src/main.jsx`.
    4. Add `import "@astryxdesign/core/astryx.css";` in `frontend/src/main.jsx`.
    5. Ensure frontend config reads `VITE_API_BASE_URL` with the Plan 1 localhost default.
  - Output: Astryx-enabled frontend entry and config.
  - Acceptance: Frontend entry imports the required Astryx CSS exactly once and no backend secrets are referenced.
  - Validation: `cd frontend && npm run dev`.
  - Blocked Condition: None
  - Files: `frontend/package.json`, `frontend/src/main.jsx`, `frontend/.env.example`

- [ ] (04B): Add auth/user API helpers
  - Source of Truth: `docs/plans/Plan_1.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_1.md` > `### 7.5 Auth API Contract`
  - Source Requirements:
    - Add `authApi.js` and `userApi.js`.
    - React must call Express REST APIs only.
    - API helpers must use `VITE_API_BASE_URL`.
  - Details: Provide a small frontend API layer for auth and profile/admin user calls.
  - Dependencies: (04A), (03D), (03E)
  - User Action: None
  - Agent Work: Implement fetch-based or existing-project-pattern API helpers without exposing database config.
  - Specific Steps:
    1. Search for existing API helper patterns.
    2. Add a small shared request helper only if no equivalent exists.
    3. Implement register, login, current user, profile read/update, and admin user list calls.
    4. Attach bearer tokens through parameters or auth context integration.
    5. Handle shared response shapes predictably.
  - Output: Frontend auth/user API helpers.
  - Acceptance: Helpers target the backend API base URL and include no Prisma/Supabase imports.
  - Validation: Manual import check and browser/API smoke in Batch05.
  - Blocked Condition: None
  - Files: `frontend/src/api/authApi.js`, `frontend/src/api/userApi.js`, optional shared API helper

- [ ] (04C): Build AuthContext and route guards
  - Source of Truth: `docs/plans/Plan_1.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_1.md` > `## 8. Implementation Steps`; `docs/design/design.md` > `# 6. Navigation Components`
  - Source Requirements:
    - Build `AuthContext.jsx`.
    - Add route guards.
    - User menu behavior depends on authenticated user role.
  - Details: Centralize auth state for layouts and protected routes.
  - Dependencies: (04B)
  - User Action: None
  - Agent Work: Implement login/logout/register/current-user state handling and customer/admin route guard primitives.
  - Specific Steps:
    1. Search for existing context/provider code.
    2. Create `AuthContext.jsx` with token, user, loading, auth actions, and logout.
    3. Persist token using a simple local storage strategy unless an existing pattern says otherwise.
    4. Add route guard components or route metadata for authenticated and admin-only routes.
    5. Ensure loading/error states are representable for views.
  - Output: Auth provider and route guard primitives.
  - Acceptance: Views/layouts can access current user, role, token, loading, and auth actions.
  - Validation: Manual login/logout browser check in Batch05.
  - Blocked Condition: None
  - Files: `frontend/src/contexts/AuthContext.jsx`, `frontend/src/routes/AppRoutes.jsx`

- [ ] (04D): Build Astryx-based layouts and navigation shell
  - Source of Truth: `docs/plans/Plan_1.md` > `### 7.6 Frontend Foundation Contract`; `docs/design/design.md` > `## 5. Main Layouts`; `docs/design/design.md` > `# 6. Navigation Components`
  - Source Requirements:
    - Add basic customer and admin layout shells.
    - Layouts must use Astryx layout/navigation primitives first.
    - Do not build custom layout with raw `div` wrappers when Astryx layout applies.
  - Details: Create reusable page shells for customer, auth, and admin areas.
  - Dependencies: (04A), (04C)
  - User Action: None
  - Agent Work: Build `MainLayout`, `AuthLayout`, and `AdminLayout` with role-aware navigation.
  - Specific Steps:
    1. Run `npx astryx build "React ecommerce auth shell"` or equivalent Astryx discovery before writing UI.
    2. Use Astryx App Shell/Top Nav/Side Nav/Layout/Card/Form primitives where available.
    3. Build customer navigation with logo, home, auth actions, cart placeholder, and user menu.
    4. Build admin layout with sidebar/topbar placeholders for planned admin areas.
    5. Use tokens for any custom styling and avoid raw hex/px values.
  - Output: Layout shell components.
  - Acceptance: Layouts render without custom layout duplication and do not expose backend-only config.
  - Validation: `cd frontend && npm run dev`; browser inspection of customer/auth/admin shells.
  - Blocked Condition: None
  - Files: `frontend/src/layouts/MainLayout.jsx`, `frontend/src/layouts/AuthLayout.jsx`, `frontend/src/layouts/AdminLayout.jsx`, `frontend/src/components/common/`

- [ ] (04E): Build Home, Login, Register, and AdminDashboard placeholder views
  - Source of Truth: `docs/plans/Plan_1.md` > `## 4. Scope`; `docs/plans/Plan_1.md` > `### 7.5 Auth API Contract`; `docs/design/design.md` > `# 9. Authentication Components`; `docs/design/design.md` > `# 21. Common Feedback Components`
  - Source Requirements:
    - Create minimal `HomeView`, `LoginView`, `RegisterView`, and placeholder `AdminDashboardView`.
    - Login/register views must display loading, success, and error states.
    - Product list/search/filter/detail and advanced dashboard charts are out of scope.
  - Details: Implement only the frontend views required by the Phase 1 foundation.
  - Dependencies: (04B), (04C), (04D)
  - User Action: None
  - Agent Work: Build minimal views wired to auth APIs and safe placeholder routes for future areas.
  - Specific Steps:
    1. Use Astryx forms, fields, buttons, banners, and loading states.
    2. Implement login with email/password fields and error/loading handling.
    3. Implement registration with username, email, password, confirm password, full name, phone, and address fields.
    4. Show a basic home view that proves the shell is working without implementing product browsing.
    5. Show a placeholder admin dashboard guarded by admin role.
  - Output: Phase 1 frontend views.
  - Acceptance: Auth views can call the backend and render loading/success/error states; out-of-scope pages remain placeholders only.
  - Validation: Browser smoke tests for navigation, register, login, logout, and admin guard.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only for live auth API validation if backend env/database setup is missing.
  - Files: `frontend/src/views/HomeView.jsx`, `frontend/src/views/LoginView.jsx`, `frontend/src/views/RegisterView.jsx`, `frontend/src/views/admin/AdminDashboardView.jsx`

- [ ] (04F): Wire `App.jsx` and route table
  - Source of Truth: `docs/plans/Plan_1.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_1.md` > `## 8. Implementation Steps`
  - Source Requirements:
    - Add `frontend/src/routes/AppRoutes.jsx`.
    - Build route guards.
    - Confirm React never imports Prisma, Supabase client credentials, or database strings.
  - Details: Connect providers, layouts, and views into one runnable app.
  - Dependencies: (04C), (04D), (04E)
  - User Action: None
  - Agent Work: Register the route tree and wrap the app in the auth provider.
  - Specific Steps:
    1. Search for existing route setup.
    2. Wire `App.jsx` to `AuthProvider` and `AppRoutes`.
    3. Register public home/login/register routes.
    4. Register protected profile/admin placeholder routes as supported by Phase 1.
    5. Add fallback or unauthorized handling only if needed for route guard clarity.
    6. Search frontend source for forbidden Prisma/Supabase/database imports.
  - Output: Connected frontend app route tree.
  - Acceptance: App renders through route components and guards unauthenticated/admin-only paths.
  - Validation: `cd frontend && npm run dev`; search for forbidden imports with `rg`.
  - Blocked Condition: None
  - Files: `frontend/src/App.jsx`, `frontend/src/routes/AppRoutes.jsx`, frontend route/view files

### Files or Modules Likely Created or Updated

- `frontend/package.json`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/api/authApi.js`
- `frontend/src/api/userApi.js`
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/layouts/MainLayout.jsx`
- `frontend/src/layouts/AuthLayout.jsx`
- `frontend/src/layouts/AdminLayout.jsx`
- `frontend/src/views/HomeView.jsx`
- `frontend/src/views/LoginView.jsx`
- `frontend/src/views/RegisterView.jsx`
- `frontend/src/views/admin/AdminDashboardView.jsx`
- `frontend/src/components/common/`

### Required Outputs / Artifacts

- Astryx-enabled React app.
- Auth/user API helpers.
- Auth provider and route guards.
- Customer, auth, and admin layout shells.
- Minimal home/auth/admin placeholder views.

### Acceptance Criteria

- Frontend starts on Vite.
- Astryx styles are imported.
- Login/register show loading, success, and error states.
- Frontend uses `VITE_API_BASE_URL`.
- Frontend does not import Prisma or expose Supabase database credentials.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Browser navigation smoke test.
- Register/login/logout UI smoke test when backend is available.
- `rg "prisma|DATABASE_URL|DIRECT_URL|SUPABASE" frontend/src frontend/.env.example`

### Explicit Non-Goals

- Product list/detail/search/filter pages.
- Cart and checkout behavior.
- Full admin product/category/order/report pages.
- Raw custom design system outside Astryx.

## Mandatory Batch05 - Verification, Security Audit, and Phase 2 Handoff

### Goal

Run the Plan 1 verification suite, document blockers honestly, confirm security/MVC boundaries, and produce clear handoff notes for Phase 2.

### Why this batch exists

The foundation is only useful if backend, frontend, database, auth, and handoff contracts are verified before later phases build on them.

### Inputs / Dependencies

- Batch01 through Batch04 outputs.
- User-provided Supabase and JWT env values for live database/API validation.

### Tasks

- [ ] (05A): Run backend install, Prisma, migration, seed, and startup validations
  - Source of Truth: `docs/plans/Plan_1.md` > `## 9. Verification & Testing Plan`; `docs/plans/Master_Plan.md` > `## 20. Recommended Commands`
  - Source Requirements:
    - Run backend install.
    - Run Prisma validate, migration, seed, and backend dev startup.
    - Backend starts without Prisma connection errors.
  - Details: Verify the backend and database foundation with the planned commands.
  - Dependencies: Batch02, Batch03
  - User Action: User must provide real `backend/.env` values for Supabase and JWT before live migration/seed/startup can fully pass.
  - Agent Work: Run each available command and record exact pass/fail/blocked status.
  - Specific Steps:
    1. Run `cd backend && npm install`.
    2. Run `cd backend && npx prisma validate`.
    3. Run `cd backend && npx prisma migrate dev --name init` when env is available.
    4. Run `cd backend && npx prisma db seed` when env is available.
    5. Run `cd backend && npm run dev` long enough to confirm startup.
  - Output: Backend/database validation evidence.
  - Acceptance: Commands pass or blocked items are labeled `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command outputs summarized in the execution report.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live env values or Supabase project are missing.
  - Files: Execution report, no required code file unless fixes are needed.

- [ ] (05B): Run auth and user API smoke tests
  - Source of Truth: `docs/plans/Plan_1.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_1.md` > `### 7.5 Auth API Contract`
  - Source Requirements:
    - Smoke test register, login, auth me, profile read/update, and admin users.
    - Login returns a JWT.
    - Current user works with valid token and fails without one.
    - Admin users can list users; customers cannot.
  - Details: Prove the implemented APIs satisfy the contract.
  - Dependencies: (05A)
  - User Action: User must provide live backend env and seed/admin credentials for full smoke coverage.
  - Agent Work: Use Postman, curl, or equivalent local HTTP checks and record safe results.
  - Specific Steps:
    1. Start backend on `http://localhost:5000`.
    2. Register or use a demo customer without exposing passwords in the report.
    3. Login and verify token presence without printing the token.
    4. Call `/api/auth/me` with and without authorization.
    5. Call profile read/update as customer.
    6. Call `/api/admin/users` as admin, customer, and anonymous.
  - Output: API smoke-test results.
  - Acceptance: All required endpoint behaviors are confirmed or blocked by missing user setup.
  - Validation: HTTP smoke-test evidence summarized safely.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if backend env/database/admin setup is missing.
  - Files: Execution report, optional `docs/demo-checklist.md`

- [ ] (05C): Run frontend install/start and auth UI smoke tests
  - Source of Truth: `docs/plans/Plan_1.md` > `## 9. Verification & Testing Plan`; `docs/design/design.md` > `# 9. Authentication Components`; `docs/design/design.md` > `# 21. Common Feedback Components`
  - Source Requirements:
    - Frontend starts on Vite.
    - Login and register views display loading, success, and error states.
    - Views call backend APIs and do not access the database.
  - Details: Verify the first frontend shell and auth flow.
  - Dependencies: Batch04, (05B)
  - User Action: User must provide backend availability for live auth flow checks.
  - Agent Work: Run frontend commands and perform manual/browser smoke checks when tooling is available.
  - Specific Steps:
    1. Run `cd frontend && npm install`.
    2. Run `cd frontend && npm run dev`.
    3. Open the app and verify home/login/register routes.
    4. Submit validation-error states on login/register.
    5. Verify live login/register success/error states when backend is available.
    6. Verify admin route guard behavior.
  - Output: Frontend validation evidence.
  - Acceptance: Frontend starts and required auth views behave as planned.
  - Validation: Command output and browser/manual smoke-test summary.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if backend live setup is missing for API-backed UI checks.
  - Files: Execution report, optional `docs/demo-checklist.md`

- [ ] (05D): Audit security, MVC boundaries, and anti-duplication rules
  - Source of Truth: `docs/plans/Plan_1.md` > `## 9. Verification & Testing Plan`; `docs/plans/Master_Plan.md` > `## 24. Risk Management`; root `AGENTS.md` > `## 1. Smart Code Reuse & Anti-Redundancy`
  - Source Requirements:
    - `.env` files are not committed.
    - Frontend uses `VITE_API_BASE_URL` and does not expose Supabase database credentials.
    - MVC folder responsibilities remain clear.
    - No second database client, response helper, or JWT helper is created.
  - Details: Confirm the implementation remains clean and secure before Phase 2.
  - Dependencies: Batch01 through Batch04
  - User Action: None
  - Agent Work: Search the repo for secrets, duplicated helpers, forbidden frontend imports, and mixed responsibilities.
  - Specific Steps:
    1. Search for committed `.env` files and credential-like strings.
    2. Search frontend source for `DATABASE_URL`, `DIRECT_URL`, Prisma imports, and Supabase database connection references.
    3. Search backend for duplicate Prisma clients, duplicate response helpers, and duplicate JWT helpers.
    4. Inspect controllers/models to confirm HTTP logic is not in models and DB logic is not in views.
    5. Confirm files remain focused and split if an implementation file has grown into mixed responsibilities.
  - Output: Security and architecture audit result.
  - Acceptance: No secret exposure, no direct frontend database access, and no duplicated core helpers.
  - Validation: `rg`/grep search results and manual inspection summary.
  - Blocked Condition: None
  - Files: Execution report, changed files only if fixes are needed.

- [ ] (05E): Update demo checklist and Phase 2 handoff notes
  - Source of Truth: `docs/plans/Plan_1.md` > `## 10. Handoff Notes for Phase 2`; `docs/plans/Master_Plan.md` > `## 26. Final Submission Checklist`
  - Source Requirements:
    - Phase 2 must consume the Prisma client export, schema, response helper, auth/admin middleware, AuthContext, API helper pattern, and Astryx setup.
    - Phase 2 must not redefine database field names/enums, create second helpers, use Supabase Auth, or let frontend connect directly to Supabase PostgreSQL.
    - Demo checklist should reflect actual validation state.
  - Details: Preserve the foundation contract for the next plan.
  - Dependencies: (05A), (05B), (05C), (05D)
  - User Action: User may need to confirm manual Supabase Table Editor checks if the agent cannot inspect Supabase directly.
  - Agent Work: Update docs with verified commands, blocked items, and handoff constraints.
  - Specific Steps:
    1. Update `docs/demo-checklist.md` with actual Plan 1 demo checks and status.
    2. Add Phase 2 handoff notes to `README.md` or docs without claiming unimplemented features.
    3. Mark any live checks blocked by missing user setup instead of complete.
    4. List artifacts Phase 2 must reuse.
  - Output: Updated demo checklist and handoff notes.
  - Acceptance: Future agents can start Phase 2 without rereading all of Plan 1.
  - Validation: Manual doc review against Plan 1 handoff section.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only for manual Supabase checks the user must confirm.
  - Files: `docs/demo-checklist.md`, `README.md`

### Files or Modules Likely Created or Updated

- `docs/demo-checklist.md`
- `README.md`
- Execution report or completion summary from the future execution agent
- Runtime files only if validation finds defects requiring repair

### Required Outputs / Artifacts

- Backend command validation summary.
- API smoke-test summary.
- Frontend command/UI validation summary.
- Security/MVC/duplication audit summary.
- Phase 2 handoff notes.

### Acceptance Criteria

- Required commands and smoke checks pass or are explicitly blocked by user setup.
- Real secrets are absent from committed files.
- Frontend has no direct database access.
- Phase 2 handoff artifacts are clearly named.

### Required Tests or Validations

- `cd backend && npm install`
- `cd backend && npx prisma validate`
- `cd backend && npx prisma migrate dev --name init`
- `cd backend && npx prisma db seed`
- `cd backend && npm run dev`
- `cd frontend && npm install`
- `cd frontend && npm run dev`
- Auth/profile/admin API smoke tests
- Frontend auth UI smoke tests
- Secret and forbidden-import searches

### Explicit Non-Goals

- Claiming completion for checks blocked by missing user credentials.
- Implementing Phase 2 features during cleanup.
- Adding new architecture beyond the plan.

## Optional Future Tracks

These tracks are not part of the mandatory Plan 1 batch chain.

- Product and category browsing/admin CRUD are planned for later phases.
- Cart, checkout, order, COD payment, review, and report behavior are planned for later phases.
- Product image upload, pagination, responsive polish, dashboard charts, and online payment simulation are outside Plan 1 and should only be added when a later approved plan requires them.
- Real online payment, email system, chatbot, recommendation system, mobile app, Supabase Auth, and Supabase Edge Functions are not needed for this project scope.

## Dependency Chain

- Batch01 -> Batch02
- Batch02 -> Batch03
- Batch03 -> Batch04
- Batch04 -> Batch05

Batch04 can prepare static UI shell work after Batch01, but live auth validation depends on Batch03.

## Global Verification Checklist

- [ ] Root `AGENTS.md` was read and followed.
- [ ] Repository was searched before adding new helpers, utilities, configs, or business logic.
- [ ] No duplicated database client, response helper, JWT helper, or frontend API pattern was added.
- [ ] Implementation code is clean, idiomatic, typed where appropriate, and easy to understand.
- [ ] Backend and frontend dependencies install successfully.
- [ ] `backend/.env.example` and `frontend/.env.example` contain placeholders only.
- [ ] Real `.env` files and secrets are not committed.
- [ ] Prisma schema validates.
- [ ] Initial migration runs against Supabase when user credentials are available.
- [ ] Seed script runs when user credentials are available.
- [ ] Supabase Table Editor shows the nine main tables when migration is run.
- [ ] Passwords are stored as bcrypt hashes.
- [ ] Backend starts on `PORT`, default `5000`.
- [ ] Frontend starts on Vite.
- [ ] Auth and user APIs match the Plan 1 contract.
- [ ] All controllers use the shared JSON response shape.
- [ ] `GET /api/auth/me` works with a valid token and fails without one.
- [ ] `GET /api/admin/users` allows admins and rejects customers/anonymous users.
- [ ] Login and register views show loading, success, and error states.
- [ ] Frontend uses `VITE_API_BASE_URL`.
- [ ] Frontend does not import Prisma, Supabase database credentials, or database connection strings.
- [ ] Phase 2 handoff notes name the artifacts that must be reused.

## Progress Tracker

### Batches

- [x] Batch01 - Repository Shell and Environment Contract
- [x] Batch02 - Supabase Prisma Data Model and Seed
- [x] Batch03 - Backend MVC Utilities and Auth APIs
- [ ] Batch04 - Frontend Astryx Shell and Auth Views
- [ ] Batch05 - Verification, Security Audit, and Phase 2 Handoff

### Task IDs

#### Batch01
- [x] (01A): Inspect repository and establish root project files
- [x] (01B): Scaffold backend package and MVC folders
- [x] (01C): Scaffold frontend Vite React package and folders
- [x] (01D): Add environment examples and secret boundaries

#### Batch02
- [x] (02A): Configure Prisma datasource and client generation
- [x] (02B): Implement the complete Prisma schema contract
- [x] (02C): Create initial migration workflow against Supabase
- [x] (02D): Add seed data for demo categories, products, customer, and admin
- [x] (02E): Document the database contract and Phase 2 stability rule

#### Batch03
- [x] (03A): Create the single Prisma client export and model modules
- [x] (03B): Add shared response helper and error/validation middleware
- [x] (03C): Implement JWT token helper and auth/admin middleware
- [x] (03D): Implement auth controller and routes
- [x] (03E): Implement user profile/admin controller and routes
- [x] (03F): Wire Express app, route mounting, CORS, JSON parsing, and error handling

#### Batch04
- [ ] (04A): Install Astryx and configure frontend entry/environment
- [ ] (04B): Add auth/user API helpers
- [ ] (04C): Build AuthContext and route guards
- [ ] (04D): Build Astryx-based layouts and navigation shell
- [ ] (04E): Build Home, Login, Register, and AdminDashboard placeholder views
- [ ] (04F): Wire `App.jsx` and route table

#### Batch05
- [ ] (05A): Run backend install, Prisma, migration, seed, and startup validations
- [ ] (05B): Run auth and user API smoke tests
- [ ] (05C): Run frontend install/start and auth UI smoke tests
- [ ] (05D): Audit security, MVC boundaries, and anti-duplication rules
- [ ] (05E): Update demo checklist and Phase 2 handoff notes

## Completion Reporting Rules for Future Execution Agents

### BatchXX Execution Result

#### Completed Task IDs
- (XXA): complete / partial / blocked

#### Files Created or Modified
- path

#### Tests or Validations Run
- command: result

#### User Actions Required
- action: completed / pending / not required
- details: safe summary only, never include secrets

#### Blocked-by-User Status
- status: none / BLOCKED_BY_USER_ACTION
- reason: missing API key, missing provider project, missing manual setup, or other safe summary

#### Validation Responsibility
- user-provided setup confirmed: yes / no / not required
- agent validation run after setup: yes / no
- validation command: result

#### Acceptance Criteria Check
- criterion: satisfied / not satisfied / blocked

#### Artifacts Produced
- artifact

#### Progress Tracker Update
- task IDs updated

#### Key Implementation Decisions
- decision

#### Risks or Open Issues
- issue

#### Notes for Next Batch
- handoff notes
