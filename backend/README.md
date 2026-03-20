<div align="center">

# TeamOps Backend

### REST API for Project & Task Management

Production-grade Node.js backend with JWT authentication, role-based authorization, and automated testing.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

</div>

---

## Overview

RESTful API for TeamOps demonstrating authentication, role-based access control, ownership validation, and reusable query patterns. Built with Node.js, Express, and MongoDB with comprehensive test coverage and CI integration.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Testing | Jest + Supertest + mongodb-memory-server |

---

## Features

### Authentication & Authorization

- User registration and login with JWT issuance
- Password hashing via Mongoose pre-save hook
- Three-tier role system: `user`, `manager`, `admin`
- Route-level access control with `restrictTo()` middleware
- Ownership and membership validation in controllers

### Project Management

- Full CRUD operations with role-based restrictions
- Project ownership tracking
- Member management with validation
- Query support: filtering, sorting, search, pagination

### Task Management

- Task creation and listing scoped to projects
- Assignment validation (assignees must be project members)
- Role-specific update permissions
- Ownership checks for mutations

### Query Layer

- Reusable utility for filtering, sorting, search, pagination
- Configurable search fields per resource
- Pagination with enforced limits (max 50/page)
- Consistent API contract across endpoints

### Testing & CI

- Integration tests with Jest and Supertest
- In-memory MongoDB for isolated test execution
- GitHub Actions workflow running tests on every push/PR
- Current coverage: authentication flows

### Security Middleware

- `helmet()` for secure HTTP headers
- `cors()` with configured frontend origin
- Global API rate limiter on `/api/*`
- Stricter auth limiter on `/signup` and `/login`

---

## Project Structure
```text
backend/
├── src/
│   ├── config/          # Environment configuration
│   ├── controllers/     # Request handlers and business logic
│   ├── middleware/      # Auth, RBAC, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoint definitions
│   ├── utils/           # Query utilities and helpers
│   ├── app.js           # Express application setup
│   └── server.js        # Server initialization
├── tests/               # Integration tests
├── .env.example         # Environment template
├── jest.config.js       # Jest configuration
└── package.json         # Dependencies and scripts
```

---

## API Reference

### Public Routes

| Method | Endpoint  | Description |
|--------|-----------|-------------|
| `POST` | `/signup` | Register new user |
| `POST` | `/login`  | Authenticate and receive JWT |
| `GET`  | `/health` | API health check |

### Protected Routes

#### Users

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET`  | `/users` | Admin only | List all users with query support |

#### Projects

| Method   | Endpoint                           | Authorization | Description |
|----------|-----------------------------------|---------------|-------------|
| `POST`   | `/api/projects`                   | Manager, Admin | Create new project |
| `GET`    | `/api/projects`                   | Authenticated | List accessible projects |
| `PATCH`  | `/api/projects/:id`               | Manager, Admin + Owner/Admin | Update project details |
| `DELETE` | `/api/projects/:id`               | Manager, Admin + Owner/Admin | Delete project |
| `PATCH`  | `/api/projects/:projectId/members` | Manager, Admin + Owner/Admin | Add project members |

#### Tasks

| Method   | Endpoint                         | Authorization | Description |
|----------|----------------------------------|---------------|-------------|
| `POST`   | `/api/projects/:projectId/tasks` | Manager, Admin + Owner/Admin | Create task in project |
| `GET`    | `/api/projects/:projectId/tasks` | Authenticated + Membership/Ownership | List project tasks |
| `PATCH`  | `/api/tasks/:taskId`             | Authenticated + Role-specific rules | Update task |
| `DELETE` | `/api/tasks/:taskId`             | Manager (+ ownership), Admin | Delete task |

---

## Query Parameters

List endpoints support the following query parameters:

### Filter
Filter by direct model fields:
```http
GET /api/projects/PROJECT_ID/tasks?status=todo&priority=high
```

### Search
Regex search on controller-defined fields:
```http
GET /api/projects?search=team
```

### Sort
Comma-separated sort fields (prefix with `-` for descending):
```http
GET /api/projects?sort=-createdAt,name
```

### Pagination
Control page and limit (max 50 items per page):
```http
GET /api/projects?page=1&limit=10
```

### Combined Example
```http
GET /api/projects?search=team&sort=-createdAt&page=1&limit=10
```

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env    # macOS/Linux
copy .env.example .env  # Windows PowerShell
```

### Environment Variables

Create `.env` file with the following variables:
```env
PORT=8000
MONGO_URL=your_mongo_uri
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
SEARCH_STRATEGY=text
CORS_ORIGIN=http://localhost:3000
```

### Running the Application
```bash
# Start development server with auto-reload
npm run dev
```

Server starts on `http://localhost:8000` (or configured `PORT`).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run Jest integration tests |
| `npm run format` | Format code with Prettier |

---

## Testing

### Running Tests
```bash
cd backend
npm test
```

### Test Configuration

- **Framework**: Jest with Supertest
- **Test Database**: mongodb-memory-server (in-memory MongoDB instance)
- **Current Coverage**: Authentication integration tests (`tests/auth.test.js`)

### Test Suite

Current automated tests cover:
- User signup with validation
- User login with JWT generation
- Protected route authentication guards
- Invalid credentials handling
- Duplicate email prevention

---

## Continuous Integration

GitHub Actions workflow (`.github/workflows/test.yml`):

- **Trigger**: Push or PR to `main` branch
- **Node Version**: 20
- **Steps**:
  1. Checkout code
  2. Install dependencies with `npm ci`
  3. Run test suite with `npm test`
  4. Fail CI if tests don't pass

---

## Security

### Authentication Flow

1. User submits credentials to `/signup` or `/login`
2. Password hashed via Mongoose pre-save hook (bcrypt)
3. JWT token generated and returned on successful auth
4. Token required in `Authorization: Bearer <token>` header for protected routes
5. Middleware validates token and extracts user context

### Authorization Model

**Multi-layered checks:**
- **Route-level**: `restrictTo()` middleware enforces role requirements
- **Ownership**: Controllers verify resource ownership before mutations
- **Membership**: Task operations validate project membership
- **Field-level**: Role-specific rules for updates (e.g., users can only update task status)

### Security Best Practices

- Passwords never stored in plaintext
- JWT payload contains minimal user data
- Passwords never returned in API responses
- MongoDB injection prevention via Mongoose
- Consistent error messages preventing information leakage
- Helmet security headers enabled
- CORS policy configured for allowed frontend origin
- Request throttling enabled via express-rate-limit

---

## License

ISC License — see `package.json` for details.

---

<div align="center">

**Built with security-first principles and clean architecture**

</div>
