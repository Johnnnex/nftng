"use client";
import NewProduct from "@/app/admin/(dashboard)/products/new/NewProduct";

export default function EditProduct({ productId }: { productId: string }) {
  return <NewProduct productId={productId} />;
}
