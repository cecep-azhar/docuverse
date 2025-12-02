# Fix Cloudflare Deployment - Summary

## Masalah yang Diperbaiki

### 1. ❌ Error: "SQLITE_UNKNOWN: no such table: apps"

**Penyebab:**
- Next.js 16 mencoba melakukan static generation di build time
- Saat static generation, aplikasi query database yang belum memiliki tabel
- Di Cloudflare Pages, database Turso belum di-setup saat build

**Solusi:**
- Menambahkan `export const dynamic = 'force-dynamic'` di semua pages dan API routes
- Menambahkan `export const revalidate = 0` untuk disable caching
- Menambahkan error handling dengan try-catch di semua database queries

### 2. File yang Diubah

#### Pages (Dynamic Rendering)
- ✅ `app/page.tsx` - Homepage
- ✅ `app/admin/dashboard/page.tsx` - Dashboard
- ✅ `app/admin/dashboard/apps/[appId]/page.tsx` - App Detail
- ✅ `app/admin/dashboard/apps/[appId]/settings/page.tsx` - App Settings
- ✅ `app/(public)/[appSlug]/layout.tsx` - Public Layout
- ✅ `app/(public)/[appSlug]/[[...slug]]/page.tsx` - Public Pages

#### API Routes
- ✅ `app/api/health/route.ts` - Health check endpoint
- ✅ `app/api/apps/route.ts` - Apps API

#### Database Config
- ✅ `drizzle.config.ts` - Path schema diperbaiki
- ✅ `scripts/init-db.ts` - Import libsql diperbaiki

### 3. Dokumentasi yang Ditambahkan

- 📄 `CLOUDFLARE_SETUP.md` - Panduan setup database untuk Cloudflare
- 📄 `DEPLOYMENT.md` - Panduan lengkap deployment ke Cloudflare Pages

## Langkah Deployment ke Cloudflare

### Step 1: Setup Database Turso

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create docuverse

# Get credentials
turso db show docuverse --url
turso db tokens create docuverse
```

### Step 2: Push Schema ke Database

```bash
# Set environment variables di .env
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token

# Push schema
pnpm db:push
```

### Step 3: Deploy ke Cloudflare Pages

1. Go to Cloudflare Pages Dashboard
2. Connect GitHub repository
3. Configure build:
   - Framework: **Next.js**
   - Build command: `pnpm build`
   - Output directory: `.next`

4. Set Environment Variables:
   ```
   DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your-token
   NEXTAUTH_SECRET=generate-random-string
   NODE_VERSION=20
   ```

5. Click **Deploy**

## Verifikasi Deployment

### 1. Cek Health Endpoint

```bash
curl https://your-app.pages.dev/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. Cek Homepage

Visit: `https://your-app.pages.dev`

Seharusnya menampilkan homepage tanpa error.

### 3. Login Admin

Visit: `https://your-app.pages.dev/admin`

- Email: `admin@docuverse.com`
- Password: `admin`

**⚠️ PENTING:** Ubah password default setelah login pertama kali!

## Build Output

```
Route (app)
┌ ƒ /                                    (Dynamic - homepage)
├ ○ /_not-found                          (Static - 404 page)
├ ƒ /[appSlug]/[[...slug]]               (Dynamic - public docs)
├ ○ /admin                               (Static - login page)
├ ƒ /admin/dashboard                     (Dynamic - dashboard)
├ ƒ /admin/dashboard/apps/[appId]       (Dynamic - app detail)
├ ƒ /admin/dashboard/apps/[appId]/settings (Dynamic - settings)
├ ƒ /admin/dashboard/settings           (Dynamic - global settings)
├ ƒ /api/apps                           (Dynamic - apps API)
├ ƒ /api/health                         (Dynamic - health check)
├ ƒ /api/pages                          (Dynamic - pages API)
├ ƒ /api/search                         (Dynamic - search API)
├ ƒ /api/settings                       (Dynamic - settings API)
└ ƒ /api/upload                         (Dynamic - upload API)

Legend:
○ = Static (prerendered at build time)
ƒ = Dynamic (rendered on demand)
```

## Troubleshooting

### Masih Error "no such table"

1. Pastikan database sudah di-push schema: `pnpm db:push`
2. Cek environment variables di Cloudflare benar
3. Verifikasi tabel ada: `turso db shell docuverse` → `.tables`

### Database Connection Timeout

1. Cek region database dekat dengan Cloudflare edge
2. Gunakan Turso replica jika perlu

### Build Gagal di Cloudflare

1. Pastikan `NODE_VERSION=20` di environment variables
2. Cek build log untuk error spesifik
3. Test build lokal: `pnpm build`

---

**Status:** ✅ Siap Deploy ke Cloudflare Pages!
