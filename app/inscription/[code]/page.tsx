import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { fcfa, getLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type E = {
  code: string; status: "pending" | "confirmed" | "paid" | "cancelled"; name: string; payment: "momo" | "orange_money" | "cash"; amount: number;
  course: { slug: string; title_fr: string; title_en: string; location: string | null; starts_on: string | null; schedule_fr: string | null; schedule_en: string | null };
};

const STATUS = {
  fr: { pending: "En attente de confirmation", confirmed: "Place confirmée", paid: "Payée, place réservée", cancelled: "Annulée" },
  en: { pending: "Waiting for confirmation", confirmed: "Seat confirmed", paid: "Paid, seat booked", cancelled: "Cancelled" },
};
const PAY = { momo: "MTN Mobile Money", orange_money: "Orange Money", cash: "Espèces / Cash" };

export default async function EnrollmentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const lang = await getLang();
  const fr = lang === "fr";
  if (!supabaseConfigured()) notFound();
  const { data } = await (await createClient()).rpc("get_enrollment", { p_code: decodeURIComponent(code) });
  const e = data as E | null;
  if (!e) notFound();
  const when = e.course.starts_on
    ? new Date(e.course.starts_on + "T12:00:00").toLocaleDateString(fr ? "fr-FR" : "en-GB", { weekday: "long", day: "numeric", month: "long" })
    : fr ? e.course.schedule_fr : e.course.schedule_en;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8 text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-hodos-red text-4xl text-white">✓</span>
      <h1 className="font-display text-3xl font-extrabold">{fr ? `Merci ${e.name.split(" ")[0]}, vous êtes inscrit(e) !` : `Thanks ${e.name.split(" ")[0]}, you're signed up!`}</h1>
      <p className="text-xl font-bold">{fr ? e.course.title_fr : e.course.title_en}</p>
      <div className="rounded-2xl bg-hodos-grey p-5">
        <p className="text-zinc-600">{fr ? "Numéro d'inscription" : "Sign-up number"}</p>
        <p className="font-display text-4xl font-extrabold text-hodos-red">{e.code}</p>
        <p className="mt-2 font-bold">{STATUS[lang][e.status]}</p>
      </div>
      <dl className="flex flex-col gap-2 text-left text-lg">
        {when && <div className="flex justify-between gap-4"><dt className="text-zinc-500">{fr ? "Quand" : "When"}</dt><dd className="text-right font-bold">{when}</dd></div>}
        {e.course.location && <div className="flex justify-between gap-4"><dt className="text-zinc-500">{fr ? "Lieu" : "Where"}</dt><dd className="text-right font-bold">{e.course.location}</dd></div>}
        {e.amount > 0 && <div className="flex justify-between gap-4"><dt className="text-zinc-500">{fr ? "À payer" : "To pay"}</dt><dd className="font-bold">{fcfa(e.amount)} · {PAY[e.payment]}</dd></div>}
      </dl>
      <p className="text-zinc-600">{fr ? "Gardez ce numéro. Nous vous appelons pour confirmer." : "Keep this number. We'll call you to confirm."}</p>
      <Link href="/" className="flex h-14 items-center justify-center rounded-full bg-hodos-red font-bold text-white">{fr ? "Retour à l'accueil" : "Back home"}</Link>
    </main>
  );
}
