# Mini Jira with AI-Assisted Task Breakdown

Mini Jira is a full-stack task management app inspired by Jira. It supports projects, members, tasks, comments, and a Kanban board with drag-and-drop status changes.

The AI-assisted task breakdown feature is part of the project vision and roadmap, but it is not implemented yet.

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
- Project creation and project list
- Project detail page
- Project members model and API support
- Task creation, update, and deletion
- Comment creation and display
- Kanban board with `todo`, `in_progress`, and `done` columns
- Drag-and-drop task movement between Kanban columns
- Backend authorization checks for project/task access
- Basic backend validation for task status values

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

The frontend communicates with the backend through REST endpoints under `/api`. The backend uses Prisma to access PostgreSQL and protects project/task data through JWT authentication plus membership checks.

## Running Locally

Install dependencies:

```bash
cd mini-jira-ai/client
npm install

cd ../server
npm install
```

Set up backend environment variables in `mini-jira-ai/server/.env`.

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

By default, the frontend expects the API at:

```text
http://localhost:5000/api
```

## Environment Variables

Create `mini-jira-ai/server/.env` with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
```

Do not commit real secrets or production database credentials.

## Current Status

This project is an MVP suitable for portfolio demonstration. Core project/task/comment workflows are implemented, and the Kanban board supports drag-and-drop between status columns.

The codebase still needs stronger validation, tests, better production configuration, and the planned AI-assisted task breakdown workflow.

## Roadmap

- Implement AI-assisted task breakdown for generating task suggestions or subtasks
- Add task assignees and due date controls to the UI
- Add project member management UI
- Add role-based permissions for owners, admins, and members
- Add task editing UI
- Add comment editing and deletion
- Add tests for auth, project access, tasks, comments, and Kanban status changes
- Add production-ready API configuration and stricter CORS settings
- Add optional task ordering inside Kanban columns
