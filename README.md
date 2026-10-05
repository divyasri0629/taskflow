# TaskFlow

A full-stack task management app — React (Vite) frontend, Node/Express backend,
MongoDB for storage, JWT authentication. Built as a portfolio/resume project.

## Features

- Register / login with JWT-based auth (passwords hashed with bcrypt)
- Create, edit, delete tasks
- Kanban-style board: To do / In progress / Done
- Priority levels and due dates per task
- Tasks are scoped per user (you only see your own)

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite, React Router, Tailwind CSS v4, Axios |
| Backend  | Node.js, Express, Mongoose |
| Database | MongoDB (Atlas recommended) |
| Auth     | JWT + bcrypt |
| Deploy   | AWS EC2 + Nginx + PM2 (see `DEPLOYMENT.md`) |

## Project structure

```
taskflow/
├── backend/
│   ├── config/db.js
│   ├── models/User.js
│   ├── models/Task.js
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   ├── routes/tasks.js
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/Login.jsx, Register.jsx, Dashboard.jsx
│   │   ├── components/Navbar.jsx, TaskCard.jsx, TaskForm.jsx
│   │   ├── api.js
│   │   └── App.jsx
│   └── .env.example
└── DEPLOYMENT.md
```

## Running locally

**Backend**
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                # requires nodemon; or `npm start`
```

**Frontend**
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## API endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Log in, returns JWT |
| GET | `/api/tasks` | ✓ | List your tasks (`?status=` filter optional) |
| POST | `/api/tasks` | ✓ | Create a task |
| PUT | `/api/tasks/:id` | ✓ | Update a task |
| DELETE | `/api/tasks/:id` | ✓ | Delete a task |

## Deploying to AWS

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full EC2 + Nginx + PM2 + MongoDB
Atlas walkthrough, including an architecture diagram and interview talking points.
