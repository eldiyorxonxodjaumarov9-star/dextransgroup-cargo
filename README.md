# DextransGroup Cargo

Xitoy–Toshkent cargo dashboard: omborlar, tovarlar, operatorlar, Telegram kanallar va admin panel (CRUD + Excel hisobot).

## Requirements

- Node.js 20+
- PostgreSQL database (local Docker, Neon, Supabase, or Vercel Postgres)
- npm

## Local installation

```bash
npm install
cp .env.example .env
```

Edit `.env` with your PostgreSQL URLs and secrets.

```bash
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open: http://localhost:3000

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection (pooled OK) |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL for migrations (can match `DATABASE_URL`) |
| `SESSION_SECRET` | Yes (prod) | Long random secret for cookie sessions |
| `ADMIN_USERNAME` | Seed | Admin login username |
| `ADMIN_PASSWORD` | Seed | Admin password (hashed before DB insert) |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL |

Never commit `.env` or real secrets.

## Prisma setup

```bash
npx prisma generate
npx prisma validate
```

Windows EPERM workaround (local only):

```bash
npm run prisma:generate
```

## Database migration

Development (schema sync):

```bash
npx prisma db push
```

Production (apply migrations):

```bash
npx prisma migrate deploy
```

## Seed

```bash
npm run db:seed
```

Seed creates:

- 1 admin user (bcrypt-hashed password)
- 14 China warehouses
- 2 operators

Development fallback login (only when `ADMIN_*` env vars are unset and not production):

- Username: `admin`
- Password: `admin123`

**Change this before any real deployment.** Production seed refuses the default password and requires `ADMIN_USERNAME` + `ADMIN_PASSWORD`.

## Build

```bash
npm run build
npm start
```

## GitHub upload

```bash
git status
git add .
git commit -m "Prepare DextransGroup Cargo for production deployment"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Do not commit `.env`, `*.db`, `node_modules`, or `.next`.

## Vercel deployment

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Create a PostgreSQL database (Vercel Postgres / Neon / Supabase).
4. Set environment variables in Vercel:
   - `DATABASE_URL` (required)
   - `DIRECT_URL` (recommended; if missing, app copies `DATABASE_URL`)
   - `SESSION_SECRET` (required for login)
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` (for seed)
5. Deploy.
6. Run migrations once against production DB:

```bash
npx prisma migrate deploy
npm run db:seed
```

Or add a one-off deploy hook / local run against the production `DATABASE_URL`.

### Production database warning

- Use **PostgreSQL** only in production (SQLite is not used).
- PDF uploads are stored in the database (`Bytes`), not on the Vercel filesystem.
- Keep backups of your Postgres instance.

### Cookie / HTTPS

Production cookies use `secure: true` when `NODE_ENV=production`. Serve the app over HTTPS (Vercel default).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local development |
| `npm run build` | `prisma generate` + `next build` |
| `npm run db:push` | Push schema (dev) |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed admin + warehouses + operators |
| `npm run prisma:generate` | Safe generate (Windows retries) |

## Admin

After seed: `/admin/login`

Do not publish the development password in screenshots or client code.
