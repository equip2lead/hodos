import Link from "next/link";

export function AdminNav({ on }: { on: "home" | "orders" | "products" | "courses" }) {
  const tab = (key: typeof on, href: string, label: string) => (
    <Link href={href} className={`flex h-12 items-center rounded-full px-5 font-bold ${on === key ? "bg-hodos-red text-white" : "bg-hodos-grey"}`}>{label}</Link>
  );
  return (
    <nav className="flex flex-wrap gap-2">
      {tab("home", "/admin", "Tableau de bord")}
      {tab("orders", "/admin/orders", "Commandes")}
      {tab("products", "/admin/products", "Produits Hodos")}
      {tab("courses", "/admin/courses", "Formations")}
      <Link href="/" className="flex h-12 items-center rounded-full px-4 font-bold text-zinc-500">Voir le site ↗</Link>
    </nav>
  );
}
