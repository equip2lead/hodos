import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { fcfa } from "@/lib/dict";
import { AdminNav } from "./nav";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase, me } = await requireAdmin();

  const [{ count: users }, { count: live }, { data: pending }, { count: newOrders }, { data: today }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("businesses").select("id, name, kind, quartier, created_at").eq("status", "pending").order("created_at"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "sent"),
    supabase.from("orders").select("total_fcfa").gte("created_at", new Date(Date.now() - 864e5).toISOString()),
  ]);
  const sales = (today ?? []).reduce((s, o) => s + (o.total_fcfa ?? 0), 0);

  const stat = (label: string, value: string | number, href?: string, hot?: boolean) => {
    const box = (
      <div className={`rounded-2xl p-4 ${hot ? "bg-hodos-red text-white" : "bg-hodos-grey"}`}>
        <p className={`text-sm ${hot ? "text-red-100" : "text-zinc-600"}`}>{label}</p>
        <p className="font-display text-3xl font-extrabold">{value}</p>
      </div>
    );
    return href ? <Link href={href}>{box}</Link> : box;
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <p className="text-sm font-bold text-hodos-red">HODOS ADMIN</p>
        <h1 className="font-display text-3xl font-extrabold">Bonjour {me.full_name ?? ""}</h1>
      </div>
      <AdminNav on="home" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stat("Nouvelles commandes", newOrders ?? 0, "/admin/orders", (newOrders ?? 0) > 0)}
        {stat("Ventes 24 h", fcfa(sales))}
        {stat("Utilisateurs", users ?? 0)}
        {stat("Activités en ligne", live ?? 0)}
      </div>
      <section className="rounded-2xl border border-zinc-200 p-4">
        <h2 className="font-display text-xl font-extrabold">Activités à vérifier</h2>
        {pending && pending.length > 0 ? (
          <ul className="mt-3 divide-y divide-zinc-100">
            {pending.map((b) => (
              <li key={b.id} className="py-3"><b>{b.name}</b> · {b.kind} · {b.quartier ?? "—"}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">Rien pour le moment.</p>
        )}
      </section>
    </main>
  );
}
