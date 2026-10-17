"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function setLang(formData: FormData) {
  const lang = formData.get("lang") === "en" ? "en" : "fr";
  (await cookies()).set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect(String(formData.get("back") || "/"));
}
