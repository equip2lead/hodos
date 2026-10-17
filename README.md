# Hodos

**Le chemin vers tout · Your way to everything.**
Shops, services and places in Yaoundé — order, book or discover.

## Stack
- Next.js 15 (App Router) + Tailwind CSS 4, deployed on Vercel
- Supabase (Postgres, Auth, RLS)

## Database
For now Hodos lives in the **Let's Talk** Supabase project (`ukevrohhqivotbwzkion`, Paris)
inside its own **`hodos`** schema, to avoid paying for another project. Every query must use
the `hodos` schema (the clients in `lib/supabase/` already do). When Hodos grows, dump the
`hodos` schema and restore it into its own project.

The schema is in `supabase/migrations/`. One-time dashboard step: **Project Settings → Data API →
Exposed schemas → add `hodos`**, otherwise the app can't query it.

Admin roles (`admin`, `super_admin`) are set by hand in `hodos.profiles`, never through sign-up.

## Run locally
```bash
cp .env.example .env.local   # add the anon/publishable key
npm install
npm run dev
```

## Design
The clickable bilingual prototype (customer app, business side, super admin) is the
"Hodos Brand Concepts" canvas on claude.ai.

## Deploy
Vercel project `hodos` (team "Denis Ekobena's projects") deploys `main` automatically.
Env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel.
