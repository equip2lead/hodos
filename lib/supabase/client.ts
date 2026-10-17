"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client scoped to the `hodos` schema. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "hodos" } },
  );
}
