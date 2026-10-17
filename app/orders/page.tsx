"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Orders placed from this phone (kept on the device; no account needed).
export default function MyOrders() {
  const [codes, setCodes] = useState<string[] | null>(null);
  const [fr, setFr] = useState(true);
  useEffect(() => {
    setFr(!document.cookie.includes("lang=en"));
    try { setCodes(JSON.parse(localStorage.getItem("hodos_orders") || "[]")); } catch { setCodes([]); }
  }, []);
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-6">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="←" className="flex h-12 w-12 items-center justify-center rounded-full bg-hodos-grey text-xl">←</Link>
        <h1 className="font-display text-3xl font-extrabold">{fr ? "Mes commandes" : "My orders"}</h1>
      </div>
      {codes && codes.length === 0 && <p className="text-zinc-500">{fr ? "Aucune commande sur ce téléphone." : "No orders on this phone yet."}</p>}
      {codes?.map((c) => (
        <Link key={c} href={`/order/${c}`} className="flex h-16 items-center justify-between rounded-2xl bg-hodos-grey px-5 text-lg font-bold">
          {c}<span className="text-zinc-400">›</span>
        </Link>
      ))}
    </main>
  );
}
