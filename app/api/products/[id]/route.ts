import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { SaleStatus } from "@/data";

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [
    { data: product },
    { data: cfg },
    { data: groups },
    { data: variants },
    { data: stocks },
    { data: faqs },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).eq("is_active", true).single(),
    supabase.from("ecommerce_config").select("sales_open_at, sales_close_at").single(),
    supabase.from("product_variant_groups").select("*").eq("product_id", id).order("display_order"),
    supabase.from("product_variants").select("*").eq("product_id", id).order("display_order"),
    supabase.from("product_stocks").select("*").eq("product_id", id),
    supabase.from("product_faqs").select("*").eq("product_id", id).order("display_order"),
    supabase
      .from("product_reviews")
      .select("id, reviewer_name, rating, content, is_verified, created_at")
      .eq("product_id", id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false }),
  ]);

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const stockRows = stocks ?? [];
  const totalStock = stockRows.reduce((s: number, r: { quantity: number }) => s + r.quantity, 0);
  const approvedReviews = reviews ?? [];
  const avgRating = approvedReviews.length
    ? approvedReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / approvedReviews.length
    : null;

  const groupsWithEntries = (groups ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    influencesPrice: g.influences_price,
    influencesImage: g.influences_image,
    displayOrder: g.display_order,
    entries: (variants ?? [])
      .filter((v: { group_id: string }) => v.group_id === g.id)
      .map((v: { id: string; value: string; price_override: number | null; image_url: string | null; display_order: number }) => ({
        id: v.id,
        value: v.value,
        priceOverride: v.price_override != null ? Number(v.price_override) : null,
        imageUrl: v.image_url,
        displayOrder: v.display_order,
      })),
  }));

  return NextResponse.json({
    data: {
      id: product.id,
      title: product.title,
      description: product.description ?? null,
      about: product.about ?? null,
      basePrice: Number(product.base_price),
      baseImage: product.base_image,
      saleStatus: computeSaleStatus(
        product.sales_open_at, product.sales_close_at, totalStock,
        cfg?.sales_open_at ?? null, cfg?.sales_close_at ?? null,
      ),
      salesOpenAt: product.sales_open_at,
      salesCloseAt: product.sales_close_at,
      totalStock,
      variantGroups: groupsWithEntries,
      stocks: stockRows.map((s: { id: string; combo: Record<string, string>; quantity: number }) => ({
        id: s.id,
        combo: s.combo,
        quantity: s.quantity,
      })),
      faqs: (faqs ?? []).map((f: { id: string; question: string; answer: string; display_order: number }) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        displayOrder: f.display_order,
      })),
      reviews: approvedReviews.map((r: { id: string; reviewer_name: string; rating: number; content: string; is_verified: boolean; created_at: string }) => ({
        id: r.id,
        reviewerName: r.reviewer_name,
        rating: r.rating,
        content: r.content,
        isVerified: r.is_verified,
        createdAt: r.created_at,
      })),
      avgRating,
      reviewCount: approvedReviews.length,
    },
  });
}
