import { getLang } from "@/lib/i18n";
import AddressMap from "./map";

export const dynamic = "force-dynamic";

export default async function AddressPage() {
  return <AddressMap lang={await getLang()} />;
}
