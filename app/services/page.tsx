import Link from "next/link";
import { getLang } from "@/lib/i18n";
import { CATS, catImg, catName, type Kind } from "@/lib/cats";

export default async function ServicesPage() {
  const lang = await getLang();
  const fr = lang === "fr";
  const groups: { kind: Kind; title: string; sub: string }[] = [
    { kind: "order", title: fr ? "Commander" : "Order", sub: fr ? "Livré chez vous ou prêt à retirer" : "Delivered to you or ready to pick up" },
    { kind: "book", title: fr ? "Réserver" : "Book", sub: fr ? "Rendez-vous, séances et travaux" : "Appointments, sessions and jobs" },
    { kind: "list", title: fr ? "Découvrir" : "Discover", sub: fr ? "Horaires, contacts, itinéraire" : "Times, contacts, directions" },
  ];
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-32 pt-4">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="←" className="flex h-12 w-12 items-center justify-center rounded-full bg-hodos-grey text-xl">←</Link>
        <h1 className="font-display text-3xl font-extrabold">{fr ? "Tous les services" : "All services"}</h1>
      </div>
      <Link href="/courses" className="flex items-center gap-4 rounded-[28px] bg-hodos-ink p-5 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/cat/libraries.jpg" alt="" className="h-20 w-20 rounded-2xl object-cover" />
        <span className="flex-1">
          <b className="block font-display text-2xl">{fr ? "Formations" : "Courses"}</b>
          <span className="text-zinc-300">{fr ? "CapCut, leadership et plus. Inscription en 1 minute." : "CapCut, leadership and more. Sign up in 1 minute."}</span>
        </span>
        <span className="text-2xl">›</span>
      </Link>
      {groups.map((g) => (
        <section key={g.kind} className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold">{g.title}</h2>
            <p className="text-zinc-500">{g.sub}</p>
          </div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-6">
            {CATS.filter((c) => c.kind === g.kind).map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`} className="flex flex-col items-center gap-2 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={catImg(c.slug)} alt="" className="aspect-square w-full rounded-[24px] object-cover" />
                <span className="leading-tight">{catName(c, lang)}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
