import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { fcfa, getLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Order = {
  code: string; status: string; mode: "delivery" | "pickup"; payment: "momo" | "orange_money" | "cash";
  address: string | null; name: string; subtotal: number; delivery_fee: number; total: number; created_at: string;
  business: { name: string; address: string | null; phone: string | null };
  items: { name: string; qty: number; price: number }[];
};

const STEPS = ["sent", "accepted", "preparing", "ready", "on_the_way", "delivered"] as const;
const T = {
  fr: {
    thanks: "Merci ! Commande envoyée", code: "Numéro de commande", keep: "Gardez ce numéro. Nous vous appelons pour confirmer.",
    steps: { sent: "Envoyée", accepted: "Acceptée", preparing: "En préparation", ready: "Prête", on_the_way: "En route", delivered: "Livrée" } as Record<string, string>,
    declined: "Commande refusée", cancelled: "Commande annulée",
    delivery: "Livraison à", pickup: "À retirer à", pay: { momo: "MTN Mobile Money", orange_money: "Orange Money", cash: "Espèces" },
    payment: "Paiement", subtotal: "Sous-total", fee: "Livraison", total: "Total", home: "Retour à l'accueil", refresh: "Actualiser",
  },
  en: {
    thanks: "Thank you! Order sent", code: "Order number", keep: "Keep this number. We'll call you to confirm.",
    steps: { sent: "Sent", accepted: "Accepted", preparing: "Preparing", ready: "Ready", on_the_way: "On the way", delivered: "Delivered" } as Record<string, string>,
    declined: "Order declined", cancelled: "Order cancelled",
    delivery: "Delivering to", pickup: "Pick up at", pay: { momo: "MTN Mobile Money", orange_money: "Orange Money", cash: "Cash" },
    payment: "Payment", subtotal: "Subtotal", fee: "Delivery", total: "Total", home: "Back home", refresh: "Refresh",
  },
};

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const lang = await getLang();
  const t = T[lang];
  if (!supabaseConfigured()) notFound();
  const s = await createClient();
  const { data } = await s.rpc("get_order", { p_code: decodeURIComponent(code) });
  const o = data as Order | null;
  if (!o) notFound();

  const stopped = o.status === "declined" || o.status === "cancelled";
  const steps: string[] = o.mode === "pickup" ? STEPS.filter((x) => x !== "on_the_way") : [...STEPS];
  const at = steps.indexOf(o.status);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-hodos-red text-4xl text-white">✓</span>
        <h1 className="font-display text-3xl font-extrabold">{t.thanks}</h1>
        <p className="text-zinc-600">{t.code}</p>
        <p className="font-display text-4xl font-extrabold tracking-wide text-hodos-red">{o.code}</p>
        <p className="text-zinc-600">{t.keep}</p>
      </div>

      {stopped ? (
        <p className="rounded-2xl bg-hodos-blush p-4 text-center font-bold text-hodos-deep">{o.status === "declined" ? t.declined : t.cancelled}</p>
      ) : (
        <ol className="flex flex-col gap-3 rounded-2xl bg-hodos-grey p-5">
          {steps.map((st, i) => (
            <li key={st} className="flex items-center gap-3">
              <span className={`h-4 w-4 rounded-full ${i <= at ? "bg-hodos-red" : "bg-zinc-300"}`} />
              <span className={i === at ? "font-bold" : i < at ? "" : "text-zinc-400"}>{t.steps[st]}</span>
            </li>
          ))}
        </ol>
      )}

      <section className="flex flex-col gap-1 rounded-2xl border border-zinc-200 p-4">
        <span className="text-sm text-zinc-500">{o.mode === "delivery" ? t.delivery : t.pickup}</span>
        <b>{o.mode === "delivery" ? o.address : `${o.business.name} — ${o.business.address ?? ""}`}</b>
        <span className="mt-2 text-sm text-zinc-500">{t.payment}</span>
        <b>{t.pay[o.payment]}</b>
      </section>

      <ul className="flex flex-col divide-y divide-zinc-100">
        {o.items.map((i) => (
          <li key={i.name} className="flex justify-between py-2"><span>{i.qty} × {i.name}</span><b>{fcfa(i.qty * i.price)}</b></li>
        ))}
      </ul>
      <dl className="flex flex-col gap-1 text-lg">
        <div className="flex justify-between"><dt>{t.subtotal}</dt><dd>{fcfa(o.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>{t.fee}</dt><dd>{fcfa(o.delivery_fee)}</dd></div>
        <div className="flex justify-between text-xl font-bold"><dt>{t.total}</dt><dd>{fcfa(o.total)}</dd></div>
      </dl>

      <div className="grid grid-cols-2 gap-3">
        <Link href={`/order/${o.code}`} className="flex h-14 items-center justify-center rounded-full bg-hodos-grey font-bold">{t.refresh}</Link>
        <Link href="/" className="flex h-14 items-center justify-center rounded-full bg-hodos-red font-bold text-white">{t.home}</Link>
      </div>
    </main>
  );
}
