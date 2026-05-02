# TaskPro API Routes

Base URL:

```text
http://localhost:5000/api
```

Production base URL:

```text
https://your-railway-backend.up.railway.app/api
```

Protected routes require:

```http
Authorization: Bearer <jwt>
```

## Health

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | API health check |

## Authentication

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/signup` | No | Create user and workspace session |
| POST | `/auth/login` | No | Login and return JWT session |
| GET | `/auth/me` | Yes | Return current user, workspace, unread notifications |
| POST | `/auth/logout` | Yes | Confirm logout; client clears JWT |

Signup body:

```json
{
  "name": "Emma Johnson",
  "email": "emma@aurora.com",
  "password": "TaskPro123!",
  "workspaceName": "Aurora Workspace"
}
```

Login body:

```json
{
  "email": "emma@aurora.com",
  "password": "TaskPro123!"
}
```

## Dashboard

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/dashboard/overview` | Yes | Real dashboard metrics from projects, tasks and users |

## Users

| Method | Route | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/users` | Yes | Member/Admin | List workspace users |
| POST | `/users` | Yes | Admin | Create a workspace member |
| GET | `/users/:id` | Yes | Member/Admin | Get member details |
| PUT | `/users/:id` | Yes | Admin | Update member details and permissions |
| DELETE | `/users/:id` | Yes | Admin | Remove a member |
| PUT | `/users/me/profile` | Yes | Member/Admin | Update current profile |
| PUT | `/users/me/preferences` | Yes | Member/Admin | Update preferences |

## Teams

| Method | Route | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/teams` | Yes | Member/Admin | List teams |
| POST | `/teams` | Yes | Admin | Create team |
| PUT | `/teams/:id` | Yes | Admin | Update team |
| DELETE | `/teams/:id` | Yes | Admin | Delete team |

## Projects

| Method | Route | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/projects` | Yes | Member/Admin | List projects |
| POST | `/projects` | Yes | Member/Admin | Create project |
| GET | `/projects/:id` | Yes | Member/Admin | Get project |
| PUT | `/projects/:id` | Yes | Member/Admin | Update project |
| DELETE | `/projects/:id` | Yes | Admin | Delete project |

Project body:

```json
{
  "name": "Aurora Website Redesign",
  "description": "Refresh the marketing website.",
  "status": "active",
  "priority": "high",
  "progress": 75,
  "members": ["<userId>"],
  "teams": ["<teamId>"],
  "startDate": "2025-05-01",
  "dueDate": "2025-05-22",
  "category": "UI/UX",
  "tags": ["UI/UX", "Design"]
}
```

## Tasks

| Method | Route | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/tasks` | Yes | Member/Admin | List tasks |
| POST | `/tasks` | Yes | Member/Admin | Create task |
| GET | `/tasks/:id` | Yes | Member/Admin | Get task |
| PUT | `/tasks/:id` | Yes | Member/Admin | Update task/status/checklist |
| DELETE | `/tasks/:id` | Yes | Admin | Delete task |
| POST | `/tasks/:id/comments` | Yes | Member/Admin | Add task comment |

Task body:

```json
{
  "title": "Design system update",
  "project": "<projectId>",
  "assignee": "<userId>",
  "description": "Update colors, type and reusable components.",
  "status": "in_progress",
  "priority": "high",
  "dueDate": "2025-05-12",
  "sprint": "Sprint 14",
  "estimatedHours": 8,
  "tags": ["UI/UX", "Design"],
  "checklist": [
    {
      "text": "Update color palette",
      "completed": true
    }
  ]
}
```

## Events / Calendar

| Method | Route | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/events` | Yes | Member/Admin | List events |
| POST | `/events` | Yes | Member/Admin | Create event |
| PUT | `/events/:id` | Yes | Member/Admin | Update event |
| DELETE | `/events/:id` | Yes | Admin | Delete event |

## Files

| Method | Route | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/files` | Yes | Member/Admin | List files/folders |
| POST | `/files/folders` | Yes | Member/Admin | Create folder |
| POST | `/files/upload` | Yes | Member/Admin | Upload file via multipart form data |
| PUT | `/files/:id` | Yes | Member/Admin | Update metadata |
| POST | `/files/:id/comments` | Yes | Member/Admin | Add file activity comment |
| GET | `/files/:id/download` | Yes | Member/Admin | Download file |
| DELETE | `/files/:id` | Yes | Admin | Delete file/folder |

Upload form fields:

```text
file=<binary>
name=Project Brief.pdf
description=Scope and deliverables
project=<projectId>
sharedWith=["<userId>"]
```

## Messages

| Method | Route | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/messages/conversations` | Yes | Member/Admin | List conversations |
| POST | `/messages/conversations` | Yes | Member/Admin | Create conversation |
| GET | `/messages/conversations/:id` | Yes | Member/Admin | Get conversation and messages |
| POST | `/messages/conversations/:id/messages` | Yes | Member/Admin | Send message |

## Reports

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/reports/summary` | Yes | Aggregated reporting data |

## Notifications

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/notifications` | Yes | List user notifications |
| PUT | `/notifications/:id/read` | Yes | Mark notification as read |

## Workspace

| Method | Route | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/workspace` | Yes | Member/Admin | Get workspace |
| PUT | `/workspace` | Yes | Admin | Update workspace settings |
