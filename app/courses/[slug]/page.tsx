import Link from "next/link";
import { notFound } from "next/navigation";
import { fcfa, getLang } from "@/lib/i18n";
import { getCourse } from "@/lib/data";
import { CourseCover, FORMAT, courseDate } from "@/components/course-card";
import Enroll from "./enroll";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const fr = lang === "fr";
  const { course, left } = await getCourse(slug);
  if (!course) notFound();
  const summary = fr ? course.summary_fr : course.summary_en;

  const row = (label: string, value: string | null | undefined) =>
    value ? (
      <div className="flex justify-between gap-4 border-b border-zinc-100 py-3">
        <dt className="text-zinc-500">{label}</dt>
        <dd className="text-right font-bold">{value}</dd>
      </div>
    ) : null;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 pb-16 pt-4">
      <Link href="/courses" aria-label="←" className="flex h-12 w-12 items-center justify-center rounded-full bg-hodos-grey text-xl">←</Link>
      <CourseCover course={course} lang={lang} big />
      <h1 className="font-display text-3xl font-extrabold leading-tight">{fr ? course.title_fr : course.title_en}</h1>
      {summary && <p className="text-lg text-zinc-700">{summary}</p>}
      <dl>
        {row(fr ? "Prix" : "Price", course.price_fcfa ? fcfa(course.price_fcfa) : fr ? "Gratuit" : "Free")}
        {row(fr ? "Quand" : "When", courseDate(course, lang))}
        {row(fr ? "Format" : "Format", FORMAT[lang][course.format])}
        {row(fr ? "Lieu" : "Where", course.location)}
        {row(fr ? "Formateur" : "Trainer", course.trainer)}
        {row(fr ? "Places restantes" : "Seats left", left === null ? null : String(left))}
      </dl>
      {left === 0 ? (
        <p className="rounded-2xl bg-hodos-blush p-4 text-center font-bold text-hodos-deep">{fr ? "Complet. Revenez pour la prochaine session." : "Full. Check back for the next session."}</p>
      ) : (
        <Enroll lang={lang} courseId={course.id} price={course.price_fcfa} />
      )}
    </main>
  );
}
