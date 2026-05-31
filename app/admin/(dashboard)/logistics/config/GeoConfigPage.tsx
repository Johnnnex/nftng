import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { GeoConfigInitializer } from "./GeoConfigInitializer";
import GeoConfig from "./GeoConfig";

export default async function GeoConfigPage() {
  return (
    <AdminServerLoader<[any]>
      requests={[{ url: "/api/admin/delivery/countries" }]}
      onSuccess={GeoConfigInitializer}
    >
      <GeoConfig />
    </AdminServerLoader>
  );
}
