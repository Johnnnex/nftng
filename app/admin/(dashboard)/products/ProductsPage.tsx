import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { ProductsInitializer } from "./ProductsInitializer";
import Products from "./Products";
import type { ProductRecord, PaginationMeta } from "@/data";

type Paged<T> = { data: T[]; meta: PaginationMeta } | null;

export default async function ProductsPage() {
  return (
    <AdminServerLoader<[Paged<ProductRecord>]>
      requests={[{ url: "/api/admin/products?page=1&limit=50" }]}
      onSuccess={ProductsInitializer}
    >
      <Products />
    </AdminServerLoader>
  );
}
