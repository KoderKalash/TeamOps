<div align="center">

# TeamOps

### Full-Stack Project Management Platform

Production-grade team collaboration system with secure authentication, granular authorization, and automated testing.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

[Features](#features) • [Architecture](#architecture) • [API Reference](#api-reference) • [Getting Started](#getting-started) • [Testing](#testing)

</div>

---

## Overview

TeamOps is a full-stack project management application demonstrating backend fundamentals expected in real product teams: JWT authentication with protected routes, role-based and ownership-based authorization, reusable query abstractions, and automated test execution in CI.

Built with Node.js + Express + MongoDB on the backend and Next.js on the frontend, with clear separation of concerns and testable architecture.

---

## Features

### Authentication & Security

- JWT-based authentication with secure token management
- Password hashing with bcrypt via model hooks
- Email normalization and duplicate prevention
- Protected routes with middleware-driven authorization
- Security headers via Helmet
- Configured CORS policy for frontend origin control
- Layered rate limiting (global API limiter + stricter auth limiter)

### Role-Based Access Control

- **Three-tier role system**: `user`, `manager`, `admin`
- **Route-level access control** via `restrictTo()` middleware
- **Ownership validation** for project and task mutations
- **Field-level permissions** (e.g., users can only update task status)

### Projects

- Full CRUD operations with role and ownership checks
- Add members to projects (validated by user ID)
- Query capabilities: filter, search (`name`, `description`), sort, pagination
- Max limit enforcement (50 items per page)

### Tasks

- Create and list tasks scoped to projects
- Update and delete with role-specific restrictions
- Assignment validation (assignees must be project members)
- Granular permission model based on user role

### Advanced Querying

- **Reusable query layer** with filtering, sorting, pagination, search
- Configurable search fields per resource
- Consistent API contract across all list endpoints
- Performance-conscious pagination with enforced limits

### Automated Testing

- Jest + Supertest integration tests
- In-memory MongoDB for isolated test execution
- CI pipeline running tests on every push/PR
- Current coverage: authentication flows (6 passing tests)

---

## Architecture

### Tech Stack

**Backend:**
- Node.js 20
- Express 5
- MongoDB + Mongoose 9
- JWT (jsonwebtoken)
- bcrypt
- Helmet + CORS
- express-rate-limit
- Jest + Supertest + mongodb-memory-server

**Frontend:**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Next.js API routes as backend proxy

### Project Structure
```text
TeamOps/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration and environment
│   │   ├── controllers/     # Request handlers and business logic
│   │   ├── middleware/      # Auth, RBAC, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API endpoint definitions
│   │   ├── utils/           # Query abstractions and helpers
│   │   ├── app.js           # Express application
│   │   └── server.js        # Server initialization
│   └── tests/               # Integration tests
└── frontend/
    ├── app/
    │   ├── api/             # Backend proxy routes
    │   ├── login/           # Authentication pages
    │   ├── signup/
    │   └── dashboard/       # Protected application pages
    ├── components/          # React components
    └── lib/                 # Utilities and helpers
```

### Authorization Model

**Multi-layered authorization:**
1. **Route-level access** — `restrictTo()` enforces role requirements
2. **Ownership validation** — Controllers verify resource ownership
3. **Membership checks** — Task operations validate project membership
4. **Field-level permissions** — Role-specific mutation rules

---

## API Reference

### Authentication

| Method | Endpoint  | Access | Description |
|--------|-----------|--------|-------------|
| `POST` | `/signup` | Public | Create new account with email/password |
| `POST` | `/login`  | Public | Authenticate and receive JWT |

### Projects

| Method   | Endpoint                           | Authorization | Description |
|----------|-----------------------------------|---------------|-------------|
| `POST`   | `/api/projects`                   | Manager, Admin | Create new project |
| `GET`    | `/api/projects`                   | Authenticated | List accessible projects (filtered by role/membership) |
| `PATCH`  | `/api/projects/:id`               | Manager, Admin + Ownership | Update project details |
| `DELETE` | `/api/projects/:id`               | Manager, Admin + Ownership | Delete project |
| `PATCH`  | `/api/projects/:projectId/members` | Owner, Admin | Add members to project |

**Query Parameters:**
- `filter` — Filter by field values
- `search` — Search in `name`, `description`
- `sort` — Sort by any field
- `page`, `limit` — Pagination (max 50/page)

### Tasks

| Method   | Endpoint                         | Authorization | Description |
|----------|----------------------------------|---------------|-------------|
| `POST`   | `/api/projects/:projectId/tasks` | Owner, Admin | Create task in project |
| `GET`    | `/api/projects/:projectId/tasks` | Project members | List project tasks |
| `PATCH`  | `/api/tasks/:taskId`             | Role-dependent | Update task (field restrictions apply) |
| `DELETE` | `/api/tasks/:taskId`             | Manager (+ ownership), Admin | Delete task |

### Users

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET`  | `/users` | Admin only | List all users with query support |

**Query Parameters:**
- `filter`, `search` (`name`, `email`), `sort`, `page`, `limit`

### Health Check

| Method | Endpoint  | Access | Description |
|--------|-----------|--------|-------------|
| `GET`  | `/health` | Public | API health status |

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

**Environment Variables** (`.env`):
```env
PORT=8000
MONGO_URL=your_mongo_uri
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
SEARCH_STRATEGY=text
CORS_ORIGIN=http://localhost:3000
```

Backend runs on `http://localhost:8000` (or configured `PORT`).

### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# Start development server
npm run dev
```

**Environment Variables** (`.env.local`):
```env
BACKEND_URL=http://localhost:8000
```

Frontend runs on `http://localhost:3000`.

**Note:** Frontend uses Next.js API routes (`/api/*`) to proxy requests to the backend, avoiding CORS issues and centralizing API calls.

---

## Testing

### Backend Tests

**Framework:** Jest + Supertest  
**Test Database:** mongodb-memory-server (in-memory MongoDB)  
**Current Coverage:** Authentication flows (1 suite, 6 tests)
```bash
cd backend
npm test
```

**Current Status:** All tests passing

### Continuous Integration

GitHub Actions workflow (`.github/workflows/test.yml`):
- Triggers on push/PR to `main`
- Runs on Node 20
- Executes full backend test suite
- Fails CI if tests don't pass

---

## Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with nodemon (auto-reload) |
| `npm test` | Run Jest integration tests |
| `npm run format` | Format code with Prettier |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

---

## Known Limitations & Future Work

### Current Gaps

- No refresh token or session rotation flow
- Limited test coverage (auth only)
- No centralized validation layer (Zod/Joi)
- No API documentation generator (Swagger/OpenAPI)

### Planned Enhancements

**High Priority:**
1. Request validation middleware with consistent error contracts
2. Expand test coverage to projects/tasks authorization matrix
3. Audit logging and monitoring/observability baseline
4. OpenAPI spec + hosted documentation
5. Refresh token flow and logout invalidation strategy

**Medium Priority:**
- Containerized local setup with `docker-compose`
- Comprehensive negative case testing
- Monitoring and observability setup
- Performance benchmarking

---

## Contributing

1. Create a feature branch from `main`
2. Keep changes focused and well-tested
3. Run backend tests before opening PR (`npm test`)
4. Open PR with clear summary and risk assessment
5. Ensure CI passes before requesting review

---

## License

ISC License — see `backend/package.json` for details.

---

<div align="center">

**Built with clean architecture. Designed for maintainability.**

</div>
