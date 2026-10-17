import { redirect } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Super admin home. Only profiles with role admin / super_admin get in;
// admin roles are granted by hand in the database, never through sign-up.
export default async function AdminPage() {
  if (!supabaseConfigured()) redirect("/");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: me } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
  if (!me || (me.role !== "admin" && me.role !== "super_admin")) redirect("/");

  const [{ count: customers }, { count: live }, { data: pending }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("businesses").select("id, name, kind, quartier, created_at").eq("status", "pending").order("created_at"),
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <p className="text-sm font-bold text-hodos-red">HODOS ADMIN</p>
        <h1 className="font-display text-3xl font-extrabold">Bonjour {me.full_name ?? ""}</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-hodos-grey p-4">
          <p className="text-sm text-zinc-600">Utilisateurs · Users</p>
          <p className="font-display text-3xl font-extrabold">{customers ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-hodos-grey p-4">
          <p className="text-sm text-zinc-600">Activités en ligne · Live</p>
          <p className="font-display text-3xl font-extrabold">{live ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-hodos-grey p-4">
          <p className="text-sm text-zinc-600">À vérifier · To verify</p>
          <p className="font-display text-3xl font-extrabold">{pending?.length ?? 0}</p>
        </div>
      </div>
      <section className="rounded-2xl border border-zinc-200 p-4">
        <h2 className="font-display text-xl font-extrabold">Activités à vérifier · Businesses to verify</h2>
        {pending && pending.length > 0 ? (
          <ul className="mt-3 divide-y divide-zinc-100">
            {pending.map((b) => (
              <li key={b.id} className="py-3">
                <b>{b.name}</b> · {b.kind} · {b.quartier ?? "—"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">Rien pour le moment · Nothing yet.</p>
        )}
      </section>
    </main>
  );
}
