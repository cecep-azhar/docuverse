# Docuverse (Early Scaffold)

This is the initial scaffold for **Docuverse**, an open-source flexible documentation platform (inspired by GitBook / Mintlify).

## Stack
- Next.js 15 (App Router, Turbopack)
- TypeScript strict
- Drizzle ORM + drizzle-kit
- SQLite locally (better-sqlite3) / Turso (libSQL) in production
- Tailwind CSS + (shadcn/ui planned)

## Environment Variables
Copy `.env.example` to `.env.local` and adjust if needed:

```
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123
# TURSO_DATABASE_URL=
# TURSO_AUTH_TOKEN=
```

If `TURSO_DATABASE_URL` is set, Turso will be used; otherwise local `sqlite.db` file.

## Drizzle Migrations
Generate / push migrations:

```bash
npm run db:generate
npm run db:push
```

## Development

```bash
npm install
npm run dev
```
Visit `http://localhost:3000/admin` for the admin placeholder and `http://localhost:3000/docuverse` (after seeding) for public docs.

## Turso Setup (Outline)
1. Install Turso CLI: `curl -sSfL https://get.turso.tech/install.sh | bash` (Linux/macOS) or via Scoop on Windows.
2. Login: `turso auth login`.
3. Create database: `turso db create docuverse`.
4. Get the URL: `turso db show docuverse` -> use `libsql://...` URL.
5. Create token: `turso db tokens create docuverse`.
6. Put values into `.env.local` as `TURSO_DATABASE_URL` & `TURSO_AUTH_TOKEN`.
7. Run migrations: `npm run db:push`.

## Next Steps
- Implement seed script
- Build admin CRUD (tree, editor)
- Public docs rendering + MDX/Markdown pipeline
- Search (FTS5)

This scaffold will evolve into full feature set per spec.
