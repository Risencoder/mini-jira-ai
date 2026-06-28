# Mini Jira with AI-Assisted Task Breakdown

Mini Jira is a full-stack task management application inspired by Jira. It includes project workspaces, project members, task management, comments, assignees, due dates, and a Kanban board with drag-and-drop status changes.

AI-assisted task breakdown is part of the product vision, but it is not implemented in v1.0 yet.

## Tech Stack

Frontend:
- React
- Vite
- React Router
- Axios
- @dnd-kit/core

Backend:
- Node.js
- Express
- Prisma
- PostgreSQL
- JWT authentication
- bcrypt

## Current Features

- User registration and login
- JWT-protected API routes
- Project creation, editing, deletion, and dashboard listing
- Project members list and member invitation by email
- Task creation, editing, deletion, assignee, due date, priority, and status
- Kanban board with `todo`, `in_progress`, and `done` columns
- Drag-and-drop task movement between Kanban columns
- Task comments
- Confirmation dialogs before deleting tasks or projects
- Backend authorization checks for project, task, and comment access
- Backend validation for task status and assignee project membership
- Modern dark SaaS-style UI polish

## Architecture Overview

```text
mini-jira-ai/
  client/              React + Vite frontend
    src/
      api/             Axios API client
      pages/           Login, Register, Dashboard, Project pages
      routes/          React Router setup

  server/              Express backend
    prisma/            Prisma schema and migrations
    src/
      config/          Prisma client setup
      controllers/     HTTP request/response handlers
      middleware/      JWT auth middleware
      routes/          Express route definitions
      services/        Business logic and database access
      utils/           Shared backend utilities
```

The frontend communicates with the backend through REST endpoints under `/api`. The backend uses Prisma for PostgreSQL access and protects project data with JWT authentication plus project membership checks.

## Running Locally

Install dependencies:

```bash
cd mini-jira-ai/client
npm install

cd ../server
npm install
```

Create environment files from the examples:

```bash
cp mini-jira-ai/client/.env.example mini-jira-ai/client/.env
cp mini-jira-ai/server/.env.example mini-jira-ai/server/.env
```

Run the backend:

```bash
cd mini-jira-ai/server
npm run dev
```

Run the frontend:

```bash
cd mini-jira-ai/client
npm run dev
```

Default local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000/api
```

## Environment Variables

Frontend (`mini-jira-ai/client/.env`):

```env
VITE_API_URL="http://localhost:5000/api"
```

Backend (`mini-jira-ai/server/.env`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"
CLIENT_URL="http://localhost:5173"
PORT=5000
```

Do not commit real secrets or production database credentials.

## Current Status

The project is ready as a v1.0 portfolio MVP. Core full-stack workflows are implemented: authentication, projects, members, tasks, comments, Kanban drag-and-drop, assignee, due date, and project/task management.

Known limitations:
- No automated test suite yet
- No AI-assisted task breakdown yet
- No task reordering inside a Kanban column
- No comment editing or deletion
- Role permissions are still basic

## Roadmap

- Implement AI-assisted task breakdown for generating task suggestions or subtasks
- Add automated tests for auth, project access, tasks, comments, and Kanban status changes
- Add stricter role-based permissions for owners, admins, and members
- Add comment editing and deletion
- Add optional task ordering inside Kanban columns
- Improve mobile Kanban ergonomics
