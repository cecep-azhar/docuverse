# ✅ READY TO DEPLOY - Cloudflare Pages

## Changes Made to Fix Deployment

### 1. Updated Dependencies
```bash
✓ drizzle-orm: 0.30.10 → 0.44.7
✓ @libsql/client: 0.6.2 → 0.15.15
✓ drizzle-kit: 0.21.4 → 0.31.7 (latest)
```

### 2. Added Dynamic Rendering
All pages now use `export const dynamic = 'force-dynamic'`:
- ✓ Root layout (`app/layout.tsx`)
- ✓ Homepage (`app/page.tsx`)
- ✓ All dashboard pages
- ✓ All public pages
- ✓ All API routes

### 3. Next.js Configuration
Added `output: 'standalone'` to `next.config.mjs` for Cloudflare compatibility.

### 4. Build Output - All Dynamic ✓
```
Route (app)
ƒ /                                    (Dynamic)
ƒ /_not-found                          (Dynamic)
ƒ /[appSlug]/[[...slug]]               (Dynamic)
ƒ /admin                               (Dynamic)
ƒ /admin/dashboard                     (Dynamic)
ƒ /admin/dashboard/apps/[appId]       (Dynamic)
ƒ /admin/dashboard/apps/[appId]/settings (Dynamic)
ƒ /admin/dashboard/settings           (Dynamic)
└─ All API routes                      (Dynamic)
```

---

## Deployment Steps

### Step 1: Setup Database (One Time)

**On your local machine:**

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Create production database
turso db create docuverse-prod

# Get database URL
turso db show docuverse-prod --url
# Output: libsql://docuverse-prod-xxx.turso.io

# Generate auth token
turso db tokens create docuverse-prod
# Output: eyJhbGci... (copy this token)

# Add credentials to .env
echo "DATABASE_URL=libsql://docuverse-prod-xxx.turso.io" >> .env
echo "TURSO_AUTH_TOKEN=your-token-here" >> .env

# Push schema to database
pnpm db:push
```

**Verify database is ready:**
```bash
turso db shell docuverse-prod
```
```sql
.tables
-- Should show: apps, languages, pages, settings, users, versions
```

### Step 2: Configure Cloudflare Pages

**Go to Cloudflare Dashboard:**

1. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

2. **Select your repository:** `docuverse`

3. **Build settings:**
   - Framework preset: **Next.js**
   - Build command: `pnpm run build`
   - Build output directory: `.next`
   - Root directory: `/` (leave empty)

4. **Environment variables (Production):**
   ```
   NODE_VERSION=20
   DATABASE_URL=libsql://docuverse-prod-xxx.turso.io
   TURSO_AUTH_TOKEN=eyJhbGci...
   NEXTAUTH_SECRET=generate-random-32-chars
   ```
   
   Generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

5. **Save and Deploy**

### Step 3: Monitor Deployment

Watch the build log in Cloudflare Pages dashboard:

**Expected output:**
```
✓ Installing dependencies: pnpm install
✓ Running build: pnpm run build
✓ Compiled successfully
✓ All routes are dynamic (ƒ)
✓ Build complete
✓ Deploying...
✓ Success!
```

**If build fails with "no such table" error:**
- Database credentials are wrong or not set in Cloudflare
- Database schema not pushed (run `pnpm db:push` locally)

### Step 4: Verify Deployment

**Health Check:**
```bash
curl https://your-app.pages.dev/api/health
```
Expected: `{"status":"ok","database":"connected"}`

**Homepage:**
Visit: `https://your-app.pages.dev`
Should load without errors (may show "No documentation yet" if no data)

**Admin Panel:**
Visit: `https://your-app.pages.dev/admin`
Login with:
- Email: `admin@docuverse.com`
- Password: `admin`

⚠️ **Change password immediately after first login!**

---

## Common Issues & Solutions

### ❌ Error: "turso: not found" in build log

**Cause:** Build command includes turso CLI commands

**Fix:** 
- Go to Cloudflare Pages → Settings → Build & deployments
- Change build command to ONLY: `pnpm run build`
- Remove any turso or db:push commands

### ❌ Error: "SQLITE_UNKNOWN: no such table: apps"

**Cause:** Database not initialized or wrong credentials

**Fix:**
1. Check DATABASE_URL is correct (format: `libsql://...`)
2. Check TURSO_AUTH_TOKEN is valid
3. Push schema: `pnpm db:push` (locally with correct .env)
4. Verify: `turso db shell docuverse-prod` → `.tables`

### ❌ Error: "drizzle-kit version mismatch"

**Cause:** Outdated drizzle packages

**Fix:** Already updated in latest code ✓
```bash
pnpm add drizzle-orm@latest @libsql/client@latest
pnpm add -D drizzle-kit@latest
```

### ❌ Build succeeds but site shows 500 error

**Cause:** Runtime database connection issue

**Fix:**
1. Check environment variables are set in Cloudflare (not just local .env)
2. Test health endpoint: `/api/health`
3. Check Cloudflare Pages → Functions logs for errors

---

## Post-Deployment Checklist

- [ ] Health endpoint returns "ok"
- [ ] Homepage loads without errors
- [ ] Admin login works
- [ ] Can create new app via admin panel
- [ ] Public docs page accessible
- [ ] Search functionality works
- [ ] Theme toggle works
- [ ] Changed default admin password

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_VERSION` | Yes | Node.js version | `20` |
| `DATABASE_URL` | Yes | Turso database URL | `libsql://xxx.turso.io` |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token | `eyJhbGci...` |
| `NEXTAUTH_SECRET` | Yes | Random secret key | Generate with openssl |

---

## Build Command History

### ❌ WRONG (will fail):
```bash
turso db create docuverse
turso db show docuverse --url
turso db tokens create docuverse
pnpm db:push
pnpm run build
```

### ✅ CORRECT:
```bash
pnpm run build
```

**Why?** 
- Cloudflare Pages build environment doesn't have turso CLI
- Database should be set up BEFORE deployment
- Build time should only compile the app, not manage database

---

## 🚀 Deploy Now!

1. Commit all changes:
   ```bash
   git add .
   git commit -m "fix: cloudflare deployment ready"
   git push origin main
   ```

2. Cloudflare will auto-deploy from GitHub

3. Monitor at: `https://dash.cloudflare.com/`

---

**Status:** ✅ READY TO DEPLOY

**Build:** ✅ Successful (all routes dynamic)

**Database:** ⚠️ Needs setup (see Step 1)

**Deployment:** 🕐 Waiting for you!
