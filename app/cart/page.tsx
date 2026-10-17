import { getLang } from "@/lib/i18n";
import Checkout from "./checkout";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  return <Checkout lang={await getLang()} />;
}
