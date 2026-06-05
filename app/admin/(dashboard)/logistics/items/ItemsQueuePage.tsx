import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { ItemsQueueInitializer } from "./ItemsQueueInitializer";
import ItemsQueue from "./ItemsQueue";

export default async function ItemsQueuePage() {
  return (
    <AdminServerLoader<[any, any]>
      requests={[
        { url: "/api/admin/logistics/items?page=1&limit=50&tab=available" },
        { url: "/api/admin/logistics/items?page=1&limit=50&tab=on_trip" },
      ]}
      onSuccess={ItemsQueueInitializer}
    >
      <ItemsQueue />
    </AdminServerLoader>
  );
}
