# Mini Jira with AI-Assisted Task Breakdown

Mini Jira is a full-stack task management application inspired by Jira. It supports authentication, project management, members, tasks, comments, assignees, due dates, and a Kanban board with drag-and-drop status updates.

AI-assisted task breakdown is planned for v2 and is not implemented in v1.0.

## Live Demo

- Live Demo: [https://mini-jira-ai.vercel.app](https://mini-jira-ai.vercel.app/)
- Repository: [https://github.com/Risencoder/mini-jira-ai](https://github.com/Risencoder/mini-jira-ai)
- Backend API: [https://mini-jira-ai.onrender.com](https://mini-jira-ai.onrender.com/)

## Tech Stack

Frontend:
- React
- Vite
- React Router
- Axios
- DnD Kit

Backend:
- Node.js
- Express
- Prisma
- JWT
- bcrypt

Database:
- PostgreSQL
- Supabase

Deployment:
- Vercel
- Render

## Current Features

- Authentication with JWT
- Project CRUD
- Project Members
- Task CRUD
- Task Comments
- Assignees
- Due Dates
- Kanban Board
- Drag & Drop
- Confirmation Modals
- Dark SaaS-style UI
- Backend authorization and membership checks

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

Mini Jira v1.0 is a deployed full-stack portfolio MVP. It supports authentication, project management, task management, project members, comments, assignees, due dates, and Kanban drag-and-drop.

The AI-assisted task breakdown workflow is intentionally left for v2.

## Roadmap

- AI-assisted task breakdown
- Role-based permissions
- Automated tests
- Comment editing/deletion
- Kanban task ordering
- Mobile Kanban polish
