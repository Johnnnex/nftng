import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { TeamInitializer } from "./TeamInitializer";
import TeamAdmins from "./TeamAdmins";
import type { AdminRecord, RoleTemplate, PendingInvite, PaginationMeta } from "@/data";

type Paged<T> = { data: T[]; meta: PaginationMeta } | null;

export default async function TeamPage() {
  return (
    <AdminServerLoader<[Paged<AdminRecord>, Paged<RoleTemplate>, Paged<PendingInvite>]>
      requests={[
        { url: "/api/admin/admins?page=1&limit=50" },
        { url: "/api/admin/roles?page=1&limit=50" },
        { url: "/api/admin/invites?page=1&limit=50" },
      ]}
      onSuccess={TeamInitializer}
    >
      <TeamAdmins />
    </AdminServerLoader>
  );
}
