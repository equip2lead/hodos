"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const ORDER_STATUSES = ["sent", "accepted", "preparing", "ready", "on_the_way", "delivered", "declined", "cancelled"];

function int(v: FormDataEntryValue | null) {
  const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

async function uploadPhoto(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) throw new Error("Photo: image de moins de 5 Mo");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("hodos-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("hodos-media").getPublicUrl(path).data.publicUrl;
}

export async function saveProduct(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/products");
  const id = String(formData.get("id") || "");
  const name_fr = String(formData.get("name_fr") || "").trim();
  const price = int(formData.get("price"));
  if (!name_fr || price === null) return;
  const row: Record<string, unknown> = {
    name_fr,
    name_en: String(formData.get("name_en") || "").trim() || name_fr,
    section: String(formData.get("section") || "").trim() || null,
    price_fcfa: price,
    compare_at_fcfa: int(formData.get("compare_at")),
    description_fr: String(formData.get("description_fr") || "").trim() || null,
    in_stock: formData.get("in_stock") === "on",
  };
  const photo = await uploadPhoto(supabase, formData.get("photo"));
  if (photo) row.image_url = photo;
  if (id) {
    await supabase.from("products").update(row).eq("id", id);
  } else {
    const { data: shop } = await supabase.from("businesses").select("id").eq("slug", "hodos-shop").single();
    await supabase.from("products").insert({ ...row, business_id: shop!.id, featured: true });
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/products");
  await supabase.from("products").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/products");
}

export async function setOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/orders");
  const status = String(formData.get("status"));
  if (!ORDER_STATUSES.includes(status)) return;
  await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/orders");
}

export async function saveStation(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/products");
  await supabase.from("businesses").update({
    address: String(formData.get("address") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    whatsapp: String(formData.get("whatsapp") || "").trim() || null,
    delivery_fee_fcfa: int(formData.get("fee")) ?? 0,
  }).eq("slug", "hodos-shop");
  revalidatePath("/admin/products");
}

const ENROLL_STATUSES = ["pending", "confirmed", "paid", "cancelled"];
const FORMATS = ["presentiel", "en_ligne", "hybride"];

export async function saveCourse(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/courses");
  const id = String(formData.get("id") || "");
  const title_fr = String(formData.get("title_fr") || "").trim();
  if (!title_fr) return;
  const format = String(formData.get("format"));
  const row: Record<string, unknown> = {
    title_fr,
    title_en: String(formData.get("title_en") || "").trim() || title_fr,
    summary_fr: String(formData.get("summary_fr") || "").trim() || null,
    trainer: String(formData.get("trainer") || "").trim() || null,
    format: FORMATS.includes(format) ? format : "presentiel",
    location: String(formData.get("location") || "").trim() || null,
    price_fcfa: int(formData.get("price")) ?? 0,
    starts_on: String(formData.get("starts_on") || "") || null,
    schedule_fr: String(formData.get("schedule_fr") || "").trim() || null,
    seats: int(formData.get("seats")) || null,
    is_published: formData.get("is_published") === "on",
  };
  const photo = await uploadPhoto(supabase, formData.get("photo"));
  if (photo) row.image_url = photo;
  if (id) {
    await supabase.from("courses").update(row).eq("id", id);
  } else {
    const slug = title_fr.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) + "-" + Math.random().toString(36).slice(2, 6);
    await supabase.from("courses").insert({ ...row, slug, sort: 50 });
  }
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function setEnrollmentStatus(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/courses");
  const status = String(formData.get("status"));
  if (!ENROLL_STATUSES.includes(status)) return;
  await supabase.from("enrollments").update({ status }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/courses");
}
