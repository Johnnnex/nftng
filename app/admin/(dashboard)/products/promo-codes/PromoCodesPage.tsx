import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { PromoCodesInitializer } from "./PromoCodesInitializer";
import PromoCodes from "./PromoCodes";
import type { PromoCodeRecord } from "@/data";

export default async function PromoCodesPage() {
  return (
    <AdminServerLoader<[{ data: PromoCodeRecord[]; meta: { total: number; page: number; limit: number } } | null]>
      requests={[{ url: "/api/admin/promo-codes" }]}
      onSuccess={PromoCodesInitializer}
    >
      <PromoCodes />
    </AdminServerLoader>
  );
}
