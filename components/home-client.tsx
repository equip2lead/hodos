"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { dict, type Lang } from "@/lib/dict";

// "Select your delivery address" card shown until the visitor picks or skips.
export function AddressPrompt({ lang }: { lang: Lang }) {
  const [hidden, setHidden] = useState(false);
  const t = dict[lang];
  if (hidden) return null;
  return (
    <section className="rounded-[28px] bg-white p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <h2 className="text-xl font-bold">{t.addrTitle}</h2>
      <p className="mt-1 text-zinc-500">{t.addrSub}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            document.cookie = "hodos_addr_skip=1; path=/; max-age=86400; samesite=lax";
            setHidden(true);
          }}
          className="h-14 rounded-full bg-hodos-grey text-base font-bold sm:text-lg"
        >
          {t.skip}
        </button>
        <Link href="/address" className="flex h-14 items-center justify-center rounded-full bg-hodos-red px-2 text-base font-bold text-white sm:text-lg">
          {t.selectAddress}
        </Link>
      </div>
    </section>
  );
}

type Banner = { title: string; sub: string; cta: string; href: string; img: string; bg: string; fg: string; ctaBg: string; ctaFg: string; full?: boolean };

export function Banners({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const banners: Banner[] = [
    { title: t.banner1, sub: t.banner1Sub, cta: t.banner1Cta, href: "/shop", img: "/img/products/youghazi-duo.jpg", bg: "#1B1112", fg: "#FFFFFF", ctaBg: "#D3121F", ctaFg: "#FFFFFF", full: true },
    { title: t.banner5, sub: t.banner5Sub, cta: t.banner5Cta, href: "/courses", img: "/img/cat/libraries.jpg", bg: "#1B1112", fg: "#FFFFFF", ctaBg: "#D3121F", ctaFg: "#FFFFFF" },
    { title: t.banner2, sub: t.banner2Sub, cta: t.banner1Cta, href: "/c/pharmacy", img: "/img/cat/pharmacy.jpg", bg: "#D3121F", fg: "#FFFFFF", ctaBg: "#FFFFFF", ctaFg: "#D3121F" },
    { title: t.banner3, sub: t.banner3Sub, cta: t.banner1Cta, href: "/c/groceries", img: "/img/cat/groceries.jpg", bg: "#FFF4E6", fg: "#1B1112", ctaBg: "#D3121F", ctaFg: "#FFFFFF" },
    { title: t.banner4, sub: t.banner4Sub, cta: t.discoverCta, href: "/c/churches", img: "/img/cat/churches.jpg", bg: "#9E0B14", fg: "#FFFFFF", ctaBg: "#FFFFFF", ctaFg: "#D3121F" },
  ];
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const el = track.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  return (
    <section aria-roledescription="carousel" className="relative">
      <div
        ref={track}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-[28px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((b) => (
          <Link key={b.href} href={b.href} className="relative flex aspect-[16/10] w-full shrink-0 snap-center overflow-hidden sm:aspect-[21/8]" style={{ background: b.bg, color: b.fg }}>
            {b.full ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
              </>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.img} alt="" className="absolute bottom-0 right-0 h-full w-1/2 object-cover [mask-image:linear-gradient(to_right,transparent,black_35%)]" />
            )}
            <span className="relative z-10 flex max-w-[64%] flex-col justify-center gap-2 p-5 sm:max-w-[55%] sm:p-10">
              <span className="font-display text-[22px] font-extrabold leading-[1.1] sm:text-4xl">{b.title}</span>
              <span className="line-clamp-2 text-sm opacity-90 sm:text-base">{b.sub}</span>
              <span className="mt-1 w-fit rounded-full px-5 py-2.5 text-sm font-bold" style={{ background: b.ctaBg, color: b.ctaFg }}>{b.cta}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {banners.map((b, k) => (
          <span key={b.href} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
        ))}
      </div>
    </section>
  );
}
