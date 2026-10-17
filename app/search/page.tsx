import Link from "next/link";
import { getLang } from "@/lib/i18n";
import { searchProducts } from "@/lib/data";
import { CATS, catImg, catName } from "@/lib/cats";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const lang = await getLang();
  const fr = lang === "fr";
  const cats = q ? CATS.filter((c) => norm(c.fr).includes(norm(q)) || norm(c.en).includes(norm(q))) : [];
  const products = await searchProducts(q);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-32 pt-4">
      <form className="flex items-center gap-3">
        <Link href="/" aria-label="←" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-hodos-grey text-xl">←</Link>
        <input name="q" defaultValue={q} autoFocus placeholder={fr ? "Rechercher boutiques et produits" : "Search shops and products"} className="h-14 min-w-0 flex-1 rounded-full border-[1.5px] border-zinc-200 px-5 text-lg outline-none" />
      </form>
      {cats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {cats.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="flex h-14 items-center gap-2 rounded-full bg-hodos-grey pl-1.5 pr-5 font-bold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={catImg(c.slug)} alt="" className="h-11 w-11 rounded-full object-cover" />
              {catName(c, lang)}
            </Link>
          ))}
        </div>
      )}
      {products.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} lang={lang} />)}
        </div>
      )}
      {q && cats.length === 0 && products.length === 0 && (
        <p className="py-10 text-center text-lg text-zinc-500">{fr ? `Aucun résultat pour « ${q} »` : `No results for "${q}"`}</p>
      )}
    </main>
  );
}
