import Link from "next/link";
import { setLang } from "@/app/actions";
import { dict, type Lang, type SavedAddress } from "@/lib/i18n";
import { HMark } from "./ui";

function Pin() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

export function Header({ lang, address, back = "/" }: { lang: Lang; address: SavedAddress | null; back?: string }) {
  const t = dict[lang];
  return (
    <header className="flex flex-col gap-4">
      <Link href="/address" className="flex min-h-11 items-center gap-2 text-lg font-medium">
        <Pin />
        <span className="truncate">{address ? address.label : t.city}</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.5" d="m6 9 6 6 6-6" /></svg>
      </Link>
      <div className="flex items-center justify-between gap-3">
        <Link href="/" aria-label="Hodos" className="flex items-center gap-1 text-hodos-red">
          <HMark className="h-14 w-14" />
          <span className="font-display -skew-x-6 text-3xl font-extrabold text-hodos-ink max-sm:sr-only">hodos</span>
        </Link>
        <div className="flex items-center gap-2">
          <form action={setLang}>
            <input type="hidden" name="lang" value={lang === "fr" ? "en" : "fr"} />
            <input type="hidden" name="back" value={back} />
            <button className="h-14 rounded-full px-4 text-lg font-bold">{t.switchTo}</button>
          </form>
          <Link href="/login" className="flex h-14 items-center rounded-full bg-hodos-grey px-7 text-lg font-bold">
            {t.login}
          </Link>
        </div>
      </div>
      <form action="/search" className="flex h-16 items-center gap-3 rounded-full border-[1.5px] border-zinc-200 px-5">
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-zinc-500" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
        <label className="sr-only" htmlFor="q">{t.search}</label>
        <input id="q" name="q" type="search" placeholder={t.search} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-500 sm:text-lg" />
      </form>
    </header>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const fr = lang === "fr";
  const col = (title: string, links: [string, string][]) => (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold">{title}</h3>
      {links.map(([label, href]) => (
        <Link key={label} href={href} className="text-zinc-500">{label}</Link>
      ))}
    </div>
  );
  return (
    <footer className="mt-4">
      <a href="#top" className="block bg-zinc-200/70 py-4 text-center">{t.backToTop}</a>
      <div className="bg-hodos-grey px-4 pb-32 pt-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {col(t.helpYou, [[t.support, "https://wa.me/"], [t.myOrders, "/orders"], [t.deals, "/shop"], [lang === "fr" ? "Formations" : "Courses", "/courses"]])}
          {col(t.allServices, [[fr ? "Restaurants" : "Restaurants", "/c/restaurants"], [fr ? "Courses" : "Groceries", "/c/groceries"], [fr ? "Cadeaux & Fleurs" : "Gifts & Flowers", "/c/gifts"], [fr ? "Pharmacie" : "Pharmacy", "/c/pharmacy"]])}
          {col(t.market, [[fr ? "Électronique" : "Electronics", "/c/electronics"], [fr ? "Beauté" : "Beauty", "/c/beauty"], [fr ? "Mode" : "Fashion", "/c/fashion"], [fr ? "Librairies" : "Bookshops", "/c/bookshops"]])}
          {col(fr ? "Découvrir" : "Discover", [[fr ? "Églises" : "Churches", "/c/churches"], [fr ? "Hôpitaux" : "Hospitals", "/c/hospitals"], [fr ? "Hôtels" : "Hotels", "/c/hotels"], [fr ? "Cinémas" : "Cinemas", "/c/cinemas"]])}
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-center gap-3">
          {["App Store", "Google Play"].map((s) => (
            <span key={s} className="flex h-14 items-center rounded-2xl border border-zinc-300 bg-white px-5">
              <span className="flex flex-col leading-tight"><span className="text-xs">{t.soon}</span><b className="text-lg">{s}</b></span>
            </span>
          ))}
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl flex-wrap justify-center gap-3">
          {["Instagram", "Facebook", "TikTok", "YouTube"].map((s) => (
            <span key={s} className="flex h-12 items-center rounded-2xl bg-white px-4 text-sm font-bold">{s}</span>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-zinc-500">
          © 2026 Hodos · {t.tagline}
        </p>
      </div>
    </footer>
  );
}
