import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

const LIMIT = 50;

function toRecord(r: Record<string, unknown>) {
  const product = r.products as unknown as { title?: string } | null;
  return {
    id: r.id,
    productId: r.product_id,
    productTitle: product?.title ?? null,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    content: r.content,
    isVerified: r.is_verified,
    isApproved: r.is_approved,
    createdAt: r.created_at,
  };
}

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const offset = (page - 1) * LIMIT;

  let query = supabase
    .from("product_reviews")
    .select("*, products(title)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + LIMIT - 1);

  if (search) {
    // Find product IDs matching the search term so we can include them in the OR filter
    const { data: matchedProducts } = await supabase
      .from("products")
      .select("id")
      .ilike("title", `%${search}%`);

    const matchedIds = (matchedProducts ?? []).map((p) => p.id);

    if (matchedIds.length > 0) {
      query = query.or(
        `reviewer_name.ilike.%${search}%,content.ilike.%${search}%,product_id.in.(${matchedIds.join(",")})`,
      );
    } else {
      query = query.or(`reviewer_name.ilike.%${search}%,content.ilike.%${search}%`);
    }
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: (data ?? []).map((r) => toRecord(r as Record<string, unknown>)),
    meta: { total: count ?? 0, page, limit: LIMIT },
  });
}
