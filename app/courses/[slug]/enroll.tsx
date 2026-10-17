"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fcfa, type Lang } from "@/lib/dict";

const T = {
  fr: {
    title: "Je m'inscris", name: "Nom complet", phone: "Téléphone (MTN / Orange)", email: "E-mail (facultatif)", pay: "Paiement",
    momo: "MTN Mobile Money", om: "Orange Money", cash: "Espèces sur place", send: "Valider mon inscription", sending: "Envoi…",
    note: "Nous vous appelons pour confirmer votre place et envoyer la demande de paiement.",
    errors: { name_required: "Entrez votre nom.", phone_required: "Entrez un numéro valide.", course_full: "Désolé, c'est complet.", course_unavailable: "Cette formation n'est plus disponible.", other: "L'inscription n'a pas pu être envoyée. Réessayez." },
  },
  en: {
    title: "Sign me up", name: "Full name", phone: "Phone (MTN / Orange)", email: "Email (optional)", pay: "Payment",
    momo: "MTN Mobile Money", om: "Orange Money", cash: "Cash on the day", send: "Confirm my sign-up", sending: "Sending…",
    note: "We call you to confirm your seat and send the payment request.",
    errors: { name_required: "Enter your name.", phone_required: "Enter a valid number.", course_full: "Sorry, it's full.", course_unavailable: "This course is no longer available.", other: "Sign-up couldn't be sent. Please try again." },
  },
};

export default function Enroll({ lang, courseId, price }: { lang: Lang; courseId: string; price: number }) {
  const t = T[lang];
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [payment, setPayment] = useState<"momo" | "orange_money" | "cash">("momo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const me = JSON.parse(localStorage.getItem("hodos_me") || "null");
      if (me) { setName(me.name || ""); setPhone(me.phone || ""); }
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { data, error } = await createClient().rpc("enroll", { p_course: courseId, p_name: name, p_phone: phone, p_payment: payment, p_email: email || null });
    if (error || !data) {
      const key = Object.keys(t.errors).find((k) => error?.message?.includes(k)) as keyof typeof t.errors | undefined;
      setError(t.errors[key ?? "other"]);
      setBusy(false);
      return;
    }
    try { localStorage.setItem("hodos_me", JSON.stringify({ name, phone })); } catch {}
    router.push(`/inscription/${data}`);
  }

  const radio = (on: boolean) => `flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 text-left ${on ? "border-hodos-red bg-hodos-blush" : "border-zinc-200"}`;

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-[28px] border border-zinc-200 p-5">
      <h2 className="text-2xl font-bold">{t.title}</h2>
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.name} autoComplete="name" className="h-14 rounded-2xl border-[1.5px] border-zinc-200 px-4 text-lg" />
      <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phone} type="tel" inputMode="tel" autoComplete="tel" className="h-14 rounded-2xl border-[1.5px] border-zinc-200 px-4 text-lg" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} type="email" autoComplete="email" className="h-14 rounded-2xl border-[1.5px] border-zinc-200 px-4 text-lg" />
      {price > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-bold">{t.pay}</legend>
          {([["momo", t.momo, "#FFCC00"], ["orange_money", t.om, "#FF7900"], ["cash", t.cash, "#16A34A"]] as const).map(([v, label, dot]) => (
            <button key={v} type="button" onClick={() => setPayment(v)} className={radio(payment === v)}>
              <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: dot }} />
              <b className="flex-1">{label}</b>
              <span className={`h-6 w-6 rounded-full border-2 ${payment === v ? "border-[7px] border-hodos-red" : "border-zinc-300"}`} />
            </button>
          ))}
        </fieldset>
      )}
      <p className="text-sm text-zinc-600">{t.note}</p>
      {error && <p role="alert" className="rounded-2xl bg-hodos-blush p-4 font-medium text-hodos-deep">{error}</p>}
      <button disabled={busy} className="flex h-16 items-center justify-between rounded-full bg-hodos-red px-6 text-lg font-bold text-white disabled:opacity-60">
        <span>{busy ? t.sending : t.send}</span>
        {price > 0 && <span>{fcfa(price)}</span>}
      </button>
    </form>
  );
}
