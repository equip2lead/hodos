import { redirect } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

// Only profiles with role admin / super_admin get through.
// Admin roles are granted by hand in the database, never through sign-up.
export async function requireAdmin(next = "/admin") {
  if (!supabaseConfigured()) redirect("/");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  const { data: me } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
  if (!me || (me.role !== "admin" && me.role !== "super_admin")) redirect("/");
  return { supabase, user, me };
}
