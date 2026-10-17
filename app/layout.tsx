import type { Metadata, Viewport } from "next";
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/bricolage-grotesque/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import { getLang } from "@/lib/i18n";
import { CartProvider } from "@/components/cart";
import { CartBar } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hodos — Le chemin vers tout",
  description: "Boutiques, services et lieux à Yaoundé. Shops, services and places in Yaoundé.",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = { themeColor: "#D3121F" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className="min-h-screen antialiased">
        <CartProvider>
          {children}
          <CartBar lang={lang} />
        </CartProvider>
      </body>
    </html>
  );
}
