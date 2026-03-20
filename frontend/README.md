<div align="center">

# TeamOps Frontend

### Next.js Client Application

Modern React frontend for TeamOps with App Router, client-side authentication, and backend API proxy.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Overview

Next.js 16 frontend application for TeamOps providing authentication flows, protected routes, and project management UI. Built with App Router architecture and server-side API proxying to eliminate CORS complexity.

---

## Features

### Authentication

- Login and signup forms with validation
- JWT token storage in `localStorage` (`teamops_token`)
- Client-side authentication guard for protected routes
- Automatic token injection in API requests

### Routing

- **Public Routes**: Home, Login, Signup
- **Protected Routes**: Dashboard (requires authentication)
- Client-side route protection with redirect to login

### API Integration

- Next.js route handlers proxy requests to backend
- Eliminates CORS configuration complexity
- Centralizes API communication through `/api/*` endpoints
- Token forwarding to backend automatically

---

## Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home/landing page |
| `/login` | Public | User login form |
| `/signup` | Public | User registration form |
| `/dashboard` | Protected | Main application dashboard |

---

## API Proxy Routes

All API calls go through Next.js route handlers that forward to the backend:

| Frontend Route | Backend Endpoint | Method | Description |
|---------------|------------------|--------|-------------|
| `/api/auth/signup` | `/signup` | `POST` | User registration |
| `/api/auth/login` | `/login` | `POST` | User authentication |
| `/api/projects` | `/api/projects` | `GET` | List projects |
| `/api/projects` | `/api/projects` | `POST` | Create project |

**Benefits of proxy pattern:**
- No CORS configuration required
- Backend URL not exposed to client
- Centralized request/response handling
- Easy to add middleware (logging, validation)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| State | React hooks |
| HTTP Client | Fetch API |

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Running TeamOps backend (see root README)
- npm or yarn

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` in the `frontend/` directory:
```env
BACKEND_URL=http://localhost:8000
```

**Note:** This URL is used by Next.js route handlers to proxy requests. It is never exposed to the browser.

---

## Development

### Running Locally
```bash
npm run dev
```

Application runs on `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint checks |

---

## Project Structure
```text
frontend/
├── app/
│   ├── api/              # Backend proxy route handlers
│   │   ├── auth/
│   │   └── projects/
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── dashboard/        # Protected dashboard
│   ├── layout.js         # Root layout
│   └── page.js           # Home page
├── components/           # Reusable React components
├── lib/                  # Utilities and helpers
└── public/               # Static assets
```

---

## Authentication Flow

1. User submits login/signup form
2. Frontend calls Next.js API route (`/api/auth/login`)
3. Next.js route handler proxies request to backend
4. Backend returns JWT token
5. Frontend stores token in `localStorage`
6. Token automatically included in subsequent API requests
7. Protected routes check for token presence before rendering

---

## Full Project Setup

This README covers frontend setup only. For complete setup including backend and testing:

See root project README: `../README.md`

---

## License

ISC License — see root `package.json` for details.

---

<div align="center">

**Built with Next.js App Router and modern React patterns**

</div>