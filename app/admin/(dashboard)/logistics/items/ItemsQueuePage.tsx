import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { ItemsQueueInitializer } from "./ItemsQueueInitializer";
import ItemsQueue from "./ItemsQueue";

export default async function ItemsQueuePage() {
  return (
    <AdminServerLoader<[any]>
      requests={[{ url: "/api/admin/logistics/items?page=1&limit=50" }]}
      onSuccess={ItemsQueueInitializer}
    >
      <ItemsQueue />
    </AdminServerLoader>
  );
}
