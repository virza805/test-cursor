# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 16 (App Router, Turbopack) "Dev Event Platform"** that talks to **Supabase** (Postgres + PostgREST) via `@supabase/supabase-js`. Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`).

### Services

| Service | How to run | Port | Notes |
|---|---|---|---|
| Next.js app (dev) | `npm run dev` | 3000 | Turbopack; reads `.env.local` |
| Local Supabase backend | `dev-backend.sh` | 54321 | Postgres + PostgREST behind an nginx proxy (see below) |

There is no automated test suite in this repo. `npm run lint` works but reports **pre-existing** lint errors/warnings in the app source — these are not caused by environment setup.

### Local Supabase-compatible backend (required for data)

The Supabase MCP server requires auth and is unavailable, and there is no hosted Supabase project wired up, so a local Supabase-compatible stack is used instead. It is provisioned in the VM snapshot:

- **Postgres 16** (apt) on `:5432`, database `postgres`. Roles `anon`, `authenticated`, `service_role` (BYPASSRLS), and login role `authenticator` mirror Supabase.
- **PostgREST** (`/usr/local/bin/postgrest`, config `/etc/postgrest.conf`) on `:3001`, validating the local JWT secret `super-secret-jwt-token-with-at-least-32-characters-long`.
- **nginx** maps `:54321/rest/v1/ → :3001/` (the `/rest/v1` prefix that `supabase-js` expects).

**Start the backend each session** (idempotent) before `npm run dev`:

```bash
dev-backend.sh
```

This starts the Postgres cluster, PostgREST (logs at `/tmp/postgrest.log`), and nginx, then prints health status.

### Environment variables (`.env.local`)

`.env.local` is gitignored but kept in the VM snapshot. If it is missing, recreate it with the local backend URL/keys:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon JWT signed with the local secret>
SUPABASE_SERVICE_ROLE_KEY=<service_role JWT signed with the local secret>
NEXT_PUBLIC_POSTHOG_KEY=phc_localdev_placeholder
```

The keys are HS256 JWTs (`role: anon` / `role: service_role`) signed with the secret above; regenerate with any JWT tool if needed. PostHog uses a placeholder key — analytics calls are harmless no-ops locally.

### Gotchas

- **Table naming**: the application code queries the `booking` table (singular) and `events`. The committed `database/csv/supabase_schema.sql` defines `bookings` (plural) — that file does **not** match the code. The local DB is created with the `booking` table (singular) so the app works. Don't "fix" the app to use `bookings`.
- `database/csv/events.csv` is not COPY-safe (the `tags` array column has unquoted commas), so seed data is loaded via explicit `INSERT`s, not `COPY`.
- All server data access uses the **service_role** admin client (`lib/supabase.ts` → `createAdminClient`), which bypasses RLS; RLS is therefore not required locally.
- After applying schema/DDL changes to Postgres, reload PostgREST's cache: `psql -c "NOTIFY pgrst, 'reload schema';"` (or restart `postgrest`).
