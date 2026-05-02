# TaskPro

TaskPro is a full-stack project management workspace with dashboards for projects, tasks, kanban, calendar, team management, reports, files, messages, and settings.

The project is organized as an npm workspace with a React/Vite frontend and an Express/MongoDB backend.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, TanStack Query, Recharts, Lucide Icons
- Backend: Node.js, Express, MongoDB, Mongoose, JWT authentication
- Tooling: npm workspaces, concurrently

## Project Structure

```text
.
+-- backend/
|   +-- src/
|   |   +-- controllers/
|   |   +-- middleware/
|   |   +-- models/
|   |   +-- routes/
|   |   +-- seed/
|   |   +-- utils/
|   |   +-- app.js
|   |   +-- server.js
|   +-- package.json
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   +-- context/
|   |   +-- lib/
|   |   +-- pages/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   +-- package.json
+-- package.json
+-- README.md
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally, or a MongoDB connection string

## Setup

Install dependencies from the project root:

```bash
npm install
```

Create the backend environment file:

```bash
copy backend\.env.example backend\.env
```

Create the frontend environment file:

```bash
copy frontend\.env.example frontend\.env
```

Default backend environment:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskpro
JWT_SECRET=super-secret-taskpro-key
CLIENT_URL=http://localhost:5173
SEED_ON_START=true
```

Default frontend environment:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run The App

Start frontend and backend together:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:5000/api
```

You can also run each app separately:

```bash
npm run dev:frontend
npm run dev:backend
```

## Seed Data

The backend can seed an Aurora Workspace demo dataset with projects, users, teams, tasks, events, files, conversations, and notifications.

Run the seed script:

```bash
npm run seed
```

If `SEED_ON_START=true`, the backend will also seed automatically when it starts and the database is empty.

Demo login:

```text
Email: emma@aurora.com
Password: TaskPro123!
```

## Useful Scripts

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run seed
```

Frontend-only build:

```bash
npm run build --workspace frontend
```

Backend verification:

```bash
npm run build --workspace backend
```

## API Documentation

See [docs/API.md](docs/API.md) for the complete API route reference, request examples, auth requirements, and role restrictions.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Railway backend/MongoDB deployment and Vercel frontend deployment.

## Main Routes

- `/` landing page
- `/login` login page
- `/signup` signup page
- `/app/overview` dashboard overview
- `/app/projects` project management
- `/app/tasks` task table
- `/app/board` kanban board
- `/app/calendar` calendar
- `/app/team` team management
- `/app/reports` reports dashboard
- `/app/files` file management
- `/app/messages` team messages
- `/app/settings` account and workspace settings

## Notes

- The UI reference screenshots are stored in the project root.
- Uploaded and seeded files are handled by the backend file routes.
- The frontend proxies `/api` to the backend during local Vite development.
- For a real production deployment, set `SEED_ON_START=false` after any demo seed run and replace the example JWT secret.
