import { cookies } from "next/headers";

export type Lang = "fr" | "en";

export const dict = {
  en: {
    tagline: "Your way to everything.",
    location: "Yaoundé, Cameroon",
    search: "Search shops, places and products",
    login: "Login",
    order: "Order & get it delivered",
    orderSub: "Shops that take orders on Hodos",
    book: "Book",
    bookSub: "Appointments, sessions and jobs",
    discover: "Discover around you",
    discoverSub: "Find the place: times, contacts, directions",
    notConfigured: "Database not connected yet. Add the Supabase keys in Vercel to load live categories.",
    business: "Own a shop, church or business?",
    businessSub: "Get listed on Hodos for free and let Yaoundé find you.",
    listMine: "List my business",
    switchTo: "FR",
  },
  fr: {
    tagline: "Le chemin vers tout.",
    location: "Yaoundé, Cameroun",
    search: "Rechercher boutiques, lieux et produits",
    login: "Connexion",
    order: "Commandez, on vous livre",
    orderSub: "Boutiques qui prennent les commandes sur Hodos",
    book: "Réserver",
    bookSub: "Rendez-vous, séances et travaux",
    discover: "À découvrir autour de vous",
    discoverSub: "Trouvez le lieu : horaires, contacts, itinéraire",
    notConfigured: "Base de données pas encore connectée. Ajoutez les clés Supabase dans Vercel pour charger les catégories.",
    business: "Vous avez une boutique, une église ou une entreprise ?",
    businessSub: "Inscrivez-vous gratuitement sur Hodos et laissez Yaoundé vous trouver.",
    listMine: "Inscrire mon activité",
    switchTo: "EN",
  },
} as const;

export async function getLang(): Promise<Lang> {
  const c = await cookies();
  return c.get("lang")?.value === "en" ? "en" : "fr";
}
