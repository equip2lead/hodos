import { cookies } from "next/headers";
import type { Lang } from "./dict";

export { dict, fcfa } from "./dict";
export type { Lang, Dict } from "./dict";

export async function getLang(): Promise<Lang> {
  const c = await cookies();
  return c.get("lang")?.value === "en" ? "en" : "fr";
}

export type SavedAddress = { label: string; lat: number; lng: number; detail?: string };

// The visitor's chosen delivery address (set on /address, stored in a cookie).
export async function getAddress(): Promise<SavedAddress | null> {
  const raw = (await cookies()).get("hodos_addr")?.value;
  if (!raw) return null;
  try {
    const a = JSON.parse(decodeURIComponent(raw));
    if (typeof a?.label === "string" && typeof a?.lat === "number" && typeof a?.lng === "number") return a;
  } catch {}
  return null;
}

export async function addressSkipped() {
  return (await cookies()).get("hodos_addr_skip")?.value === "1";
}
