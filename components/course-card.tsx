import Link from "next/link";
import { fcfa, type Lang } from "@/lib/dict";
import type { Course } from "@/lib/data";
import { HMark } from "./ui";

export const FORMAT = {
  fr: { presentiel: "En présentiel", en_ligne: "En ligne", hybride: "Présentiel + en ligne" },
  en: { presentiel: "In person", en_ligne: "Online", hybride: "In person + online" },
};

export function courseDate(c: Course, lang: Lang) {
  if (c.starts_on) return new Date(c.starts_on + "T12:00:00").toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { weekday: "short", day: "numeric", month: "long" });
  return (lang === "fr" ? c.schedule_fr : c.schedule_en) ?? "";
}

// Poster-style cover: course colour, big title, red H watermark. Uses a photo when one is set.
export function CourseCover({ course, lang, big }: { course: Course; lang: Lang; big?: boolean }) {
  const title = lang === "fr" ? course.title_fr : course.title_en;
  const short = title.split(/[:—]/)[0].trim();
  return (
    <span className="relative flex aspect-[4/3] w-full overflow-hidden rounded-[28px] text-white" style={{ background: course.color }}>
      {course.image_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        </>
      ) : (
        <HMark className="absolute -bottom-6 -right-6 h-40 w-40 text-white/10" />
      )}
      <span className="relative mt-auto flex flex-col gap-1 p-5">
        <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">{course.trainer ?? "Hodos"}</span>
        <span className={`font-display font-extrabold leading-[1.05] ${big ? "text-4xl" : "text-2xl"}`}>{short}</span>
      </span>
    </span>
  );
}

export function CourseCard({ course, lang }: { course: Course; lang: Lang }) {
  const title = lang === "fr" ? course.title_fr : course.title_en;
  return (
    <Link href={`/courses/${course.slug}`} className="flex flex-col gap-2">
      <CourseCover course={course} lang={lang} />
      <span className="px-1 text-lg font-bold leading-snug">{title}</span>
      <span className="px-1 text-zinc-500">{[courseDate(course, lang), FORMAT[lang][course.format]].filter(Boolean).join(" · ")}</span>
      <span className="px-1 text-xl font-bold text-hodos-red">{course.price_fcfa ? fcfa(course.price_fcfa) : lang === "fr" ? "Gratuit" : "Free"}</span>
    </Link>
  );
}
