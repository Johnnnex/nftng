import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { productCreateSchema } from "@/data";
import type { SaleStatus } from "@/data";

const LIMIT = 50;

function computeSaleStatus(
  isActive: boolean,
  salesOpenAt: string | null,
  salesCloseAt: string | null,
  totalStock: number,
): SaleStatus {
  if (!isActive) return "inactive";
  const now = Date.now();
  if (salesOpenAt && new Date(salesOpenAt).getTime() > now) return "opening_soon";
  if (salesCloseAt && new Date(salesCloseAt).getTime() < now) return "closed";
  if (salesCloseAt) {
    const hoursLeft = (new Date(salesCloseAt).getTime() - now) / 36e5;
    if (hoursLeft <= 24) return "closing_soon";
  }
  if (totalStock === 0) return "out_of_stock";
  if (totalStock <= 5) return "almost_out";
  return "open";
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
    .from("products")
    .select("id, title, base_price, base_image, is_active, sales_open_at, sales_close_at, created_at", { count: "exact" });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,about.ilike.%${search}%`);
  }

  const { data: products, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + LIMIT - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const productIds = (products ?? []).map((p) => p.id);
  const { data: stockRows } = productIds.length
    ? await supabase.from("product_stocks").select("product_id, quantity").in("product_id", productIds)
    : { data: [] };

  const { data: groupRows } = productIds.length
    ? await supabase.from("product_variant_groups").select("product_id").in("product_id", productIds)
    : { data: [] };

  const stockByProduct: Record<string, number> = {};
  for (const row of stockRows ?? []) {
    stockByProduct[row.product_id] = (stockByProduct[row.product_id] ?? 0) + row.quantity;
  }

  const groupCountByProduct: Record<string, number> = {};
  for (const row of groupRows ?? []) {
    groupCountByProduct[row.product_id] = (groupCountByProduct[row.product_id] ?? 0) + 1;
  }

  const data = (products ?? []).map((p) => {
    const totalStock = stockByProduct[p.id] ?? 0;
    return {
      id: p.id,
      title: p.title,
      basePrice: Number(p.base_price),
      baseImage: p.base_image,
      isActive: p.is_active,
      salesOpenAt: p.sales_open_at,
      salesCloseAt: p.sales_close_at,
      saleStatus: computeSaleStatus(p.is_active, p.sales_open_at, p.sales_close_at, totalStock),
      variantGroupCount: groupCountByProduct[p.id] ?? 0,
      totalStock,
      createdAt: p.created_at,
    };
  });

  return NextResponse.json({ data, meta: { total: count ?? 0, page, limit: LIMIT } });
}

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 });

  const { title, about, description, basePrice, baseImage, isActive, salesOpenAt, salesCloseAt, variantGroups, stocks, faqs } = parsed.data;

  const { data: product, error: prodErr } = await supabase
    .from("products")
    .insert({ title, about, description, base_price: basePrice, base_image: baseImage, is_active: isActive, sales_open_at: salesOpenAt, sales_close_at: salesCloseAt, created_by: ctx.adminId })
    .select()
    .single();

  if (prodErr || !product) {
    return NextResponse.json({ error: prodErr?.message ?? "Failed to create product" }, { status: 500 });
  }

  const productId = product.id;

  // Insert variant groups + entries
  const insertedGroups: Array<{ id: string; name: string }> = [];
  for (const [i, group] of variantGroups.entries()) {
    const { data: g, error: gErr } = await supabase
      .from("product_variant_groups")
      .insert({ product_id: productId, name: group.name, influences_price: group.influencesPrice, influences_image: group.influencesImage, display_order: i })
      .select("id, name")
      .single();

    if (gErr || !g) {
      await supabase.from("products").delete().eq("id", productId);
      return NextResponse.json({ error: gErr?.message ?? "Failed to create variant group" }, { status: 500 });
    }
    insertedGroups.push(g);

    if (group.entries.length) {
      const entryRows = group.entries.map((e, j) => ({
        product_id: productId,
        group_id: g.id,
        value: e.value,
        price_override: e.priceOverride,
        image_url: e.imageUrl,
        display_order: j,
      }));
      const { error: eErr } = await supabase.from("product_variants").insert(entryRows);
      if (eErr) {
        await supabase.from("products").delete().eq("id", productId);
        return NextResponse.json({ error: eErr.message }, { status: 500 });
      }
    }
  }

  // Insert stock rows
  if (stocks.length) {
    const stockRows = stocks.map((s) => ({ product_id: productId, combo: s.combo, quantity: s.quantity }));
    const { error: sErr } = await supabase.from("product_stocks").insert(stockRows);
    if (sErr) {
      await supabase.from("products").delete().eq("id", productId);
      return NextResponse.json({ error: sErr.message }, { status: 500 });
    }
  } else {
    // No variants — insert global stock row with combo = {}
    await supabase.from("product_stocks").insert({ product_id: productId, combo: {}, quantity: 0 });
  }

  // Insert FAQs
  if (faqs.length) {
    const faqRows = faqs.map((f, i) => ({ product_id: productId, question: f.question, answer: f.answer, display_order: i }));
    await supabase.from("product_faqs").insert(faqRows);
  }

  // Return full detail
  const detail = await fetchProductDetail(productId);
  if (!detail) return NextResponse.json({ error: "Created but failed to fetch detail" }, { status: 500 });
  return NextResponse.json({ data: detail }, { status: 201 });
}

async function fetchProductDetail(id: string) {
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (!product) return null;

  const { data: groups } = await supabase
    .from("product_variant_groups")
    .select("*")
    .eq("product_id", id)
    .order("display_order");

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("display_order");

  const { data: stocksRaw } = await supabase
    .from("product_stocks")
    .select("*")
    .eq("product_id", id);

  const { data: faqsRaw } = await supabase
    .from("product_faqs")
    .select("*")
    .eq("product_id", id)
    .order("display_order");

  const { count: reviewCount } = await supabase
    .from("product_reviews")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id)
    .eq("is_approved", true);

  const { data: ratingRaw } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", id)
    .eq("is_approved", true);

  const avgRating = ratingRaw?.length
    ? ratingRaw.reduce((s, r) => s + r.rating, 0) / ratingRaw.length
    : null;

  const groupsWithEntries = (groups ?? []).map((g) => ({
    id: g.id,
    productId: g.product_id,
    name: g.name,
    influencesPrice: g.influences_price,
    influencesImage: g.influences_image,
    displayOrder: g.display_order,
    entries: (variants ?? [])
      .filter((v) => v.group_id === g.id)
      .map((v) => ({
        id: v.id,
        productId: v.product_id,
        groupId: v.group_id,
        value: v.value,
        priceOverride: v.price_override ? Number(v.price_override) : null,
        imageUrl: v.image_url,
        displayOrder: v.display_order,
      })),
  }));

  const totalStock = (stocksRaw ?? []).reduce((s, r) => s + r.quantity, 0);

  return {
    id: product.id,
    title: product.title,
    about: product.about ?? null,
    description: product.description,
    basePrice: Number(product.base_price),
    baseImage: product.base_image,
    isActive: product.is_active,
    salesOpenAt: product.sales_open_at,
    salesCloseAt: product.sales_close_at,
    saleStatus: computeSaleStatus(product.is_active, product.sales_open_at, product.sales_close_at, totalStock),
    variantGroups: groupsWithEntries,
    stocks: (stocksRaw ?? []).map((s) => ({ id: s.id, productId: s.product_id, combo: s.combo, quantity: s.quantity })),
    faqs: (faqsRaw ?? []).map((f) => ({ id: f.id, productId: f.product_id, question: f.question, answer: f.answer, displayOrder: f.display_order })),
    reviewCount: reviewCount ?? 0,
    avgRating,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export { fetchProductDetail };
