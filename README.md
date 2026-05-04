# Clear Head

Clear Head is a weekly planner for tasks that need a clear place in the day. It
combines a calendar-like dashboard with task editing, recurring routines,
drag-and-drop planning, resizing, and optimistic updates.

The project is built with Next.js, React, TypeScript, Supabase Auth, and
Supabase Database.

Deploy: https://clear-head-mmu0s9g1w-sssothinks-projects.vercel.app/

## Features

- Email/password authentication with Supabase Auth
- Protected dashboard for registered users
- Demo mode for trying the planner without an account
- Weekly calendar view
- Task creation, editing, completion, and deletion
- Drag-and-drop task movement between days
- Time block resizing
- One-time, daily, and weekly recurring tasks
- Per-occurrence edits and deletions for recurring tasks
- Conflict-aware event layout
- Optimistic UI updates for faster interactions

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Supabase Auth
- Supabase Database
- Zod
- Tailwind CSS
- Framer Motion
- date-fns

## Getting Started

Install dependencies:

```bash
npm install
```

Create a .env.local file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Supabase Setup

The app expects Supabase Auth and database tables for goals and goal
occurrences.

Required environment variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Recommended Auth settings:

Enable email/password provider Enable email confirmation Configure password
policy in Supabase Auth settings Keep Row Level Security enabled for user-owned
data

## Main Routes

- / - landing page
- /demo - local demo planner
- /auth/register - account registration
- /auth/login - login
- /dashboard - authenticated planner dashboard

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

```bash
src/
  app/                  Next.js routes and pages
  features/             Feature modules
    dashboard/          Weekly planner UI and interactions
    goals/              Goal actions, hooks, and types
  lib/                  Supabase clients and server-side data access
  shared/               Reusable UI and utility functions
```

## Notes

Client-side validation is used for a better user experience. Data safety is
handled by Supabase Auth settings, database constraints, and server-side
ownership checks.
