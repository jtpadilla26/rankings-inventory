# Rankins Inventory — App v2 (Next.js 14 + Tailwind)

## Quickstart
1. Node 18+
2. `npm install`
3. `npm run dev` → http://localhost:3000

## Local Development
1. Copy `.env.example` to `.env.local` and add your Supabase project values.
2. Run `npm run dev`.

## Database Migrations
- Run `supabase-migration.sql` to create core tables/views.
- If you see `inventory_category` type errors, run `supabase-fix-category-enum.sql` to convert category columns to TEXT.

## Build & Deploy (Netlify)
1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Netlify environment variables.
2. Build command: `npm run build`
3. Publish directory: `.next`

## Known Issues / Gaps
- Ensure Supabase RLS policies allow authenticated users to read/write inventory tables.
- The checkout workflow is currently disabled in the UI and requires product decisions before re-enabling.

## Structure
- `app/` App Router (Next 14)
- `app/(public)/login` Public login route
- `app/api/*` Route handlers (API)
- `middleware.ts` Simple auth gate (looks for Supabase cookies)

## Next
- Add automated tests for API routes and inventory workflows.
