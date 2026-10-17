import Link from "next/link";
import { addressSkipped, dict, getAddress, getLang } from "@/lib/i18n";
import { getCourses, getHodosShop } from "@/lib/data";
import { CourseCard } from "@/components/course-card";
import { CATS, catBySlug, catImg as img, catName, type Cat } from "@/lib/cats";
import { Footer, Header } from "@/components/chrome";
import { AddressPrompt, Banners } from "@/components/home-client";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";


function Tile({ href, label, src, dots }: { href: string; label: string; src?: string; dots?: boolean }) {
  return (
    <Link href={href} className="flex min-w-0 flex-col items-center gap-2 text-center">
      <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[26px] bg-hodos-grey">
        {dots ? (
          <span className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 9 }).map((_, i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-hodos-ink" />)}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        )}
      </span>
      <span className="w-full text-[13px] leading-tight tracking-tight sm:text-lg">{label}</span>
    </Link>
  );
}

export default async function Home() {
  const [lang, address, skipped, { shop, products }, courses] = await Promise.all([
    getLang(), getAddress(), addressSkipped(), getHodosShop(), getCourses(),
  ]);
  const t = dict[lang];
  const name = (c: Cat) => catName(c, lang);
  const label = (slug: string, _f?: string) => name(catBySlug(slug)!);

  const grid = ["restaurants", "groceries", "pharmacy", "bakeries", "gas", "water", "beauty"];
  const trendy = ["electronics", "fashion", "gifts", "bookshops"];
  const discover = CATS.filter((c) => c.kind === "list");
  const book = CATS.filter((c) => c.kind === "book");

  return (
    <>
      <main id="top" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-4">
        <Header lang={lang} address={address} />

        {!address && !skipped && <AddressPrompt lang={lang} />}

        <Banners lang={lang} />

        <section className="grid grid-cols-4 gap-x-2.5 gap-y-5 sm:grid-cols-8 sm:gap-x-4">
          {grid.map((s) => <Tile key={s} href={`/c/${s}`} label={label(s, s)} src={img(s)} />)}
          <Tile href="/services" label={t.allServices} dots />
        </section>

        {shop && products.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{t.hodosShop}</h2>
                <p className="text-zinc-500">{t.hodosShopSub}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} lang={lang} />)}
            </div>
            <Link href="/shop" className="mx-auto flex h-16 w-full max-w-md items-center justify-center rounded-full bg-hodos-grey text-xl font-bold">
              {t.showMore}
            </Link>
          </section>
        )}

        {courses.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{t.courses}</h2>
                <p className="text-zinc-500">{t.coursesSub}</p>
              </div>
              <Link href="/courses" className="shrink-0 font-bold text-hodos-red">{t.seeAll}</Link>
            </div>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {courses.map((c) => (
                <div key={c.id} className="w-72 shrink-0"><CourseCard course={c} lang={lang} /></div>
              ))}
            </div>
          </section>
        )}

        <section className="-mx-4 flex flex-col gap-4 bg-hodos-grey px-4 py-7 sm:mx-0 sm:rounded-[28px]">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true"><path fill="currentColor" d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
            {t.trendy}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {trendy.map((s) => (
              <Link key={s} href={`/c/${s}`} className="flex h-20 min-w-0 items-center gap-2.5 rounded-[22px] bg-white pl-2.5 pr-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(s)} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                <span className="min-w-0 flex-1 text-[15px] font-medium leading-tight tracking-tight sm:text-lg">{label(s, s)}</span>
                <span aria-hidden="true" className="text-xl text-zinc-400 max-sm:hidden">›</span>
              </Link>
            ))}
          </div>
        </section>

        {book.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{t.book}</h2>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {book.map((c) => (
                <Link key={c.slug} href={`/c/${c.slug}`} className="flex w-36 shrink-0 flex-col gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(c.slug)} alt="" className="aspect-square w-full rounded-[28px] object-cover" />
                  <span className="text-lg font-bold leading-tight">{name(c)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {discover.length > 0 && (
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{t.discover}</h2>
              <p className="text-zinc-500">{t.discoverSub}</p>
            </div>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {discover.map((c) => (
                <Link key={c.slug} href={`/c/${c.slug}`} className="flex w-36 shrink-0 flex-col gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(c.slug)} alt="" className="aspect-square w-full rounded-[28px] object-cover" />
                  <span className="text-lg font-bold leading-tight">{name(c)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-hodos-red p-7 text-white">
          <div className="flex-[1_1_260px]">
            <h2 className="font-display text-2xl font-extrabold">{t.business}</h2>
            <p className="text-red-100">{t.businessSub}</p>
          </div>
          <Link href="/login?next=/business" className="flex h-14 items-center rounded-full bg-white px-6 font-bold text-hodos-red">
            {t.listMine}
          </Link>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
