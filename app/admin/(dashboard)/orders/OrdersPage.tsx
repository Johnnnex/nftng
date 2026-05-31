import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { OrdersInitializer } from "./OrdersInitializer";
import Orders from "./Orders";
import type { OrderRecord, PaginationMeta } from "@/data";

type Paged<T> = { data: T[]; meta: PaginationMeta } | null;

export default async function OrdersPage() {
  return (
    <AdminServerLoader<[Paged<OrderRecord>]>
      requests={[{ url: "/api/admin/orders?page=1&limit=50" }]}
      onSuccess={OrdersInitializer}
    >
      <Orders />
    </AdminServerLoader>
  );
}
