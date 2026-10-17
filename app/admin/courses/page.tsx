import { requireAdmin } from "@/lib/admin";
import { fcfa } from "@/lib/dict";
import { saveCourse, setEnrollmentStatus } from "../actions";
import { AdminNav } from "../nav";

export const dynamic = "force-dynamic";

type C = { id: string; slug: string; title_fr: string; title_en: string; summary_fr: string | null; trainer: string | null; format: string; location: string | null; price_fcfa: number; starts_on: string | null; schedule_fr: string | null; seats: number | null; is_published: boolean };
type E = { id: string; code: string; course_id: string; name: string; phone: string; email: string | null; payment: string; amount_fcfa: number; status: string; created_at: string };

const field = "h-12 rounded-xl border border-zinc-300 px-3";
const STATUS: Record<string, string> = { pending: "À confirmer", confirmed: "Confirmée", paid: "Payée", cancelled: "Annulée" };
const PAY: Record<string, string> = { momo: "MTN MoMo", orange_money: "Orange Money", cash: "Espèces" };

function CourseForm({ c }: { c?: C }) {
  return (
    <form action={saveCourse} className="grid gap-3 sm:grid-cols-2">
      {c && <input type="hidden" name="id" value={c.id} />}
      <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">Titre (français) *<input name="title_fr" required defaultValue={c?.title_fr} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">Titre (anglais)<input name="title_en" defaultValue={c?.title_en} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">Description<textarea name="summary_fr" rows={3} defaultValue={c?.summary_fr ?? ""} className="rounded-xl border border-zinc-300 p-3" /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Formateur<input name="trainer" defaultValue={c?.trainer ?? ""} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Format
        <select name="format" defaultValue={c?.format ?? "presentiel"} className={field}>
          <option value="presentiel">En présentiel</option><option value="en_ligne">En ligne</option><option value="hybride">Présentiel + en ligne</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">Lieu<input name="location" defaultValue={c?.location ?? ""} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Prix FCFA<input name="price" inputMode="numeric" defaultValue={c?.price_fcfa ?? 0} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Nombre de places<input name="seats" inputMode="numeric" defaultValue={c?.seats ?? ""} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Date de début<input name="starts_on" type="date" defaultValue={c?.starts_on ?? ""} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Horaires (ex. 3 samedis, 9 h – 13 h)<input name="schedule_fr" defaultValue={c?.schedule_fr ?? ""} className={field} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Image (facultatif)<input name="photo" type="file" accept="image/*" className="py-2" /></label>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="is_published" defaultChecked={c ? c.is_published : true} className="h-5 w-5" /> Visible sur le site</label>
      <button className="h-12 rounded-xl bg-hodos-red font-bold text-white sm:col-span-2">{c ? "Enregistrer" : "Ajouter la formation"}</button>
    </form>
  );
}

export default async function AdminCourses() {
  const { supabase } = await requireAdmin("/admin/courses");
  const [{ data: cs, error }, { data: es }] = await Promise.all([
    supabase.from("courses").select("id, slug, title_fr, title_en, summary_fr, trainer, format, location, price_fcfa, starts_on, schedule_fr, seats, is_published").order("sort"),
    supabase.from("enrollments").select("id, code, course_id, name, phone, email, payment, amount_fcfa, status, created_at").order("created_at", { ascending: false }).limit(500),
  ]);
  const courses = (cs ?? []) as C[];
  const enrollments = (es ?? []) as E[];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">Formations</h1>
      <AdminNav on="courses" />
      {error && <p className="rounded-2xl bg-hodos-blush p-4">Les formations ne sont pas encore dans la base de données. Lancez la mise à jour « hodos_courses ».</p>}

      {courses.map((c) => {
        const list = enrollments.filter((e) => e.course_id === c.id);
        const active = list.filter((e) => e.status !== "cancelled").length;
        const paid = list.filter((e) => e.status === "paid").reduce((s, e) => s + e.amount_fcfa, 0);
        return (
          <section key={c.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold">{c.title_fr}</h2>
              <span className="text-zinc-500">{active}{c.seats ? ` / ${c.seats}` : ""} inscrits · {fcfa(paid)} encaissés {c.is_published ? "" : "· masquée"}</span>
            </div>
            {list.length > 0 && (
              <ul className="flex flex-col divide-y divide-zinc-100">
                {list.map((e) => {
                  const wa = e.phone.replace(/[^\d]/g, "").replace(/^(6\d{8})$/, "237$1");
                  return (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <span>
                        <b>{e.name}</b> · <a className="font-bold text-hodos-red" href={`tel:${e.phone}`}>{e.phone}</a> · <a className="font-bold text-green-700" href={`https://wa.me/${wa}`}>WhatsApp</a>
                        <span className="block text-sm text-zinc-500">{e.code} · {PAY[e.payment]} · {fcfa(e.amount_fcfa)}</span>
                      </span>
                      <form action={setEnrollmentStatus} className="flex gap-2">
                        <input type="hidden" name="id" value={e.id} />
                        <select name="status" defaultValue={e.status} className="h-11 rounded-xl border border-zinc-300 px-2">
                          {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        <button className="h-11 rounded-xl bg-hodos-ink px-3 font-bold text-white">OK</button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
            <details>
              <summary className="cursor-pointer font-bold text-hodos-red">Modifier la formation</summary>
              <div className="mt-3"><CourseForm c={c} /></div>
            </details>
          </section>
        );
      })}

      <section className="rounded-2xl border-2 border-hodos-red p-4">
        <h2 className="mb-3 text-xl font-bold">Nouvelle formation</h2>
        <CourseForm />
      </section>
    </main>
  );
}
