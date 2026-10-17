import Link from "next/link";
import { dict, getLang } from "@/lib/i18n";
import { getHodosShop } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const lang = await getLang();
  const t = dict[lang];
  const { shop, products } = await getHodosShop();
  const sections = [...new Set(products.map((p) => p.section ?? ""))];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-32 pt-4">
      <Link href="/" aria-label="←" className="flex h-12 w-12 items-center justify-center rounded-full bg-hodos-grey text-xl">←</Link>
      <div>
        <h1 className="font-display text-4xl font-extrabold">{t.hodosShop}</h1>
        <p className="text-zinc-500">{t.hodosShopSub}</p>
        {shop?.address && <p className="mt-1 text-sm font-medium">📍 {shop.address}</p>}
      </div>
      {products.length === 0 && <p className="rounded-2xl bg-hodos-grey p-6 text-center text-zinc-600">{lang === "fr" ? "Les produits arrivent bientôt." : "Products coming soon."}</p>}
      {sections.map((sec) => (
        <section key={sec} className="flex flex-col gap-4">
          {sec && <h2 className="text-2xl font-bold">{sec}</h2>}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.filter((p) => (p.section ?? "") === sec).map((p) => <ProductCard key={p.id} product={p} lang={lang} />)}
          </div>
        </section>
      ))}
    </main>
  );
}
