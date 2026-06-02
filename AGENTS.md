## Cursor Cloud specific instructions

### Product

Single Next.js 16 app (**DevEvent**) at repo root: UI + `/api/events` routes. Data lives in **Supabase** (Postgres). **PostHog** is optional for analytics.

### Services (local dev)

| Service | Required | Notes |
|---------|----------|--------|
| **Next.js** (`npm run dev`) | Yes | Port 3000, Turbopack |
| **Supabase** (local via Docker) | Yes | No hosted credentials in repo; use `npx supabase start` |
| **PostHog** | No | Omit `NEXT_PUBLIC_POSTHOG_KEY` locally |

### First-time backend (Supabase local)

1. Ensure **Docker** is running (`dockerd` with `fuse-overlayfs` driver in this VM; `sudo chmod 666 /var/run/docker.sock` if you get permission errors).
2. From repo root: `npx supabase start` (migration in `supabase/migrations/` creates `events` + `booking` tables).
3. Seed data: sample rows are not auto-loaded. Either import via Supabase Studio (`http://127.0.0.1:54323`) or insert via the service-role client. CSV seed files are under `database/csv/` but `\copy` fails on quoted commas—prefer Studio or a small script using `@supabase/supabase-js` from the project root.
4. Create `.env.local` from `npx supabase status -o env` (map `API_URL` → `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`, plus `NEXT_PUBLIC_BASE_URL=http://localhost:3000`).

**Schema gotcha:** `database/csv/supabase_schema.sql` defines table `bookings`, but the app and `supabase_rls.sql` use **`booking`**. Use the migration in `supabase/migrations/` or rename before seeding.

### Standard commands

See `package.json` / `README.md`:

- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint` (repo has a few pre-existing ESLint errors in `app/page.tsx`, `LightRays.tsx`)
- Prod build: `npm run build` — **often fails** unless something is serving `NEXT_PUBLIC_BASE_URL` during build, because `/` prerenders via `fetch(\`${BASE_URL}/api/events\`)`. Use dev mode for local verification, or run a server during build if you need production builds.

### Non-obvious app behavior

- Home page (`app/page.tsx`) fetches its own API using `NEXT_PUBLIC_BASE_URL`; that variable must match the running dev server URL.
- Server code uses **service role** Supabase client (`lib/supabase.ts`), not the anon key in practice.
