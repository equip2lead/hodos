import Link from "next/link";
import { notFound } from "next/navigation";
import { getLang } from "@/lib/i18n";
import { catBySlug, catImg, catName } from "@/lib/cats";
import { getCategoryWithBusinesses } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = catBySlug(slug);
  if (!cat) notFound();
  const lang = await getLang();
  const fr = lang === "fr";
  const { businesses } = await getCategoryWithBusinesses(slug);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 pb-32">
      <div className="relative h-56 overflow-hidden sm:mx-4 sm:mt-4 sm:rounded-[32px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={catImg(slug)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <Link href="/" aria-label="←" className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl">←</Link>
        <h1 className="absolute bottom-5 left-5 font-display text-4xl font-extrabold text-white">{catName(cat, lang)}</h1>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[28px] bg-hodos-grey p-8 text-center">
            <p className="text-xl font-bold">{fr ? "Bientôt sur Hodos" : "Coming soon to Hodos"}</p>
            <p className="text-zinc-600">
              {fr ? "Nous inscrivons les premières adresses de Yaoundé. Vous en connaissez une ? Inscrivez-la gratuitement." : "We're adding the first places in Yaoundé. Know one? List it for free."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/login?next=/business" className="flex h-14 items-center rounded-full bg-hodos-red px-6 font-bold text-white">{fr ? "Inscrire une activité" : "List a business"}</Link>
              <Link href="/shop" className="flex h-14 items-center rounded-full bg-white px-6 font-bold">{fr ? "Voir la Boutique Hodos" : "See the Hodos Shop"}</Link>
            </div>
          </div>
        ) : (
          businesses.map((b) => (
            <div key={b.id} className="flex items-center gap-4 rounded-[24px] border border-zinc-200 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.photo_url || catImg(slug)} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              <div className="flex-1">
                <p className="text-lg font-bold">{b.name}</p>
                <p className="text-zinc-500">{[b.quartier, b.address].filter(Boolean).join(" · ")}</p>
              </div>
              {b.phone && <a href={`tel:${b.phone}`} className="flex h-12 items-center rounded-full bg-hodos-grey px-4 font-bold">{fr ? "Appeler" : "Call"}</a>}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
