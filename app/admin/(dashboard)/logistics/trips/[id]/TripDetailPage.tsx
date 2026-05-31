import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { TripDetailInitializer } from "./TripDetailInitializer";
import TripDetail from "./TripDetail";
import type { TripDetail as TripDetailType } from "@/data";

type Params = { params: Promise<{ id: string }> };

export default async function TripDetailPage({ params }: Params) {
  const { id } = await params;
  return (
    <AdminServerLoader<[TripDetailType | null]>
      requests={[{ url: `/api/admin/logistics/trips/${id}` }]}
      onSuccess={TripDetailInitializer}
    >
      <TripDetail tripId={id} />
    </AdminServerLoader>
  );
}
