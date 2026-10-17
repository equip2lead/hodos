import Link from "next/link";
import { getLang } from "@/lib/i18n";
import { getCourses } from "@/lib/data";
import { CourseCard } from "@/components/course-card";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const lang = await getLang();
  const fr = lang === "fr";
  const courses = await getCourses();
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-32 pt-4">
      <Link href="/" aria-label="←" className="flex h-12 w-12 items-center justify-center rounded-full bg-hodos-grey text-xl">←</Link>
      <div>
        <h1 className="font-display text-4xl font-extrabold">{fr ? "Formations" : "Courses"}</h1>
        <p className="text-zinc-500">{fr ? "Apprenez un savoir-faire près de chez vous. Inscription en 1 minute, paiement Mobile Money." : "Learn a skill near you. Sign up in 1 minute, pay with Mobile Money."}</p>
      </div>
      {courses.length === 0 ? (
        <p className="rounded-2xl bg-hodos-grey p-6 text-center text-zinc-600">{fr ? "Les premières formations arrivent bientôt." : "The first courses are coming soon."}</p>
      ) : (
        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c.id} course={c} lang={lang} />)}
        </div>
      )}
      <section className="rounded-[28px] bg-hodos-grey p-6">
        <h2 className="text-xl font-bold">{fr ? "Vous êtes formateur ?" : "Are you a trainer?"}</h2>
        <p className="text-zinc-600">{fr ? "Proposez votre formation sur Hodos : informatique, couture, cuisine, langues, business…" : "Offer your course on Hodos: IT, sewing, cooking, languages, business…"}</p>
        <Link href="/login?next=/business" className="mt-3 inline-flex h-12 items-center rounded-full bg-hodos-red px-5 font-bold text-white">{fr ? "Proposer une formation" : "Offer a course"}</Link>
      </section>
    </main>
  );
}
