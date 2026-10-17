import { requireAdmin } from "@/lib/admin";
import { fcfa } from "@/lib/dict";
import { deleteProduct, saveProduct, saveStation } from "../actions";
import { AdminNav } from "../nav";

export const dynamic = "force-dynamic";

type P = { id: string; name_fr: string; name_en: string; section: string | null; price_fcfa: number; compare_at_fcfa: number | null; image_url: string | null; in_stock: boolean; description_fr: string | null };

const field = "h-12 rounded-xl border border-zinc-300 px-3";

function ProductForm({ p }: { p?: P }) {
  return (
    <form action={saveProduct} className="grid gap-3 sm:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <label className="flex flex-col gap-1 text-sm font-bold">Nom (français) *<input name="name_fr" required defaultValue={p?.name_fr} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Nom (anglais)<input name="name_en" defaultValue={p?.name_en} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Prix FCFA *<input name="price" required inputMode="numeric" defaultValue={p?.price_fcfa} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Ancien prix (promo)<input name="compare_at" inputMode="numeric" defaultValue={p?.compare_at_fcfa ?? ""} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Rayon (ex. Parfum, Savon, Entretien)<input name="section" defaultValue={p?.section ?? ""} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Photo (fond blanc de préférence)<input name="photo" type="file" accept="image/*" className="py-2" /></label>
      <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">Description<textarea name="description_fr" defaultValue={p?.description_fr ?? ""} rows={2} className="rounded-xl border border-zinc-300 p-3" /></label>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="in_stock" defaultChecked={p ? p.in_stock : true} className="h-5 w-5" /> En stock</label>
      <button className="h-12 rounded-xl bg-hodos-red font-bold text-white">{p ? "Enregistrer" : "Ajouter le produit"}</button>
    </form>
  );
}

export default async function AdminProducts() {
  const { supabase } = await requireAdmin("/admin/products");
  const { data: shop } = await supabase.from("businesses").select("id, address, phone, whatsapp, delivery_fee_fcfa").eq("slug", "hodos-shop").maybeSingle();
  const { data } = shop
    ? await supabase.from("products").select("id, name_fr, name_en, section, price_fcfa, compare_at_fcfa, image_url, in_stock, description_fr").eq("business_id", shop.id).order("sort").order("created_at")
    : { data: [] };
  const products = (data ?? []) as P[];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">Produits Hodos</h1>
      <AdminNav on="products" />

      {!shop ? (
        <p className="rounded-2xl bg-hodos-blush p-4">La Boutique Hodos n&apos;existe pas encore dans la base de données. Lancez la mise à jour « hodos_shop ».</p>
      ) : (
        <>
          <section className="rounded-2xl border border-zinc-200 p-4">
            <h2 className="mb-3 text-xl font-bold">Station Hodos (retrait) et livraison</h2>
            <form action={saveStation} className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">Adresse de la station<input name="address" defaultValue={shop.address ?? ""} className={field} /></label>
              <label className="flex flex-col gap-1 text-sm font-bold">Téléphone<input name="phone" defaultValue={shop.phone ?? ""} className={field} /></label>
              <label className="flex flex-col gap-1 text-sm font-bold">WhatsApp<input name="whatsapp" defaultValue={shop.whatsapp ?? ""} className={field} /></label>
              <label className="flex flex-col gap-1 text-sm font-bold">Frais de livraison FCFA<input name="fee" inputMode="numeric" defaultValue={shop.delivery_fee_fcfa} className={field} /></label>
              <button className="h-12 self-end rounded-xl bg-hodos-ink font-bold text-white">Enregistrer</button>
            </form>
          </section>

          <section className="rounded-2xl border-2 border-hodos-red p-4">
            <h2 className="mb-3 text-xl font-bold">Nouveau produit</h2>
            <ProductForm />
          </section>

          {products.map((p) => (
            <details key={p.id} className="rounded-2xl border border-zinc-200 p-4">
              <summary className="flex cursor-pointer list-none items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url ? <img src={p.image_url} alt="" className="h-16 w-16 rounded-xl bg-hodos-grey object-contain" /> : <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-hodos-grey text-xs text-zinc-400">Photo ?</span>}
                <span className="flex-1"><b className="block">{p.name_fr}</b><span className="text-zinc-500">{fcfa(p.price_fcfa)}{p.section ? ` · ${p.section}` : ""}{p.in_stock ? "" : " · Rupture"}</span></span>
                <span className="font-bold text-hodos-red">Modifier</span>
              </summary>
              <div className="mt-4 flex flex-col gap-3">
                <ProductForm p={p} />
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="h-12 rounded-xl px-4 font-bold text-hodos-deep">Supprimer ce produit</button>
                </form>
              </div>
            </details>
          ))}
        </>
      )}
    </main>
  );
}
