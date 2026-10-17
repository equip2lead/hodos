import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { dict, getLang } from "@/lib/i18n";
import { setLang } from "./actions";

type Category = { id: number; kind: "order" | "book" | "list"; slug: string; name_en: string; name_fr: string; image_url: string | null };

function HMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        <polygon points="13,100 39,100 58,20 32,20" />
        <polygon points="57,100 83,100 102,20 76,20" />
        <polygon points="27,73 103,48 107,32 31,57" />
      </g>
    </svg>
  );
}

export default async function Home() {
  const lang = await getLang();
  const t = dict[lang];

  let categories: Category[] = [];
  if (supabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("categories").select("id, kind, slug, name_en, name_fr, image_url").order("sort");
    categories = (data ?? []) as Category[];
  }

  const groups: { kind: Category["kind"]; title: string; sub: string; tint: string }[] = [
    { kind: "order", title: t.order, sub: t.orderSub, tint: "bg-hodos-grey" },
    { kind: "book", title: t.book, sub: t.bookSub, tint: "bg-hodos-grey" },
    { kind: "list", title: t.discover, sub: t.discoverSub, tint: "bg-hodos-blush" },
  ];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6">
      <header className="flex flex-col gap-3">
        <p className="text-base font-medium">{t.location}</p>
        <div className="flex items-center justify-between gap-3">
          <Link href="/" aria-label="Hodos" className="flex items-center gap-2 text-hodos-red">
            <HMark className="h-14 w-14" />
            <span className="font-display -skew-x-6 text-3xl font-extrabold text-hodos-ink">hodos</span>
          </Link>
          <div className="flex items-center gap-2">
            <form action={setLang}>
              <input type="hidden" name="lang" value={lang === "fr" ? "en" : "fr"} />
              <input type="hidden" name="back" value="/" />
              <button className="min-h-12 rounded-full border border-zinc-200 px-4 font-bold">{t.switchTo}</button>
            </form>
            <Link href="/login" className="flex min-h-12 items-center rounded-full bg-hodos-grey px-6 font-bold">
              {t.login}
            </Link>
          </div>
        </div>
        <label className="flex min-h-14 items-center gap-3 rounded-full border-[1.5px] border-zinc-200 px-5">
          <span className="sr-only">{t.search}</span>
          <input type="search" placeholder={t.search} className="min-w-0 flex-1 bg-transparent text-base outline-none" />
        </label>
      </header>

      {!supabaseConfigured() && (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">{t.notConfigured}</p>
      )}

      {groups.map((g) => {
        const items = categories.filter((c) => c.kind === g.kind);
        if (items.length === 0) return null;
        return (
          <section key={g.kind} className="flex flex-col gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold">{g.title}</h2>
              <p className="text-sm text-zinc-600">{g.sub}</p>
            </div>
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 lg:grid-cols-8">
              {items.map((c) => (
                <Link key={c.id} href={`/c/${c.slug}`} className="flex flex-col items-center gap-2 text-center">
                  <span className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl ${g.tint}`}>
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <HMark className="h-1/2 w-1/2 text-hodos-red/30" />
                    )}
                  </span>
                  <span className="text-sm font-medium leading-tight">{lang === "fr" ? c.name_fr : c.name_en}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-hodos-red p-7 text-white">
        <div className="flex-[1_1_260px]">
          <h2 className="font-display text-2xl font-extrabold">{t.business}</h2>
          <p className="text-red-100">{t.businessSub}</p>
        </div>
        <Link href="/login?next=/business" className="flex min-h-12 items-center rounded-full bg-white px-6 font-bold text-hodos-red">
          {t.listMine}
        </Link>
      </section>

      <footer className="pb-6 text-sm text-zinc-500">© 2026 Hodos · {t.tagline}</footer>
    </main>
  );
}
