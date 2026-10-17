import Link from "next/link";
import { dict, fcfa, type Lang } from "@/lib/dict";
import type { Product } from "@/lib/data";
import { AddButton, HMark } from "./ui";

export function ProductImage({ product, lang, className = "" }: { product: Product; lang: Lang; className?: string }) {
  if (product.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.image_url} alt="" className={`h-full w-full object-contain p-4 ${className}`} />;
  }
  return (
    <span className={`flex h-full w-full flex-col items-center justify-center gap-2 ${className}`}>
      <HMark className="h-1/3 w-1/3 text-hodos-red/25" />
      <span className="text-xs font-medium text-zinc-400">{dict[lang].noPhoto}</span>
    </span>
  );
}

export function ProductCard({ product, lang }: { product: Product; lang: Lang }) {
  const name = lang === "fr" ? product.name_fr : product.name_en;
  const promo = product.compare_at_fcfa && product.compare_at_fcfa > product.price_fcfa;
  const off = promo ? Math.round((1 - product.price_fcfa / product.compare_at_fcfa!) * 100) : 0;
  return (
    <div className="flex flex-col gap-2">
      <Link href={`/p/${product.id}`} className="relative block aspect-square overflow-hidden rounded-[28px] bg-hodos-grey">
        <ProductImage product={product} lang={lang} />
        <span className="absolute bottom-3 right-3">
          <AddButton lang={lang} businessId={product.business_id} product={{ id: product.id, name, price: product.price_fcfa, image: product.image_url }} />
        </span>
      </Link>
      <Link href={`/p/${product.id}`} className="flex flex-col gap-1 px-1">
        <span className={`text-xl font-bold ${promo ? "text-hodos-red" : ""}`}>{fcfa(product.price_fcfa)}</span>
        {promo && <span className="text-lg font-bold text-zinc-400 line-through">{fcfa(product.compare_at_fcfa!)}</span>}
        <span className="line-clamp-2 text-lg leading-snug">{name}</span>
        {promo && <span className="w-fit rounded-full bg-hodos-blush px-3 py-1 font-bold text-hodos-red">-{off}%</span>}
      </Link>
    </div>
  );
}
