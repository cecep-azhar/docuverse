# Docuverse

Open Source Documentation Platform built with Next.js 15, Drizzle ORM, and Turso.

## Features

- **Multi-App**: Manage multiple documentation sites from one admin panel.
- **Multi-Version**: Support for versioning (v1, v2, etc.).
- **Multi-Language**: Internationalization support.
- **Admin Panel**: Full management interface with WYSIWYG editor.
- **Public Docs**: Beautiful, responsive documentation viewer.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (Local) / Turso (Production)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Simple Admin Auth (Email/Password)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

For local development, `DATABASE_URL=file:local.db` is sufficient.

For Turso:
1. Create a database on Turso.
2. Get the Database URL and Auth Token.
3. Update `.env.local`.

### 3. Database Migration

Push the schema to the database:

```bash
npm run db:push
```

### 4. Seed Data

Populate the database with initial data (Admin user + Demo App):

```bash
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@docuverse.com`
- Password: `admin`

### 5. Run Development Server

```bash
npm run dev
```

Visit:
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Docs: [http://localhost:3000/docuverse](http://localhost:3000/docuverse)

## Project Structure

- `app/(public)`: Public documentation routes.
- `app/admin`: Admin panel routes.
- `lib/db.ts`: Database connection.
- `lib/schema.ts`: Database schema.
- `components`: Reusable UI components.

## Deployment

1. Build the project: `npm run build`
2. Start the server: `npm start`
3. Or deploy to Vercel (ensure Environment Variables are set).
