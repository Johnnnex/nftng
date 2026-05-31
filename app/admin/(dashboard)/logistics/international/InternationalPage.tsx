import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { InternationalInitializer } from "./InternationalInitializer";
import International from "./International";

export default async function InternationalPage() {
  return (
    <AdminServerLoader<[any]>
      requests={[{ url: "/api/admin/logistics/international?page=1&limit=50" }]}
      onSuccess={InternationalInitializer}
    >
      <International />
    </AdminServerLoader>
  );
}
