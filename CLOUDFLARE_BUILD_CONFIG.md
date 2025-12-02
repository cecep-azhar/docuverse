# Cloudflare Pages Configuration

## Build Settings

### Framework Preset
**Next.js**

### Build Command
```bash
pnpm run build
```

### Build Output Directory
```
.next
```

### Root Directory
```
/
```

## Environment Variables (Production)

Add these in Cloudflare Pages Dashboard → Settings → Environment Variables:

```env
NODE_VERSION=20
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
NEXTAUTH_SECRET=your-secret-key
```

## Important Notes

### ⚠️ DO NOT include database commands in build command

**Wrong (will fail):**
```bash
turso db create docuverse
turso db show docuverse --url
turso db tokens create docuverse
pnpm db:push
pnpm run build
```

**Correct:**
```bash
pnpm run build
```

### ✅ Setup database BEFORE deployment

1. **On your local machine or CI:**
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Create database
   turso db create docuverse
   
   # Get credentials
   turso db show docuverse --url
   turso db tokens create docuverse
   
   # Push schema (with credentials in .env)
   pnpm db:push
   ```

2. **Then deploy to Cloudflare:**
   - Add environment variables to Cloudflare Pages
   - Push code to GitHub
   - Cloudflare will auto-deploy

## Build Configuration in Cloudflare Dashboard

1. Go to **Workers & Pages** → Your project
2. Click **Settings** → **Build & Deployments**
3. Configure as follows:

| Setting | Value |
|---------|-------|
| Framework preset | Next.js |
| Build command | `pnpm run build` |
| Build output directory | `.next` |
| Root directory | `/` |
| Node version | `20` (set via env var) |

4. Save and **Retry Deployment**

## Troubleshooting

### Error: "turso: not found"
**Solution:** Remove turso commands from build command. Setup database separately before deployment.

### Error: "no such table: apps"
**Solution:** 
1. Make sure database schema is pushed: `pnpm db:push` (locally)
2. Verify DATABASE_URL and TURSO_AUTH_TOKEN are set in Cloudflare
3. Check database has tables: `turso db shell docuverse` → `.tables`

### Error: "drizzle-kit version mismatch"
**Solution:** Update both packages to latest:
```bash
pnpm add drizzle-orm@latest
pnpm add -D drizzle-kit@latest
```

## Quick Setup Checklist

- [ ] Database created in Turso
- [ ] Schema pushed with `pnpm db:push`
- [ ] Environment variables added to Cloudflare Pages
- [ ] Build command is ONLY `pnpm run build`
- [ ] Code pushed to GitHub
- [ ] Deployment triggered

---

**Ready to deploy!** 🚀
