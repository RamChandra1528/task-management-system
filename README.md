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
SEED_ON_START=false
SEED_ADMIN_PASSWORD=
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

The backend can seed a local workspace dataset with projects, users, teams, tasks, events, files, conversations, and notifications.

Run the seed script:

```bash
npm run seed
```

If `SEED_ON_START=true`, the backend will also seed automatically when it starts and the database is empty. Set `SEED_ADMIN_PASSWORD` before running any seed command.

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

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd Z_project_assignemnt
   npm install
   ```

2. **Configure Environment**
   ```bash
   copy backend\.env.example backend\.env
   copy frontend\.env.example frontend\.env
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Access the App**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## Features

### Core Modules
- **Dashboard** - Overview of projects, tasks, and team activity
- **Projects** - Create, manage, and organize projects
- **Tasks** - Task management with status tracking
- **Kanban Board** - Drag-and-drop task organization
- **Calendar** - Event and task scheduling
- **Team Management** - User roles, permissions, and invitations
- **Reports** - Analytics and project insights
- **File Management** - Upload, organize, and share files
- **Team Messages** - Communication and notifications
- **Settings** - Account and workspace configuration

### Modals
The application uses a centralized modal context for the following dialogs:
- **CreateProjectModal** - New project creation
- **CreateTaskModal** - Task creation and management
- **CreateEventModal** - Event scheduling
- **CreateFolderModal** - File organization
- **UploadFileModal** - File uploads
- **FilePreviewModal** - File viewing
- **ProjectDetailModal** - Project information
- **TaskDetailModal** - Task details
- **InviteMemberModal** - Team invitations
- **TeamMemberModal** - Member management
- **FormModal** - Generic form dialog

## Modal Implementation Guide

### ModalContext Usage
The `ModalContext` provides a global state for managing modal dialogs:

```javascript
import { useModal } from '@/context/ModalContext';

const { openModal, closeModal } = useModal();

// Open modal
openModal('CreateProjectModal', { projectId: 123 });

// Close modal
closeModal();
```

### Creating a New Modal
1. Create component in `src/components/`
2. Export from component file
3. Register in ModalContext
4. Use via `useModal()` hook
5. Pass data through modal parameters

## Testing & Launch Guide

### Before Deployment
1. **Environment Setup**
   - Verify all `.env` files are configured correctly
   - Test database connection
   - Check API endpoints

2. **Local Testing**
   ```bash
   npm run dev
   ```
   - Test all main routes and features
   - Verify form submissions
   - Check file uploads
   - Test authentication flows

3. **Build Verification**
   ```bash
   npm run build
   ```
   - Ensure no build errors
   - Check bundle size
   - Verify all assets are included

4. **Seeding (Optional)**
   ```bash
   npm run seed
   ```
   - Populates database with test data
   - Useful for demo and testing

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database URI set to production database
- [ ] JWT_SECRET changed from default
- [ ] SEED_ON_START set to false
- [ ] CLIENT_URL points to production frontend
- [ ] API_URL points to production backend
- [ ] Build completes without errors
- [ ] All tests pass
- [ ] Database migrations completed
- [ ] Backups created before deployment

## Vercel Deployment

### Frontend Deployment
1. Connect repository to Vercel
2. Set environment variables:
   - `VITE_API_URL` = your backend API URL
3. Build command: `npm run build --workspace frontend`
4. Output directory: `frontend/dist`

### Backend Deployment
Deploy backend separately (Railway, Heroku, or similar):
- Set `MONGODB_URI` to production database
- Set `CLIENT_URL` to your Vercel frontend URL
- Set `JWT_SECRET` to a secure random string
- Set `SEED_ON_START=false`

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**MongoDB connection error**
- Ensure MongoDB is running locally
- Check MONGODB_URI in .env
- Verify database credentials

**CORS errors**
- Check CLIENT_URL matches frontend URL
- Verify API_URL in frontend .env
- Check CORS configuration in backend

**Build failures**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Check Node.js version (should be 20+)

**Module not found errors**
- Verify all imports use correct paths
- Check component exports in index files
- Ensure all dependencies are installed

## Development Notes

- The frontend uses Vite for fast development
- TanStack Query handles data fetching and caching
- Tailwind CSS for styling
- JWT tokens stored in localStorage
- Backend uses MongoDB with Mongoose ODM
- Express middleware for auth and error handling
- All API routes require authentication except `/auth/*`

## Notes

- The UI reference screenshots are stored in the project root.
- Uploaded files and optional seed files are handled by the backend file routes.
- The frontend proxies `/api` to the backend during local Vite development.
- For production deployment, keep `SEED_ON_START=false` and replace the example JWT secret.
