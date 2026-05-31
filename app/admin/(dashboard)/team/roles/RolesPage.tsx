import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { RolesInitializer } from "./RolesInitializer";
import RoleTemplates from "./RoleTemplates";
import type { RoleTemplate, PaginationMeta } from "@/data";

type Paged<T> = { data: T[]; meta: PaginationMeta } | null;

export default async function RolesPage() {
  return (
    <AdminServerLoader<[Paged<RoleTemplate>]>
      requests={[{ url: "/api/admin/roles?page=1&limit=50" }]}
      onSuccess={RolesInitializer}
    >
      <RoleTemplates />
    </AdminServerLoader>
  );
}
