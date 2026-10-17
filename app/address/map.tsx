"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Map as LMap } from "leaflet";
import type { Lang } from "@/lib/dict";

const YAOUNDE: [number, number] = [3.848, 11.5021];

const T = {
  fr: { title: "Où livrer ?", sub: "Déplacez la carte pour placer l'épingle sur votre porte", search: "Rechercher un quartier, une rue…", confirm: "Confirmer l'adresse", detail: "Repère (ex. : portail bleu, après la boulangerie)", locating: "Recherche de votre position…", denied: "Position refusée. Déplacez la carte à la main.", back: "Retour", me: "Ma position" },
  en: { title: "Where to deliver?", sub: "Move the map to put the pin on your door", search: "Search a neighbourhood or street…", confirm: "Confirm address", detail: "Landmark (e.g. blue gate, after the bakery)", locating: "Finding your location…", denied: "Location blocked. Move the map by hand.", back: "Back", me: "My location" },
};

type Hit = { display_name: string; lat: string; lon: string };

// Short, human label from a Nominatim result: "Bastos, Yaoundé".
function shortLabel(a: Record<string, string> | undefined, fallback: string) {
  if (!a) return fallback;
  const place = a.suburb || a.neighbourhood || a.quarter || a.road || a.village || a.city_district;
  const city = a.city || a.town || a.county || "Yaoundé";
  return place ? `${place}, ${city}` : city;
}

export default function AddressMap({ lang }: { lang: Lang }) {
  const t = T[lang];
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const [label, setLabel] = useState("Yaoundé");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [detail, setDetail] = useState("");
  const [note, setNote] = useState("");
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    import("leaflet").then((L) => {
      if (!alive || !box.current || map.current) return;
      let start = YAOUNDE;
      try {
        const saved = JSON.parse(decodeURIComponent(document.cookie.match(/hodos_addr=([^;]+)/)?.[1] || "null"));
        if (saved?.lat) { start = [saved.lat, saved.lng]; setDetail(saved.detail || ""); }
      } catch {}
      const m = L.map(box.current, { zoomControl: false, attributionControl: true }).setView(start, 16);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
      L.control.zoom({ position: "bottomright" }).addTo(m);
      map.current = m;
      const lookup = () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          const c = m.getCenter();
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&accept-language=${lang}&lat=${c.lat}&lon=${c.lng}`);
            const j = await r.json();
            if (alive) setLabel(shortLabel(j.address, "Yaoundé"));
          } catch {}
        }, 500);
      };
      m.on("movestart", () => setMoving(true));
      m.on("moveend", () => { setMoving(false); lookup(); });
      lookup();
    });
    return () => { alive = false; clearTimeout(timer); map.current?.remove(); map.current = null; };
  }, [lang]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=cm&viewbox=11.40,3.98,11.62,3.75&accept-language=${lang}&q=${encodeURIComponent(q)}`);
      setHits(await r.json());
    } catch { setHits([]); }
  }

  function locate() {
    setNote(t.locating);
    navigator.geolocation?.getCurrentPosition(
      (p) => { setNote(""); map.current?.setView([p.coords.latitude, p.coords.longitude], 17); },
      () => setNote(t.denied),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function confirm() {
    const c = map.current?.getCenter();
    if (!c) return;
    const value = encodeURIComponent(JSON.stringify({ label, lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6), detail: detail.trim() }));
    document.cookie = `hodos_addr=${value}; path=/; max-age=31536000; samesite=lax`;
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
    router.refresh();
  }

  return (
    <main className="fixed inset-0 flex flex-col bg-white">
      <div className="relative flex-1">
        <div ref={box} className="absolute inset-0 z-0" />
        {/* Fixed centre pin: the map moves under it */}
        <div className={`pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full transition-transform ${moving ? "-mt-3" : ""}`}>
          <svg viewBox="0 0 40 56" className="h-14 w-10 drop-shadow-lg" aria-hidden="true">
            <circle cx="20" cy="18" r="17" fill="#1B1112" /><circle cx="20" cy="18" r="6" fill="#fff" /><rect x="18" y="32" width="4" height="22" rx="2" fill="#1B1112" />
          </svg>
        </div>
        <button onClick={() => router.back()} aria-label={t.back} className="absolute left-4 top-[max(16px,env(safe-area-inset-top))] z-[600] flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-lg">←</button>
        <button onClick={locate} aria-label={t.me} className="absolute bottom-28 right-3 z-[600] flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M21 3 3 10.5l7.5 3L14 21l7-18Z" /></svg>
        </button>
      </div>
      <div className="z-[700] -mt-8 flex flex-col gap-3 rounded-t-[32px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-zinc-500">{t.sub}</p>
        </div>
        <form onSubmit={search} className="relative">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="h-14 w-full rounded-full bg-hodos-grey px-5 text-lg outline-none" />
          {hits.length > 0 && (
            <ul className="absolute bottom-full left-0 right-0 mb-2 max-h-64 overflow-auto rounded-3xl bg-white p-2 shadow-xl">
              {hits.map((h) => (
                <li key={h.lat + h.lon}>
                  <button type="button" onClick={() => { map.current?.setView([+h.lat, +h.lon], 17); setHits([]); setQ(""); }} className="w-full rounded-2xl px-4 py-3 text-left hover:bg-hodos-grey">
                    {h.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
        <p className="flex items-center gap-2 text-lg font-bold">
          <span className="h-3 w-3 shrink-0 rounded-full bg-hodos-red" />
          <span className="truncate">{label}</span>
        </p>
        <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={t.detail} className="h-14 rounded-2xl border-[1.5px] border-zinc-200 px-4 text-base outline-none" />
        {note && <p className="text-sm text-zinc-500">{note}</p>}
        <button onClick={confirm} className="h-16 rounded-full bg-hodos-red text-xl font-bold text-white">{t.confirm}</button>
      </div>
    </main>
  );
}
