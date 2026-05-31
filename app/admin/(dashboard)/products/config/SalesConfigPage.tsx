import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { SalesConfigInitializer } from "./SalesConfigInitializer";
import SalesConfig from "./SalesConfig";
import type { EcommerceConfig } from "@/data";

export default async function SalesConfigPage() {
  return (
    <AdminServerLoader<[EcommerceConfig | null]>
      requests={[{ url: "/api/admin/ecommerce-config" }]}
      onSuccess={SalesConfigInitializer}
    >
      <SalesConfig />
    </AdminServerLoader>
  );
}
