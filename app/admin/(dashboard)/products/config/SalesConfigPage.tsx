import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { SalesConfigInitializer } from "./SalesConfigInitializer";
import SalesConfig from "./SalesConfig";
import type { EcommerceConfig } from "@/data";

type WrappedConfig = { data: EcommerceConfig } | null;

export default async function SalesConfigPage() {
  return (
    <AdminServerLoader<[WrappedConfig]>
      requests={[{ url: "/api/admin/ecommerce-config" }]}
      onSuccess={SalesConfigInitializer}
    >
      <SalesConfig />
    </AdminServerLoader>
  );
}
