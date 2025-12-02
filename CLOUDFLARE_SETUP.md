# Setup Database untuk Cloudflare Deployment

## Langkah-langkah Setup Database

### 1. Push Schema ke Turso Database

Sebelum deploy ke Cloudflare, pastikan database Turso sudah memiliki tabel yang diperlukan.

```bash
# Pastikan environment variables sudah diset di .env
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Push schema ke Turso
pnpm db:push
```

### 2. Seed Data Awal (Opsional)

Jika ingin menambahkan data awal (admin user, settings, demo app), jalankan:

```bash
# Edit scripts/seed.ts untuk menggunakan Turso connection
pnpm seed
```

**Alternatif:** Login ke admin panel setelah deploy dan buat data manual melalui UI.

### 3. Verifikasi Database

Cek apakah tabel sudah terbuat dengan:

```bash
turso db shell your-database
```

Lalu jalankan query:

```sql
.tables
SELECT * FROM apps;
SELECT * FROM settings;
SELECT * FROM users;
```

## Environment Variables untuk Cloudflare Pages

Di Cloudflare Pages Dashboard, tambahkan environment variables berikut:

### Production Environment Variables

```env
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NODE_VERSION=20
```

### Preview Environment Variables (Optional)

Untuk preview deployments, bisa menggunakan database berbeda:

```env
DATABASE_URL=libsql://your-preview-database.turso.io
TURSO_AUTH_TOKEN=your-preview-auth-token
NEXTAUTH_SECRET=same-as-production
NODE_VERSION=20
```

## Troubleshooting

### Error: "SQLITE_UNKNOWN: no such table"

**Penyebab:** Database Turso belum di-migrate/push schema.

**Solusi:**
1. Pastikan `DATABASE_URL` dan `TURSO_AUTH_TOKEN` sudah benar di `.env`
2. Jalankan `pnpm db:push`
3. Verifikasi dengan `turso db shell`

### Error: "Failed to connect to database"

**Penyebab:** Connection string atau auth token salah.

**Solusi:**
1. Cek format `DATABASE_URL` harus `libsql://...` (bukan `https://`)
2. Generate ulang auth token: `turso db tokens create your-database`
3. Copy-paste dengan hati-hati (jangan ada spasi/newline)

### Error saat Build di Cloudflare

**Penyebab:** Pages mencoba query database saat static generation.

**Solusi:** Semua pages yang query database sudah ditambahkan `export const dynamic = 'force-dynamic'` untuk disable prerendering.

### Database Connection Timeout

**Penyebab:** Database region terlalu jauh dari Cloudflare edge.

**Solusi:**
1. Buat database Turso di region yang dekat dengan Cloudflare edge (mis: `turso db create --location iad` untuk US East)
2. Atau gunakan Turso replica: `turso db replicate your-database --location iad`

## Manual Database Setup (Alternative)

Jika tidak bisa menggunakan `drizzle-kit push`, bisa setup manual dengan SQL:

```sql
-- Copy schema dari migrations/*.sql
-- Atau jalankan manual SQL di turso db shell:

CREATE TABLE apps (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE versions (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
  UNIQUE(app_id, slug)
);

-- dst... (lihat lib/schema.ts untuk schema lengkap)
```

## Best Practices

1. **Gunakan Database Terpisah untuk Production & Preview**
   - Production: `docuverse-prod`
   - Preview: `docuverse-preview`

2. **Backup Database Secara Berkala**
   ```bash
   turso db shell your-database .dump > backup.sql
   ```

3. **Monitor Database Usage**
   - Cek di [Turso Dashboard](https://turso.tech/app)
   - Free plan: 500MB storage, 1 billion row reads/month

4. **Set Database Region Strategis**
   - Pilih region dekat dengan target user
   - Gunakan multi-region untuk global app

---

**Siap Deploy!** Setelah database setup, lanjut ke [DEPLOYMENT.md](./DEPLOYMENT.md) untuk deploy ke Cloudflare Pages.
