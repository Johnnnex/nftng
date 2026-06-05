import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { CollectionsInitializer } from "./CollectionsInitializer";
import Collections from "./Collections";
import type { PublicProduct } from "@/data";

type ApiResult = { data: PublicProduct[]; meta: { total: number; page: number; limit: number } } | null;

export default async function CollectionsPage() {
  return (
    <AdminServerLoader<[ApiResult]>
      requests={[{ url: "/api/products?page=1" }]}
      onSuccess={CollectionsInitializer}
    >
      <Collections />
    </AdminServerLoader>
  );
}
