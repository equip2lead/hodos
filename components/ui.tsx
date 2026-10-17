"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart";
import { dict, fcfa, type Lang } from "@/lib/dict";

export function HMark({ className = "" }: { className?: string }) {
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

type AddProps = { lang: Lang; businessId: string; product: { id: string; name: string; price: number; image: string | null }; big?: boolean };

// The round "+" on product cards; turns into a − n + stepper once in the cart.
export function AddButton({ lang, businessId, product, big }: AddProps) {
  const { cart, add, setQty } = useCart();
  const inCart = cart.items.find((i) => i.id === product.id);
  const t = dict[lang];
  if (inCart) {
    return (
      <div className={`flex items-center gap-1 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] ${big ? "h-14" : "h-12"}`}>
        <button aria-label="−" onClick={(e) => { e.preventDefault(); setQty(product.id, inCart.qty - 1); }} className="h-full w-11 text-2xl font-bold text-hodos-red">−</button>
        <span className="min-w-5 text-center font-bold">{inCart.qty}</span>
        <button aria-label="+" onClick={(e) => { e.preventDefault(); setQty(product.id, inCart.qty + 1); }} className="h-full w-11 text-2xl font-bold text-hodos-red">+</button>
      </div>
    );
  }
  if (big) {
    return (
      <button onClick={() => add(businessId, product)} className="h-14 flex-1 rounded-full bg-hodos-red text-lg font-bold text-white">
        {t.add} · {fcfa(product.price)}
      </button>
    );
  }
  return (
    <button
      aria-label={`${t.add} ${product.name}`}
      onClick={(e) => { e.preventDefault(); add(businessId, product); }}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl font-light text-hodos-red shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
    >
      +
    </button>
  );
}

// Sticky "View cart" bar at the bottom, like Snoonu's.
export function CartBar({ lang }: { lang: Lang }) {
  const { count, subtotal, ready } = useCart();
  const path = usePathname();
  if (!ready || count === 0 || path.startsWith("/cart") || path.startsWith("/order") || path.startsWith("/address") || path.startsWith("/admin")) return null;
  const t = dict[lang];
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <Link href="/cart" className="mx-auto flex h-16 max-w-xl items-center justify-between rounded-full bg-hodos-red px-6 text-white shadow-[0_10px_30px_rgba(211,18,31,0.35)]">
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 font-bold text-hodos-red">{count}</span>
        <span className="text-lg font-bold">{t.viewCart}</span>
        <span className="font-bold">{fcfa(subtotal)}</span>
      </Link>
    </div>
  );
}
