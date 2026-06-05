import { AdminServerLoader } from "@/components/admin/AdminServerLoader";
import { EditProductInitializer } from "./EditProductInitializer";
import EditProduct from "./EditProduct";
import type { ProductDetail } from "@/data";

type Params = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Params) {
  const { id } = await params;
  return (
    <AdminServerLoader<[{ data: ProductDetail } | null]>
      requests={[{ url: `/api/admin/products/${id}` }]}
      onSuccess={EditProductInitializer}
    >
      <EditProduct productId={id} />
    </AdminServerLoader>
  );
}
