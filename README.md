# Docuverse

**Open-source documentation platform inspired by GitBook & Mintlify** 

Beautiful, flexible documentation platform built with Next.js 15, featuring multi-app support, versioning, internationalization, and a powerful admin dashboard.

## 🚀 Features

- ✅ **Multi-App Documentation** - Host multiple product documentations in one platform
- ✅ **Version Control** - Support multiple versions per app (v1.0, v2.0, etc.)
- ✅ **Internationalization** - Multi-language support (en, id, etc.)
- ✅ **Nested Pages** - Folder structure with unlimited nesting
- ✅ **Markdown/MDX Support** - Rich content with next-mdx-remote
- ✅ **Dark/Light Mode** - Beautiful themes with next-themes
- ✅ **Admin Dashboard** - Complete CRUD for apps, pages, and settings
- ✅ **Brand Customization** - Configure company branding from admin panel
- ✅ **Responsive Design** - Mobile-first UI with Tailwind CSS
- ✅ **SQLite/Turso Database** - Auto-switching based on environment

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, React Server Components, Turbopack)
- **Runtime:** React 19
- **Database:** Drizzle ORM + SQLite (local) / Turso (production)
- **Styling:** Tailwind CSS + shadcn/ui
- **Authentication:** bcryptjs
- **Editor:** Tiptap (WYSIWYG) + next-mdx-remote (Markdown rendering)
- **Icons:** lucide-react
- **Theme:** next-themes

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
