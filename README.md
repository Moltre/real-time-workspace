# ⚡ CollabSpace – Real-Time Collaborative Workspace

> A production-style full-stack SaaS application for real-time team collaboration, built with React, Node.js, MongoDB, and Socket.io.

---

## 🌟 Features

- **JWT Authentication** – Secure register / login / logout flow
- **Workspace Management** – Create, browse, and archive team workspaces
- **Real-Time Ready** – Socket.io wired up with workspace rooms and cursor-presence events
- **Redis Caching** – Configured and ready for caching layers
- **Responsive Dark UI** – Glassmorphism-inspired design system with micro-animations
- **REST API** – Clean, versioned API with consistent response shape
- **Health-check endpoint** – `/api/health` returns uptime, DB state, and memory usage

---

## 🧱 Tech Stack

### Frontend (`/client`)

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Lightning-fast dev server & bundler |
| **Tailwind CSS v4** | Utility-first styling (via `@tailwindcss/vite`) |
| **Zustand** | Global state management |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **Socket.io-client** | Real-time event streaming |

### Backend (`/server`)

| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | HTTP server & REST API |
| **MongoDB + Mongoose** | Primary database & ODM |
| **JSON Web Tokens** | Stateless authentication |
| **bcryptjs** | Password hashing (12 rounds) |
| **Socket.io** | WebSocket real-time layer |
| **ioredis** | Redis caching client |
| **Helmet** | HTTP security headers |
| **Morgan** | HTTP request logging |
| **express-validator** | Request validation |
| **dotenv** | Environment variable management |
| **Nodemon** | Dev auto-reload |

---

## 📁 Folder Structure

```
real-time-collaborative-workspace/
├── README.md
├── client/                         # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── main.jsx                # React entry point
│       ├── App.jsx                 # Router root
│       ├── index.css               # Design system & global styles
│       ├── api/
│       │   ├── axios.js            # Base Axios config + interceptors
│       │   ├── auth.js             # Auth API calls
│       │   └── workspaces.js       # Workspace CRUD API calls
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.jsx   # Sidebar + Outlet shell
│       │   │   └── Sidebar.jsx     # Navigation sidebar
│       │   └── ui/
│       │       └── ProtectedRoute.jsx
│       ├── hooks/                  # Custom React hooks (reserved)
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Workspaces.jsx
│       │   ├── Workspace.jsx       # Workspace editor view
│       │   └── Settings.jsx
│       ├── store/                  # Zustand stores
│       │   ├── authStore.js
│       │   └── workspaceStore.js
│       └── utils/                  # Shared helpers (reserved)
│
└── server/                         # Node.js + Express backend
    ├── server.js                   # Entry point (thin – just boots)
    ├── .env
    ├── package.json
    └── src/
        ├── app.js                  # Express app (middleware + routes)
        ├── config/
        │   ├── db.js               # MongoDB connection
        │   ├── cors.js             # CORS configuration
        │   └── redis.js            # Redis client (graceful fallback)
        ├── models/
        │   ├── user.model.js
        │   └── workspace.model.js
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── user.controller.js
        │   └── workspace.controller.js
        ├── services/
        │   ├── auth.service.js
        │   ├── user.service.js
        │   └── workspace.service.js
        ├── routes/
        │   ├── health.routes.js
        │   ├── auth.routes.js
        │   ├── user.routes.js
        │   └── workspace.routes.js
        ├── middleware/
        │   ├── auth.js             # JWT verify + role-based guard
        │   ├── validate.js         # express-validator error formatter
        │   └── errorHandler.js     # 404 + global error handler
        ├── sockets/
        │   └── index.js            # Socket.io events (rooms, cursor)
        └── utils/
            ├── apiError.js         # Operational error factory
            ├── asyncHandler.js     # Async try/catch wrapper
            ├── logger.js           # Structured logger
            └── response.js         # Consistent JSON response helpers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** (local or [Atlas](https://cloud.mongodb.com))
- **Redis** *(optional in dev – server starts without it)*
- **npm** >= 9

### 1. Clone the repository

```bash
git clone <repo-url>
cd real-time-collaborative-workspace
```

### 2. Setup the Backend

```bash
cd server
# Edit .env with your values (MONGODB_URI, JWT_SECRET, etc.)
npm install
npm run dev        # starts on http://localhost:5000
```

### 3. Setup the Frontend

```bash
cd client
npm install
npm run dev        # starts on http://localhost:5173
```

> Both servers must run simultaneously. The Vite dev proxy forwards `/api` and `/socket.io` requests to the backend automatically.

---

## 🔌 API Reference

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Server status, DB state, uptime, memory |

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, receive JWT |
| GET | `/api/auth/me` | Yes | Current user info |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/:id` | Yes | Get user by ID |
| PUT | `/api/users/profile` | Yes | Update own profile |
| DELETE | `/api/users/account` | Yes | Deactivate account |

### Workspaces

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/workspaces` | Yes | List user's workspaces |
| GET | `/api/workspaces/:id` | Yes | Get workspace details |
| POST | `/api/workspaces` | Yes | Create workspace |
| PUT | `/api/workspaces/:id` | Yes | Update workspace (owner only) |
| DELETE | `/api/workspaces/:id` | Yes | Archive workspace (owner only) |

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rtcw
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🗺️ Roadmap

- [ ] Rich-text collaborative editor (Yjs + TipTap)
- [ ] Live cursor presence per workspace
- [ ] Workspace invites and member management UI
- [ ] File attachments and media
- [ ] Notifications system
- [ ] Comments and threaded discussions
- [ ] Admin analytics dashboard

---

## 📜 License

MIT (c) CollabSpace Contributors
