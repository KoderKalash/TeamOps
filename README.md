<div align="center">

# TeamOps

### Enterprise-Grade Project & Task Management API

A production-ready REST API built with security-first principles, clean architecture, and scalable design patterns for modern team collaboration.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

[Features](#features) • [Architecture](#architecture) • [API Documentation](#api-documentation) • [Getting Started](#getting-started) • [Security](#security)

</div>

---

## Overview

TeamOps is a **backend-only REST API** designed for enterprise-grade project and task management. Built with a focus on data integrity, role-based access control, and secure authentication patterns, it provides a robust foundation for team collaboration platforms.

### Key Highlights

- **Security-First Design** — JWT authentication, bcrypt hashing, and multi-layered authorization
- **Clean Architecture** — Modular, maintainable, and scalable codebase following industry best practices
- **Production-Ready** — Comprehensive error handling, validation, and consistent API responses
- **RBAC Implementation** — Granular permission system with role and ownership-based access control

---

## Features

### 🔐 Authentication & Security

- **JWT-based authentication** with secure token management
- **Password encryption** using industry-standard bcrypt
- **Centralized error handling** with consistent response formats
- **Middleware-driven protection** for all secured endpoints

### 👥 Role-Based Access Control

- **Three-tier role system**: `user`, `manager`, `admin`
- **Hybrid authorization model** combining roles and resource ownership
- **Server-controlled permissions** preventing client-side privilege escalation
- **Field-level access control** for sensitive operations

### 📊 Project Management

- Full CRUD operations with role-based restrictions
- Project ownership and membership tracking
- Hierarchical access control (owner > admin > manager > user)
- Automatic validation of project boundaries

### 🎯 Task Management

- **Project-scoped tasks** with strict boundary enforcement
- **Member-only assignment** ensuring tasks are only assigned to project members
- **Role-aware visibility** controlling task access based on user permissions
- **Granular update permissions** with field-level validation
- **Safe deletion** with ownership verification

### 👤 Member Management

- Add and manage project members with ownership validation
- Duplicate-prevention mechanisms
- Server-controlled membership updates
- Role-based member visibility

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT (jsonwebtoken) |
| Encryption | bcrypt |

### Project Structure
```text
src/
├── controllers/      # Business logic and request handlers
├── models/           # Mongoose schemas and data models
├── routes/           # API endpoint definitions
├── middleware/       # Authentication, authorization, and error handling
├── utils/            # Helper functions and utilities
├── app.js            # Express application configuration
└── server.js         # Server initialization and startup
```

### Authorization Model

TeamOps implements a **multi-layered authorization system**:

1. **Role-Based Access** — Permissions assigned based on user roles
2. **Ownership Validation** — Resource creators maintain special privileges
3. **Membership Verification** — Project-level access control
4. **Field-Level Permissions** — Granular control over data mutations

This architecture prevents:
- Unauthorized cross-project access
- Privilege escalation attacks
- Unauthorized data mutations
- Assignment of tasks to non-members

---

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create new user account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |

### Projects

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| `POST` | `/api/projects` | Create new project | Manager, Admin |
| `GET` | `/api/projects` | List accessible projects | All roles (filtered by access) |
| `PATCH` | `/api/projects/:id` | Update project details | Owner, Admin |
| `DELETE` | `/api/projects/:id` | Delete project | Owner, Admin |
| `PATCH` | `/api/projects/:projectId/members` | Add project members | Owner, Admin |

### Tasks

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| `POST` | `/api/projects/:projectId/tasks` | Create task in project | Project members |
| `GET` | `/api/projects/:projectId/tasks` | List project tasks | Project members |
| `PATCH` | `/api/tasks/:taskId` | Update task | Role-dependent |
| `DELETE` | `/api/tasks/:taskId` | Delete task | Task creator, Admin |

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/KoderKalash/TeamOps.git

# Navigate to project directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teamops
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## Security

### Authentication Flow

1. User credentials are validated against encrypted database records
2. JWT token issued with user ID and role embedded
3. Token required for all protected endpoints
4. Middleware validates token and extracts user context

### Data Protection

- **Password Storage**: Bcrypt with salt rounds (10+)
- **Token Security**: JWT with expiration and signature verification
- **Input Validation**: Mongoose schema validation and custom middleware
- **Error Handling**: Sanitized error messages preventing information leakage

### Best Practices Implemented

- ✅ No sensitive data in JWT payload
- ✅ Password never returned in API responses
- ✅ Role and permission checks on every protected route
- ✅ MongoDB injection prevention via Mongoose
- ✅ Consistent HTTP status codes and error formats

---

## Testing

### Quality Assurance

- **Manual testing** performed using Postman
- **Role-based scenarios** validated across all user types
- **Edge cases** tested for authorization boundaries
- **Ownership validation** verified for all resource operations
- **HTTP compliance** ensured with proper status codes

### Test Coverage

- ✅ Authentication flows
- ✅ RBAC enforcement
- ✅ Project ownership rules
- ✅ Task assignment validation
- ✅ Member management boundaries
- ✅ Error handling scenarios

---

## Roadmap

### Planned Enhancements

- [ ] **Member Removal** with task reassignment policies
- [ ] **Pagination & Filtering** for large datasets
- [ ] **Activity Logs** for audit trails
- [ ] **Real-time Notifications** using WebSocket
- [ ] **Automated Test Suite** with Jest/Mocha
- [ ] **API Documentation** with Swagger/OpenAPI
- [ ] **Rate Limiting** and request throttling
- [ ] **Frontend Integration** examples and SDKs

---

## Contributing

We welcome contributions from the community. Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

For questions, issues, or feature requests:

- 🐛 Issues: [GitHub Issues](https://github.com/KoderKalash/TeamOps/issues)

---

<div align="center">

**Built with precision. Designed for scale.**

Made with ❤️ for modern development teams

</div>