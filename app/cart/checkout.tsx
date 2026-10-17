"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/cart";
import { HMark } from "@/components/ui";
import { fcfa, type Lang } from "@/lib/dict";

const T = {
  fr: {
    title: "Mon panier", empty: "Votre panier est vide.", shop: "Voir la boutique", how: "Comment recevoir ?",
    delivery: "Livraison", deliverySub: "Chez vous, à l'adresse choisie", pickup: "Retrait à la station", pickupSub: "Gratuit, prêt en 1 h",
    address: "Adresse de livraison", change: "Changer", chooseAddr: "Choisir mon adresse sur la carte", station: "Station Hodos",
    you: "Vos coordonnées", name: "Nom", phone: "Téléphone (MTN / Orange)", note: "Note pour le livreur (facultatif)",
    pay: "Paiement", momo: "MTN Mobile Money", om: "Orange Money", cash: "Espèces à la livraison", cashPickup: "Espèces au retrait",
    payNote: "Nous vous appelons pour confirmer, puis vous recevez la demande de paiement sur votre téléphone.",
    subtotal: "Sous-total", fee: "Livraison", total: "Total", order: "Commander", sending: "Envoi…", free: "Gratuit",
    errors: { name_required: "Entrez votre nom.", phone_required: "Entrez un numéro de téléphone valide.", address_required: "Choisissez votre adresse de livraison.", cart_empty: "Ces produits ne sont plus disponibles.", business_unavailable: "Cette boutique ne prend pas de commandes pour le moment.", other: "La commande n'a pas pu être envoyée. Réessayez." },
  },
  en: {
    title: "My cart", empty: "Your cart is empty.", shop: "Go to the shop", how: "How do you want it?",
    delivery: "Delivery", deliverySub: "To the address you chose", pickup: "Pick up at the station", pickupSub: "Free, ready in 1 hour",
    address: "Delivery address", change: "Change", chooseAddr: "Choose my address on the map", station: "Hodos station",
    you: "Your details", name: "Name", phone: "Phone (MTN / Orange)", note: "Note for the rider (optional)",
    pay: "Payment", momo: "MTN Mobile Money", om: "Orange Money", cash: "Cash on delivery", cashPickup: "Cash at pick-up",
    payNote: "We call you to confirm, then you get the payment request on your phone.",
    subtotal: "Subtotal", fee: "Delivery", total: "Total", order: "Place order", sending: "Sending…", free: "Free",
    errors: { name_required: "Enter your name.", phone_required: "Enter a valid phone number.", address_required: "Choose your delivery address.", cart_empty: "These products are no longer available.", business_unavailable: "This shop isn't taking orders right now.", other: "The order couldn't be sent. Please try again." },
  },
};

type Shop = { id: string; name: string; address: string | null; delivery_fee_fcfa: number };
type Addr = { label: string; lat: number; lng: number; detail?: string };

function readAddr(): Addr | null {
  try {
    return JSON.parse(decodeURIComponent(document.cookie.match(/hodos_addr=([^;]+)/)?.[1] || "null"));
  } catch {
    return null;
  }
}

export default function Checkout({ lang }: { lang: Lang }) {
  const t = T[lang];
  const router = useRouter();
  const { cart, ready, setQty, clear, subtotal } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [addr, setAddr] = useState<Addr | null>(null);
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [payment, setPayment] = useState<"momo" | "orange_money" | "cash">("momo");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAddr(readAddr());
    try {
      const me = JSON.parse(localStorage.getItem("hodos_me") || "null");
      if (me) { setName(me.name || ""); setPhone(me.phone || ""); }
    } catch {}
  }, []);

  useEffect(() => {
    if (!cart.businessId) return;
    createClient().from("businesses").select("id, name, address, delivery_fee_fcfa").eq("id", cart.businessId).maybeSingle()
      .then(({ data }) => setShop(data as Shop | null));
  }, [cart.businessId]);

  const fee = mode === "delivery" ? shop?.delivery_fee_fcfa ?? 0 : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "delivery" && !addr) { setError(t.errors.address_required); return; }
    setBusy(true);
    const address = mode === "delivery" && addr ? [addr.label, addr.detail].filter(Boolean).join(" — ") : null;
    const { data, error } = await createClient().rpc("place_order", {
      p_business: cart.businessId, p_items: cart.items.map((i) => ({ product_id: i.id, qty: i.qty })),
      p_mode: mode, p_payment: payment, p_name: name, p_phone: phone,
      p_address: address, p_zone: addr?.label ?? null, p_lat: mode === "delivery" ? addr?.lat ?? null : null,
      p_lng: mode === "delivery" ? addr?.lng ?? null : null, p_note: note || null,
    });
    if (error || !data) {
      const key = Object.keys(t.errors).find((k) => error?.message?.includes(k)) as keyof typeof t.errors | undefined;
      setError(t.errors[key ?? "other"]);
      setBusy(false);
      return;
    }
    try {
      localStorage.setItem("hodos_me", JSON.stringify({ name, phone }));
      const past = JSON.parse(localStorage.getItem("hodos_orders") || "[]");
      localStorage.setItem("hodos_orders", JSON.stringify([data, ...past].slice(0, 30)));
    } catch {}
    clear();
    router.push(`/order/${data}`);
  }

  if (!ready) return null;

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-5 px-5 text-center">
        <HMark className="h-20 w-20 text-hodos-red/30" />
        <p className="text-xl">{t.empty}</p>
        <Link href="/shop" className="flex h-14 items-center rounded-full bg-hodos-red px-8 text-lg font-bold text-white">{t.shop}</Link>
      </main>
    );
  }

  const radio = (on: boolean) => `flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 text-left ${on ? "border-hodos-red bg-hodos-blush" : "border-zinc-200"}`;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-40 pt-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="←" className="flex h-12 w-12 items-center justify-center rounded-full bg-hodos-grey text-xl">←</button>
        <h1 className="font-display text-3xl font-extrabold">{t.title}</h1>
      </div>

      <ul className="flex flex-col divide-y divide-zinc-100">
        {cart.items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 py-3">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-hodos-grey">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {i.image ? <img src={i.image} alt="" className="h-full w-full object-contain p-1" /> : <HMark className="h-8 w-8 text-hodos-red/30" />}
            </span>
            <span className="flex-1">
              <span className="block font-medium leading-tight">{i.name}</span>
              <span className="font-bold">{fcfa(i.price * i.qty)}</span>
            </span>
            <span className="flex h-12 items-center rounded-full bg-hodos-grey">
              <button type="button" onClick={() => setQty(i.id, i.qty - 1)} className="h-full w-11 text-2xl font-bold text-hodos-red" aria-label="−">−</button>
              <span className="min-w-5 text-center font-bold">{i.qty}</span>
              <button type="button" onClick={() => setQty(i.id, i.qty + 1)} className="h-full w-11 text-2xl font-bold text-hodos-red" aria-label="+">+</button>
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-xl font-bold">{t.how}</legend>
          <button type="button" onClick={() => setMode("delivery")} className={radio(mode === "delivery")}>
            <span className="flex-1"><b className="block">{t.delivery}</b><span className="text-sm text-zinc-600">{t.deliverySub}</span></span>
            <b>{shop ? (shop.delivery_fee_fcfa ? fcfa(shop.delivery_fee_fcfa) : t.free) : ""}</b>
          </button>
          <button type="button" onClick={() => setMode("pickup")} className={radio(mode === "pickup")}>
            <span className="flex-1"><b className="block">{t.pickup}</b><span className="text-sm text-zinc-600">{t.pickupSub}</span></span>
            <b>{t.free}</b>
          </button>
        </fieldset>

        {mode === "delivery" ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">{t.address}</h2>
            {addr ? (
              <div className="flex items-center gap-3 rounded-2xl bg-hodos-grey p-4">
                <span className="flex-1"><b className="block">{addr.label}</b>{addr.detail && <span className="text-sm text-zinc-600">{addr.detail}</span>}</span>
                <Link href="/address?next=/cart" className="font-bold text-hodos-red">{t.change}</Link>
              </div>
            ) : (
              <Link href="/address?next=/cart" className="flex h-14 items-center justify-center rounded-2xl border-2 border-dashed border-hodos-red font-bold text-hodos-red">{t.chooseAddr}</Link>
            )}
          </section>
        ) : (
          <section className="rounded-2xl bg-hodos-grey p-4">
            <b className="block">{t.station}</b>
            <span className="text-sm text-zinc-600">{shop?.address}</span>
          </section>
        )}

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-xl font-bold">{t.you}</legend>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.name} autoComplete="name" className="h-14 rounded-2xl border-[1.5px] border-zinc-200 px-4 text-lg" />
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phone} type="tel" inputMode="tel" autoComplete="tel" className="h-14 rounded-2xl border-[1.5px] border-zinc-200 px-4 text-lg" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.note} className="h-14 rounded-2xl border-[1.5px] border-zinc-200 px-4 text-lg" />
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-xl font-bold">{t.pay}</legend>
          {([["momo", t.momo, "#FFCC00"], ["orange_money", t.om, "#FF7900"], ["cash", mode === "delivery" ? t.cash : t.cashPickup, "#16A34A"]] as const).map(([v, label, dot]) => (
            <button key={v} type="button" onClick={() => setPayment(v)} className={radio(payment === v)}>
              <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: dot }} />
              <b className="flex-1">{label}</b>
              <span className={`h-6 w-6 rounded-full border-2 ${payment === v ? "border-[7px] border-hodos-red" : "border-zinc-300"}`} />
            </button>
          ))}
          {payment !== "cash" && <p className="text-sm text-zinc-600">{t.payNote}</p>}
        </fieldset>

        <dl className="flex flex-col gap-2 rounded-2xl bg-hodos-grey p-4 text-lg">
          <div className="flex justify-between"><dt>{t.subtotal}</dt><dd>{fcfa(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>{t.fee}</dt><dd>{fee ? fcfa(fee) : t.free}</dd></div>
          <div className="flex justify-between text-xl font-bold"><dt>{t.total}</dt><dd>{fcfa(subtotal + fee)}</dd></div>
        </dl>

        {error && <p role="alert" className="rounded-2xl bg-hodos-blush p-4 font-medium text-hodos-deep">{error}</p>}

        <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <button disabled={busy} className="mx-auto flex h-16 w-full max-w-xl items-center justify-between rounded-full bg-hodos-red px-6 text-lg font-bold text-white disabled:opacity-60">
            <span>{busy ? t.sending : t.order}</span>
            <span>{fcfa(subtotal + fee)}</span>
          </button>
        </div>
      </form>
    </main>
  );
}
