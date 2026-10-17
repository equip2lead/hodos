import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export type Category = { id: number; kind: "order" | "book" | "list"; slug: string; name_en: string; name_fr: string; image_url: string | null };
export type Product = {
  id: string; business_id: string; section: string | null; name_en: string; name_fr: string;
  price_fcfa: number; compare_at_fcfa: number | null; image_url: string | null; in_stock: boolean;
  description_en: string | null; description_fr: string | null;
};
export type Business = { id: string; name: string; slug: string | null; kind: string; quartier: string | null; address: string | null; photo_url: string | null; delivery_fee_fcfa: number; is_hodos: boolean; description: string | null; phone: string | null; whatsapp: string | null };

const PRODUCT_COLS = "id, business_id, section, name_en, name_fr, price_fcfa, compare_at_fcfa, image_url, in_stock, description_en, description_fr";

// Every loader returns an empty result (never throws) so pages still render
// if the database is unreachable or a migration hasn't run yet.
export async function getCategories(): Promise<Category[]> {
  if (!supabaseConfigured()) return [];
  const s = await createClient();
  const { data } = await s.from("categories").select("id, kind, slug, name_en, name_fr, image_url").order("sort");
  return (data ?? []) as Category[];
}

export async function getHodosShop(): Promise<{ shop: Business | null; products: Product[] }> {
  if (!supabaseConfigured()) return { shop: null, products: [] };
  const s = await createClient();
  const { data: shop } = await s.from("businesses").select("*").eq("slug", "hodos-shop").maybeSingle();
  if (!shop) return { shop: null, products: [] };
  const { data } = await s.from("products").select(PRODUCT_COLS).eq("business_id", shop.id).order("sort");
  return { shop: shop as Business, products: (data ?? []) as Product[] };
}

export async function getProduct(id: string): Promise<{ product: Product | null; shop: Business | null }> {
  if (!supabaseConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) return { product: null, shop: null };
  const s = await createClient();
  const { data: product } = await s.from("products").select(PRODUCT_COLS).eq("id", id).maybeSingle();
  if (!product) return { product: null, shop: null };
  const { data: shop } = await s.from("businesses").select("*").eq("id", product.business_id).maybeSingle();
  return { product: product as Product, shop: (shop ?? null) as Business | null };
}

export async function getCategoryWithBusinesses(slug: string) {
  if (!supabaseConfigured()) return { category: null, businesses: [] as Business[] };
  const s = await createClient();
  const { data: category } = await s.from("categories").select("id, kind, slug, name_en, name_fr, image_url").eq("slug", slug).maybeSingle();
  if (!category) return { category: null, businesses: [] as Business[] };
  const { data } = await s.from("businesses").select("*").eq("category_id", category.id).eq("status", "approved").eq("is_hodos", false).order("plan", { ascending: false });
  return { category: category as Category, businesses: (data ?? []) as Business[] };
}

export async function searchProducts(q: string): Promise<Product[]> {
  if (!supabaseConfigured() || !q) return [];
  const s = await createClient();
  const like = `%${q.replace(/[%_,()]/g, " ")}%`;
  const { data } = await s.from("products").select(PRODUCT_COLS).or(`name_fr.ilike.${like},name_en.ilike.${like}`).limit(40);
  return (data ?? []) as Product[];
}

export type Course = {
  id: string; slug: string; title_fr: string; title_en: string; summary_fr: string | null; summary_en: string | null;
  trainer: string | null; format: "presentiel" | "en_ligne" | "hybride"; location: string | null; price_fcfa: number;
  starts_on: string | null; schedule_fr: string | null; schedule_en: string | null; seats: number | null; color: string; image_url: string | null;
};
const COURSE_COLS = "id, slug, title_fr, title_en, summary_fr, summary_en, trainer, format, location, price_fcfa, starts_on, schedule_fr, schedule_en, seats, color, image_url";

export async function getCourses(): Promise<Course[]> {
  if (!supabaseConfigured()) return [];
  const s = await createClient();
  const { data } = await s.from("courses").select(COURSE_COLS).eq("is_published", true).order("sort");
  return (data ?? []) as Course[];
}

export async function getCourse(slug: string): Promise<{ course: Course | null; left: number | null }> {
  if (!supabaseConfigured()) return { course: null, left: null };
  const s = await createClient();
  const { data } = await s.from("courses").select(COURSE_COLS).eq("slug", slug).maybeSingle();
  if (!data) return { course: null, left: null };
  const { data: left } = await s.rpc("seats_left", { p_course: data.id });
  return { course: data as Course, left: (left as number | null) ?? null };
}
