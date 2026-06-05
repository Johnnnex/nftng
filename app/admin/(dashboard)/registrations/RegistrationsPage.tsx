import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { RegistrationsInitializer } from "./RegistrationsInitializer";
import Registrations from "./Registrations";
import type { RegistrantRecord, PaginationMeta } from "@/data";

type RegPage = { data: RegistrantRecord[]; meta: PaginationMeta };

export default async function RegistrationsPage() {
  return (
    <AdminServerLoader<[RegPage | null]>
      requests={[{ url: "/api/admin/registrations?tab=registrations" }]}
      onSuccess={RegistrationsInitializer}
    >
      <Registrations />
    </AdminServerLoader>
  );
}
