import Link from "next/link";
import { notFound } from "next/navigation";
import { fcfa, getLang } from "@/lib/i18n";
import { getProduct } from "@/lib/data";
import { ProductImage } from "@/components/product-card";
import { AddButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const { product, shop } = await getProduct(id);
  if (!product) notFound();
  const name = lang === "fr" ? product.name_fr : product.name_en;
  const desc = lang === "fr" ? product.description_fr : product.description_en;
  const promo = product.compare_at_fcfa && product.compare_at_fcfa > product.price_fcfa;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 pb-40 pt-4">
      <Link href="/shop" aria-label="←" className="flex h-12 w-12 items-center justify-center rounded-full bg-hodos-grey text-xl">←</Link>
      <div className="aspect-square overflow-hidden rounded-[32px] bg-hodos-grey">
        <ProductImage product={product} lang={lang} />
      </div>
      {shop && <p className="font-bold text-hodos-red">{shop.name}</p>}
      <h1 className="font-display text-3xl font-extrabold leading-tight">{name}</h1>
      <p className="flex items-baseline gap-3">
        <span className={`text-2xl font-bold ${promo ? "text-hodos-red" : ""}`}>{fcfa(product.price_fcfa)}</span>
        {promo && <span className="text-xl text-zinc-400 line-through">{fcfa(product.compare_at_fcfa!)}</span>}
      </p>
      {desc && <p className="text-lg text-zinc-700">{desc}</p>}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl justify-center">
          {product.in_stock ? (
            <AddButton big lang={lang} businessId={product.business_id} product={{ id: product.id, name, price: product.price_fcfa, image: product.image_url }} />
          ) : (
            <span className="flex h-14 flex-1 items-center justify-center rounded-full bg-hodos-grey font-bold text-zinc-500">{lang === "fr" ? "Rupture de stock" : "Out of stock"}</span>
          )}
        </div>
      </div>
    </main>
  );
}
