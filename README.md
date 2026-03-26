# CareerOS

Enterprise AI Career Intelligence System built as a monorepo with a modular backend and a React frontend.

## Project Vision

CareerOS automates the job-search lifecycle:
- Track applications in a structured workflow
- Capture user preferences (roles, stack, salary, vibe, location, job type)
- Use AI and external intelligence (planned) for better job decisions
- Support role-based access and premium feature expansion

## Monorepo Structure

```text
CareerOS/
  apps/
    api/   # Express + TypeScript + MongoDB
    web/   # React + TypeScript + Vite
```

## Tech Stack

- Backend: Express, TypeScript, MongoDB (Mongoose), Zod, JWT
- Frontend: React, TypeScript, Vite, React Router
- Architecture: Modular Monolith, Controller-Service-Repository, Policy-based RBAC

## Current Features

- Auth (JWT):
  - Register, Login, Me, Logout
  - Supports both HttpOnly cookie and Authorization Bearer token
- Policy-based RBAC middleware
- Multi-step onboarding preferences:
  - Step 1: roles + stack
  - Step 2: minSalary + vibe
  - Step 3: targetLocations + jobType
- Starter frontend flow:
  - Register/Login pages
  - Protected onboarding flow
  - Dashboard profile/preferences view
- Postman collection included:
  - `CareerOS.postman_collection.json`

## API Base

- Versioned routes: `/api/v1`
- Default local API URL: `http://localhost:5000`

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure backend environment

Copy and edit:

```bash
apps/api/.env.example
```

Required values:
- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`

### 3) Run development

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Workspace Scripts

- `npm run dev` - run API + Web
- `npm run dev:api` - run API only
- `npm run dev:web` - run Web only
- `npm run build` - build all workspaces

## Development Roadmap

- [x] Monorepo foundation (api + web)
- [x] JWT auth + policy RBAC + preference onboarding APIs
- [x] Frontend auth/onboarding/dashboard starter
- [ ] Google OAuth signup/login
- [ ] Kanban job tracking board
- [ ] AI intelligence modules (sentiment, matching)
- [ ] Gmail sync engine
- [ ] Stripe + Admin analytics

## Notes

- This repo uses a root `.gitignore` to exclude `node_modules`, build output, and secret env files.
- Do not commit real `.env` files or credentials.
