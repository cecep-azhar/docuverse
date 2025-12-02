# Deployment Guide - Cloudflare Pages

## Prerequisites

1. **Cloudflare Account** - Sign up at [Cloudflare Pages](https://pages.cloudflare.com/)
2. **Turso Database** - Create database at [Turso](https://turso.tech/)
3. **GitHub Repository** - Push your code to GitHub

## Setup Turso Database

1. Install Turso CLI:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. Login to Turso:
```bash
turso auth login
```

3. Create database:
```bash
turso db create docuverse
```

4. Get database URL and auth token:
```bash
turso db show docuverse --url
turso db tokens create docuverse
```

5. Run migrations:
```bash
pnpm db:push
```

## Deploy to Cloudflare Pages

### Method 1: Using Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Click **Create a project**
3. Connect your **GitHub repository**
4. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `pnpm build`
   - **Build output directory**: `.next`
   - **Root directory**: `/`

5. Add **Environment Variables**:
   ```
   DATABASE_URL=libsql://[your-turso-url]
   TURSO_AUTH_TOKEN=[your-turso-token]
   NEXTAUTH_SECRET=[generate-random-string]
   NODE_VERSION=18
   ```

6. Click **Save and Deploy**

### Method 2: Using Wrangler CLI

1. Install Wrangler:
```bash
pnpm add -D wrangler
```

2. Login to Cloudflare:
```bash
npx wrangler login
```

3. Deploy:
```bash
npx wrangler pages deploy .next --project-name=docuverse
```

## Environment Variables

Make sure to set these environment variables in Cloudflare Pages:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Turso database URL | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso authentication token | `eyJhbGci...` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Generate with `openssl rand -base64 32` |

## Post-Deployment

1. Visit your deployed site
2. Navigate to `/admin` to login
3. Default credentials:
   - Email: `admin@docuverse.com`
   - Password: `admin`

**⚠️ Important**: Change the default admin password immediately after first login!

## Troubleshooting

### Build Fails with Module Errors

Make sure `package.json` has correct dependencies and Next.js is version 16+:
```bash
pnpm install next@latest react@latest react-dom@latest
```

### Database Connection Issues

1. Verify `DATABASE_URL` starts with `libsql://`
2. Check `TURSO_AUTH_TOKEN` is set correctly
3. Ensure Turso database is accessible

### Static Generation Errors

If you see errors during static page generation, check:
- Database is seeded with initial data
- All API routes are working
- Environment variables are set

## Custom Domain

1. Go to your Cloudflare Pages project
2. Click **Custom domains**
3. Add your domain
4. Update DNS records as instructed

## Continuous Deployment

Cloudflare Pages automatically deploys when you push to your main branch. To deploy from a different branch:

1. Go to project settings
2. Under **Builds & deployments** → **Production branch**
3. Change to your desired branch

---

For more information, visit:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Turso Documentation](https://docs.turso.tech/)
