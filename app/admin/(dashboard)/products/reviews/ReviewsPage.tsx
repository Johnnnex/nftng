import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { ReviewsInitializer } from "./ReviewsInitializer";
import Reviews from "./Reviews";
import type { ReviewRecord, PaginationMeta } from "@/data";

type ReviewsPage = { data: ReviewRecord[]; meta: PaginationMeta };

export default async function ReviewsPage() {
  return (
    <AdminServerLoader<[ReviewsPage | null]>
      requests={[{ url: "/api/admin/products/reviews" }]}
      onSuccess={ReviewsInitializer}
    >
      <Reviews />
    </AdminServerLoader>
  );
}
