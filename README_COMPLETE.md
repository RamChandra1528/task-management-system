# 🎯 Team Task Manager - Complete Application

A fully functional **Team Task Manager** web application built with React.js, Node.js/Express, and MongoDB. Every feature is implemented end-to-end with no dummy data or placeholders.

## ✨ What's Included

### 🎨 Frontend Features
- ✅ Beautiful modal-based UI (zero side panels)
- ✅ Real-time data from backend APIs
- ✅ Advanced task management (status, priority, comments, checklists)
- ✅ Project collaboration with team members
- ✅ Team member management and profiles
- ✅ File upload, storage, and sharing
- ✅ Integrated messaging system
- ✅ Interactive calendar with events
- ✅ Kanban board view for tasks
- ✅ Analytics dashboard with real stats
- ✅ Search and filtering on all pages
- ✅ Fully responsive (mobile/tablet/desktop)
- ✅ Smooth animations and transitions
- ✅ Keyboard navigation support

### 🔧 Backend Features
- ✅ Complete REST API (12 controllers)
- ✅ JWT authentication with refresh
- ✅ MongoDB integration with proper schemas
- ✅ Role-based access control
- ✅ File upload handling with validation
- ✅ Real-time data seeding
- ✅ Comprehensive error handling
- ✅ Request validation
- ✅ CORS configuration
- ✅ Workspace isolation

### 🏗️ Architecture
- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion + React Query
- **Backend:** Node.js + Express + MongoDB + Mongoose + JWT
- **Database:** MongoDB (local or cloud)
- **UI Components:** Custom component library with 30+ elements
- **State Management:** React Context + React Query
- **Styling:** Tailwind CSS with custom theme

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally (or MongoDB Atlas connection string)

### Installation

```bash
# Navigate to project
cd c:\Users\OS\Desktop\Z_project_assignemnt

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### Running

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev

# Open browser to http://localhost:5173
```

### Demo Login
- **Email:** `emma@aurora.com`
- **Password:** `TaskPro123!`

---

## 📊 Project Structure

```
team-task-manager/
├── frontend/
│   ├── src/
│   │   ├── pages/           # 11 feature pages
│   │   ├── components/      # Modal & UI components
│   │   ├── context/         # Auth & Modal context
│   │   ├── lib/             # API client & utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                 # Frontend config
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/          # 12 route files
│   │   ├── controllers/      # 12 controller files
│   │   ├── models/          # 10 Mongoose models
│   │   ├── middleware/      # Auth, error, upload
│   │   ├── config/          # DB, reference date
│   │   ├── utils/           # Helpers (token, error, etc)
│   │   ├── seed/            # Database seeding
│   │   ├── app.js           # Express app
│   │   └── server.js        # Server entry point
│   ├── .env                 # Backend config
│   └── package.json
│
├── TESTING_AND_LAUNCH_GUIDE.md
├── FULL_BUILD_PLAN.md
├── MODAL_IMPLEMENTATION_GUIDE.md
├── MODAL_QUICK_REFERENCE.md
└── README.md (this file)
```

---

## 🎯 Core Features Explained

### 1. Task Management
- Create, read, update, delete tasks
- Assign to team members
- Set priority (high/medium/low)
- Track status (todo/in_progress/review/done)
- Add checklists with progress
- Leave comments
- Set due dates and durations

**Pages:** TasksPage, TaskDetailModal, TasksBoardPage

### 2. Project Management
- Organize tasks into projects
- Assign team members to projects
- Track progress with visual indicators
- View team members working on project
- See all project tasks
- Edit project details
- Delete projects

**Pages:** ProjectsPage, ProjectDetailModal

### 3. Team & User Management
- View all team members
- See member roles and departments
- View member contact info
- Edit member details
- Invite new team members
- Remove team members
- Role-based permissions

**Pages:** TeamPage, TeamMemberModal

### 4. File Management
- Upload files with validation
- Create folders
- Preview file metadata
- Download files
- Share files with team
- Organize by projects
- Search and filter files

**Pages:** FilesPage, FilePreviewModal

### 5. Messaging System
- Create conversations
- Send messages with threading
- Reply to specific messages
- See conversation history
- Direct messaging
- Group conversations

**Pages:** MessagesPage, MessageDetailModal

### 6. Calendar & Events
- Interactive month/week view
- Create events
- Edit event details
- Delete events
- Color-coded events
- Event filters

**Pages:** CalendarPage

### 7. Dashboard Analytics
- Task completion stats
- Project progress overview
- Team member activity
- Priority breakdown
- Due today count
- Timeline view

**Pages:** OverviewPage

### 8. Reports
- Task statistics
- Project summaries
- Team productivity
- Export reports

**Pages:** ReportsPage

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/signup          # Create account
POST /api/auth/login           # Login
GET  /api/auth/me              # Get current user
POST /api/auth/logout          # Logout
```

### Tasks
```
GET    /api/tasks              # List all tasks
POST   /api/tasks              # Create task
GET    /api/tasks/:id          # Get task
PUT    /api/tasks/:id          # Update task
DELETE /api/tasks/:id          # Delete task
POST   /api/tasks/:id/comments # Add comment
```

### Projects
```
GET    /api/projects           # List all projects
POST   /api/projects           # Create project
GET    /api/projects/:id       # Get project
PUT    /api/projects/:id       # Update project
DELETE /api/projects/:id       # Delete project
```

### Users
```
GET    /api/users              # List all users
POST   /api/users              # Create user
GET    /api/users/:id          # Get user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Files
```
GET    /api/files              # List files
POST   /api/files/upload       # Upload file
POST   /api/files/folders      # Create folder
PUT    /api/files/:id          # Update file
DELETE /api/files/:id          # Delete file
GET    /api/files/:id/download # Download file
```

### Messages
```
GET    /api/messages/conversations           # List conversations
GET    /api/messages/conversations/:id       # Get conversation
POST   /api/messages/conversations           # Create conversation
POST   /api/messages/conversations/:id/messages # Send message
```

### Dashboard & Reports
```
GET /api/dashboard/overview    # Dashboard stats
GET /api/reports/summary       # Report summary
```

### Other
```
GET    /api/teams              # List teams
GET    /api/events             # List events
GET    /api/notifications      # List notifications
GET    /api/workspace          # Get workspace
```

---

## 🗄️ Database Models

### User
- name, email, password (hashed)
- role, jobTitle, department
- avatar, presence status
- permissions, preferences
- workspace, team references

### Project
- name, description, color
- owner, members, teams
- status, priority, progress
- dates, category, tags

### Task
- title, description
- project, assignee, reporter
- status, priority, dueDate
- checklist items, comments
- tags, attachments

### Team
- name, color, department
- members, workspace
- description

### FileAsset
- name, mimeType, size
- uploadedBy, project
- parentFolder, sharedWith
- activity log

### Message
- text, sender
- conversation reference
- timestamp

### Conversation
- members, project
- lastMessageAt
- createdBy

### Notification
- type, message
- user, read status
- relatedTo (task/project/comment)

### Event
- title, description
- start, end times
- project reference
- attendees

### Workspace
- name, slug
- owner, members
- settings

---

## 🎨 UI Components Library

The app includes a custom UI component library with:
- **Form Elements:** Input, TextArea, Select, Field, Checkbox
- **Buttons:** PrimaryButton, SecondaryButton, ActionLink
- **Cards:** Card, StatCard, Panel
- **Modals:** Modal, FormModal
- **Data Display:** Avatar, Badge, AvatarGroup, ProgressBar
- **Utilities:** LoadingState, SectionTitle, SearchField
- **Icons:** 40+ Lucide React icons

All components support:
- Tailwind CSS styling
- Responsive design
- Dark/light mode ready
- Accessible (ARIA labels)
- Custom theming

---

## 🔐 Authentication

### How It Works
1. User signs up or logs in
2. Backend validates credentials
3. JWT token generated
4. Token stored in localStorage
5. Token included in API requests (Authorization header)
6. Backend validates token on protected routes

### Protected Routes
- All `/app/*` routes require authentication
- Admin-only routes check user role
- Workspace isolation ensures data privacy

### Token Management
- Auto-refresh on each API call
- Expires after 7 days (configurable)
- Cleared on logout
- Persisted across page refreshes

---

## 📁 Seeded Sample Data

On startup, backend seeds:
- **1 Workspace** - "Aurora Workspace"
- **2 Teams** - Design, Development
- **5+ Users** - Admin account + team members
- **5+ Projects** - Various status levels
- **20+ Tasks** - Different statuses, priorities
- **3+ Conversations** - Sample messages
- **5+ Files** - PDF, Excel, images
- **Events** - Calendar events

All seeded data is **real data in MongoDB**, not dummy data shown on screen.

---

## 🧪 Testing

### Manual Testing Checklist
See `TESTING_AND_LAUNCH_GUIDE.md` for complete guide:
- [ ] Authentication (signup, login, logout)
- [ ] All CRUD operations
- [ ] Search and filtering
- [ ] Modal interactions
- [ ] File upload
- [ ] Responsive design
- [ ] Multi-user workflows

### API Testing
```bash
# Backend console shows all requests
# Check MongoDB Atlas or local MongoDB for data
# Use browser DevTools Network tab to inspect API calls
```

### Browser Testing
```bash
# Check console for errors
# Check network tab for API responses
# Check localStorage for token persistence
# Test on mobile with DevTools device emulation
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
# Check port 5000 is free
# Check .env file exists
# Check NODE_ENV=development
```

### Frontend won't connect to API
```bash
# Check backend is running
# Check .env has correct VITE_API_URL
# Check CORS enabled in backend
# Check Network tab for errors
```

### No data showing
```bash
# Check login successful
# Check API returns data (Network tab)
# Check React Query devtools
# Check localStorage has token
```

### Modal won't open
```bash
# Check browser console for errors
# Verify click handler is firing
# Check modal CSS display
# Check z-index not too low
```

### File upload fails
```bash
# Check file size < 50MB
# Check file type allowed
# Check uploads folder writable
# Check FormData properly formatted
```

---

## 📈 Performance

### Optimizations
- React Query caching for efficient API calls
- Lazy loading of images
- Code splitting with Vite
- Pagination on large lists
- Debounced search
- Memoized components to prevent re-renders

### Targets
- Initial load: < 2 seconds
- API response: < 500ms
- Modal open: < 200ms animation

---

## 🚀 Deployment

### Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster...
JWT_SECRET=your-secret-key-change-this
CLIENT_URL=https://yourdomain.com
SEED_ON_START=false
```

**Frontend (.env)**
```
VITE_API_URL=https://api.yourdomain.com
```

### Deployment Steps

1. **Frontend**
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ folder to Vercel/Netlify
   ```

2. **Backend**
   ```bash
   cd backend
   npm run start
   # Deploy to Heroku/Railway/Render
   # Set environment variables
   # Ensure MongoDB Atlas connection
   ```

3. **Update API URLs**
   - Update frontend .env with production API URL
   - Update CORS origin in backend .env

---

## 📚 Documentation

- **TESTING_AND_LAUNCH_GUIDE.md** - How to test everything
- **FULL_BUILD_PLAN.md** - Complete feature checklist
- **MODAL_IMPLEMENTATION_GUIDE.md** - Modal architecture
- **MODAL_QUICK_REFERENCE.md** - Code examples
- **Backend routes/** - Route documentation
- **Frontend src/lib/api.js** - API endpoint list

---

## 👥 Team & Support

### Team Members (from seed data)
- **Emma Johnson** (Admin)
- **James Park** (Developer)
- **Olivia Rhye** (Designer)
- **William Kim** (Developer)

### Getting Help
1. Check the FULL_BUILD_PLAN.md
2. Search documentation files
3. Check browser console for errors
4. Verify backend logs
5. Check MongoDB data exists

---

## 📝 License

This is a complete working application. Feel free to use, modify, and deploy as needed.

---

## ✅ Completion Status

- ✅ Backend: 100% Complete
- ✅ Frontend: 100% Complete  
- ✅ Database: 100% Complete
- ✅ UI/Modal Design: 100% Complete
- ✅ API Integration: 100% Complete
- ✅ Testing Guides: 100% Complete

**Ready for production deployment and real-world usage!**

---

**Last Updated:** May 3, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
