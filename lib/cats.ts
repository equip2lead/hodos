// Same list as hodos.categories (seeded in the database). Kept here too so the
// menus render instantly and never depend on a database round-trip.
export type Kind = "order" | "book" | "list";
export type Cat = { slug: string; kind: Kind; en: string; fr: string };

export const CATS: Cat[] = [
  { slug: "restaurants", kind: "order", en: "Restaurants", fr: "Restaurants" },
  { slug: "groceries", kind: "order", en: "Groceries", fr: "Courses" },
  { slug: "pharmacy", kind: "order", en: "Pharmacy", fr: "Pharmacie" },
  { slug: "bakeries", kind: "order", en: "Bakeries", fr: "Boulangeries" },
  { slug: "gas", kind: "order", en: "Gas bottles", fr: "Gaz" },
  { slug: "water", kind: "order", en: "Drinking water", fr: "Eau minérale" },
  { slug: "bookshops", kind: "order", en: "Bookshops", fr: "Librairies" },
  { slug: "beauty", kind: "order", en: "Beauty", fr: "Beauté" },
  { slug: "electronics", kind: "order", en: "Electronics", fr: "Électronique" },
  { slug: "fashion", kind: "order", en: "Fashion", fr: "Mode" },
  { slug: "gifts", kind: "order", en: "Gifts & Flowers", fr: "Cadeaux & Fleurs" },
  { slug: "send", kind: "order", en: "Hodos Send", fr: "Hodos Send" },
  { slug: "print", kind: "book", en: "Print & copy", fr: "Impression & photocopie" },
  { slug: "photo-studio", kind: "book", en: "Photo studios", fr: "Studios photo" },
  { slug: "music-studio", kind: "book", en: "Music studios", fr: "Studios de musique" },
  { slug: "tailors", kind: "book", en: "Tailors", fr: "Couturiers" },
  { slug: "salons", kind: "book", en: "Salons & barbers", fr: "Salons & coiffeurs" },
  { slug: "laundry", kind: "book", en: "Laundry", fr: "Pressing" },
  { slug: "repairs", kind: "book", en: "Repairs", fr: "Réparations" },
  { slug: "garages", kind: "book", en: "Garages", fr: "Garages" },
  { slug: "events", kind: "book", en: "Event halls & catering", fr: "Salles & traiteurs" },
  { slug: "rentals", kind: "book", en: "Tents, chairs & sound", fr: "Bâches, chaises & sono" },
  { slug: "churches", kind: "list", en: "Churches", fr: "Églises" },
  { slug: "on-duty-pharmacies", kind: "list", en: "On-duty pharmacies", fr: "Pharmacies de garde" },
  { slug: "hospitals", kind: "list", en: "Hospitals & clinics", fr: "Hôpitaux & cliniques" },
  { slug: "libraries", kind: "list", en: "Libraries & documentation", fr: "Bibliothèques & centres de doc" },
  { slug: "schools", kind: "list", en: "Schools & universities", fr: "Écoles & universités" },
  { slug: "cinemas", kind: "list", en: "Cinemas", fr: "Cinémas" },
  { slug: "hotels", kind: "list", en: "Hotels", fr: "Hôtels" },
  { slug: "banks", kind: "list", en: "Banks & MoMo agents", fr: "Banques & agents MoMo" },
  { slug: "petrol", kind: "list", en: "Petrol stations", fr: "Stations-service" },
  { slug: "gyms", kind: "list", en: "Gyms", fr: "Salles de sport" },
  { slug: "town-halls", kind: "list", en: "Town halls & offices", fr: "Mairies & administrations" },
];

export const catImg = (slug: string) => `/img/cat/${slug}.jpg`;
export const catBySlug = (slug: string) => CATS.find((c) => c.slug === slug);
export const catName = (c: Cat, lang: "fr" | "en") => (lang === "fr" ? c.fr : c.en);
