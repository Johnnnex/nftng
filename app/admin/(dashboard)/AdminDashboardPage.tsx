import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { AdminDashboardInitializer } from "./AdminDashboardInitializer";
import AdminDashboard from "./AdminDashboard";

export default async function AdminDashboardPage() {
  const year = new Date().getFullYear();
  return (
    <AdminServerLoader
      requests={[
        { url: "/api/admin/dashboard/metrics" },
        { url: `/api/admin/dashboard/chart?year=${year}` },
        { url: "/api/admin/dashboard/recent-orders" },
      ]}
      onSuccess={AdminDashboardInitializer}
    >
      <AdminDashboard />
    </AdminServerLoader>
  );
}
