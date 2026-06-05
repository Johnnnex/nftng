import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";
import type { PublicProductDetail } from "@/data";

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${base}/api/products/${productId}`, { cache: "no-store" });
  if (!res.ok) notFound();

  const { data }: { data: PublicProductDetail } = await res.json();
  return <ProductDetail product={data} />;
}
