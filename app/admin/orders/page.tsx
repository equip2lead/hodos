import { requireAdmin } from "@/lib/admin";
import { fcfa } from "@/lib/dict";
import { setOrderStatus } from "../actions";
import { AdminNav } from "../nav";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  sent: "Nouvelle", accepted: "Acceptée", preparing: "En préparation", ready: "Prête",
  on_the_way: "En route", delivered: "Livrée", declined: "Refusée", cancelled: "Annulée",
};
const PAY: Record<string, string> = { momo: "MTN MoMo", orange_money: "Orange Money", cash: "Espèces" };

type Row = {
  id: string; code: string; status: string; mode: string; payment: string; address: string | null; note: string | null;
  customer_name: string | null; customer_phone: string | null; lat: number | null; lng: number | null;
  total_fcfa: number; created_at: string; order_items: { name: string; qty: number }[];
};

export default async function AdminOrders() {
  const { supabase } = await requireAdmin("/admin/orders");
  const { data } = await supabase
    .from("orders")
    .select("id, code, status, mode, payment, address, note, customer_name, customer_phone, lat, lng, total_fcfa, created_at, order_items(name, qty)")
    .order("created_at", { ascending: false })
    .limit(100);
  const orders = (data ?? []) as Row[];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">Commandes</h1>
      <AdminNav on="orders" />
      {orders.length === 0 && <p className="text-zinc-500">Aucune commande pour le moment.</p>}
      {orders.map((o) => {
        const phone = (o.customer_phone ?? "").replace(/[^\d+]/g, "");
        const wa = phone.replace(/^\+/, "").replace(/^(6\d{8})$/, "237$1");
        return (
          <article key={o.id} className={`flex flex-col gap-3 rounded-2xl border-2 p-4 ${o.status === "sent" ? "border-hodos-red" : "border-zinc-200"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <b className="font-display text-xl">{o.code}</b>
              <span className="text-sm text-zinc-500">{new Date(o.created_at).toLocaleString("fr-FR", { timeZone: "Africa/Douala", dateStyle: "short", timeStyle: "short" })}</span>
            </div>
            <p><b>{o.customer_name}</b> · <a className="font-bold text-hodos-red" href={`tel:${phone}`}>{o.customer_phone}</a> · <a className="font-bold text-green-700" href={`https://wa.me/${wa}`}>WhatsApp</a></p>
            <p>
              {o.mode === "delivery" ? "🛵 Livraison : " : "🏪 Retrait station"}{o.mode === "delivery" && o.address}
              {o.lat && o.lng && <> · <a className="font-bold text-hodos-red" href={`https://maps.google.com/?q=${o.lat},${o.lng}`}>Carte</a></>}
            </p>
            <p className="text-zinc-700">{o.order_items.map((i) => `${i.qty} × ${i.name}`).join(", ")}</p>
            {o.note && <p className="text-sm text-zinc-500">Note : {o.note}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <b>{fcfa(o.total_fcfa)} · {PAY[o.payment]}</b>
              <form action={setOrderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="h-12 rounded-xl border border-zinc-300 px-3">
                  {Object.entries(LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button className="h-12 rounded-xl bg-hodos-ink px-4 font-bold text-white">OK</button>
              </form>
            </div>
          </article>
        );
      })}
    </main>
  );
}
