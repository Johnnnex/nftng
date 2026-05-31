import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { TripsInitializer } from "./TripsInitializer";
import Trips from "./Trips";

export default async function TripsPage() {
  return (
    <AdminServerLoader<[any]>
      requests={[{ url: "/api/admin/logistics/trips?page=1&limit=50" }]}
      onSuccess={TripsInitializer}
    >
      <Trips />
    </AdminServerLoader>
  );
}
