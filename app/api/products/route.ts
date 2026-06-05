import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { SaleStatus } from "@/data";

const LIMIT = 50;

function computeSaleStatus(
  salesOpenAt: string | null,
  salesCloseAt: string | null,
  totalStock: number,
  globalOpenAt: string | null,
  globalCloseAt: string | null,
): SaleStatus {
  const now = Date.now();

  if (globalCloseAt && new Date(globalCloseAt).getTime() < now) return "closed";
  if (globalOpenAt && new Date(globalOpenAt).getTime() > now) return "opening_soon";
  if (salesOpenAt && new Date(salesOpenAt).getTime() > now) return "opening_soon";
  if (salesCloseAt && new Date(salesCloseAt).getTime() < now) return "closed";
  if (salesCloseAt && (new Date(salesCloseAt).getTime() - now) / 36e5 <= 24) return "closing_soon";
  if (totalStock === 0) return "out_of_stock";
  if (totalStock <= 5) return "almost_out";
  return "open";
}

export async function GET(req: NextRequest) {
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? String(LIMIT))));
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const offset = (page - 1) * limit;

  let productsQuery = supabase
    .from("products")
    .select("id, title, base_price, base_image, sales_open_at, sales_close_at, created_at", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    productsQuery = productsQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,about.ilike.%${search}%`);
  }

  const [{ data: cfg }, { data: products, count, error }] = await Promise.all([
    supabase.from("ecommerce_config").select("sales_open_at, sales_close_at").single(),
    productsQuery,
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const productIds = (products ?? []).map((p) => p.id);

  const [{ data: stockRows }, { data: groupRows }, { data: reviewRows }] = await Promise.all([
    productIds.length
      ? supabase.from("product_stocks").select("product_id, quantity").in("product_id", productIds)
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabase.from("product_variant_groups").select("product_id").in("product_id", productIds)
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabase
          .from("product_reviews")
          .select("product_id, rating")
          .in("product_id", productIds)
          .eq("is_approved", true)
      : Promise.resolve({ data: [] }),
  ]);

  const stockByProduct: Record<string, number> = {};
  for (const r of stockRows ?? []) {
    stockByProduct[r.product_id] = (stockByProduct[r.product_id] ?? 0) + r.quantity;
  }

  const groupCountByProduct: Record<string, number> = {};
  for (const r of groupRows ?? []) {
    groupCountByProduct[r.product_id] = (groupCountByProduct[r.product_id] ?? 0) + 1;
  }

  const ratingsByProduct: Record<string, number[]> = {};
  for (const r of reviewRows ?? []) {
    (ratingsByProduct[r.product_id] ??= []).push(r.rating);
  }

  const data = (products ?? []).map((p) => {
    const totalStock = stockByProduct[p.id] ?? 0;
    const ratings = ratingsByProduct[p.id] ?? [];
    return {
      id: p.id,
      title: p.title,
      basePrice: Number(p.base_price),
      baseImage: p.base_image,
      saleStatus: computeSaleStatus(
        p.sales_open_at, p.sales_close_at, totalStock,
        cfg?.sales_open_at ?? null, cfg?.sales_close_at ?? null,
      ),
      totalStock,
      variantGroupCount: groupCountByProduct[p.id] ?? 0,
      avgRating: ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : null,
      reviewCount: ratings.length,
      createdAt: p.created_at,
    };
  });

  return NextResponse.json({ data, meta: { total: count ?? 0, page, limit: LIMIT } });
}
