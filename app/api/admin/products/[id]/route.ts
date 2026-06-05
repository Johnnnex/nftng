import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { productUpdateSchema, productToggleSchema } from "@/data";
import { fetchProductDetail } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const detail = await fetchProductDetail(id);
  if (!detail) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ data: detail });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  // isActive-only patch (toggle) — use the lighter schema to avoid Zod partial() edge cases
  const isToggleOnly = Object.keys(body).length === 1 && "isActive" in body;
  if (isToggleOnly) {
    const toggled = productToggleSchema.safeParse(body);
    if (!toggled.success)
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    const { error } = await supabase
      .from("products")
      .update({ is_active: toggled.data.isActive, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const detail = await fetchProductDetail(id);
    return NextResponse.json({ data: detail }, { status: 200 });
  }

  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 });

  const { variantGroups, stocks, faqs, ...topLevel } = parsed.data;

  // Update top-level product fields
  if (Object.keys(topLevel).length) {
    const update: Record<string, unknown> = {};
    if (topLevel.title !== undefined) update.title = topLevel.title;
    if (topLevel.about !== undefined) update.about = topLevel.about;
    if (topLevel.description !== undefined) update.description = topLevel.description;
    if (topLevel.basePrice !== undefined) update.base_price = topLevel.basePrice;
    if (topLevel.baseImage !== undefined) update.base_image = topLevel.baseImage;
    if (topLevel.isActive !== undefined) update.is_active = topLevel.isActive;
    if (topLevel.salesOpenAt !== undefined) update.sales_open_at = topLevel.salesOpenAt;
    if (topLevel.salesCloseAt !== undefined) update.sales_close_at = topLevel.salesCloseAt;
    update.updated_at = new Date().toISOString();

    const { error } = await supabase.from("products").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Replace variant groups if provided
  if (variantGroups !== undefined) {
    // Check if any stock rows exist — if so, prevent group name changes
    const { count } = await supabase
      .from("product_stocks")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id)
      .neq("combo", "{}");

    if ((count ?? 0) > 0) {
      // Validate no group name changes (compare existing names)
      const { data: existingGroups } = await supabase
        .from("product_variant_groups")
        .select("id, name")
        .eq("product_id", id);
      const existingNames = new Set((existingGroups ?? []).map((g) => g.name));
      const newNames = new Set(variantGroups.map((g) => g.name));
      for (const name of existingNames) {
        if (!newNames.has(name)) {
          return NextResponse.json({ error: `Cannot rename or remove group "${name}" — stock rows reference it` }, { status: 400 });
        }
      }
    }

    // Replace all groups + entries (cascade delete handles entries)
    await supabase.from("product_variant_groups").delete().eq("product_id", id);
    for (const [i, group] of variantGroups.entries()) {
      const { data: g } = await supabase
        .from("product_variant_groups")
        .insert({ product_id: id, name: group.name, influences_price: group.influencesPrice, influences_image: group.influencesImage, display_order: i })
        .select("id")
        .single();
      if (g && group.entries.length) {
        await supabase.from("product_variants").insert(
          group.entries.map((e, j) => ({
            product_id: id, group_id: g.id, value: e.value,
            price_override: e.priceOverride, image_url: e.imageUrl, display_order: j,
          })),
        );
      }
    }
  }

  // Replace stock rows if provided
  if (stocks !== undefined) {
    await supabase.from("product_stocks").delete().eq("product_id", id);
    if (stocks.length) {
      await supabase.from("product_stocks").insert(
        stocks.map((s) => ({ product_id: id, combo: s.combo, quantity: s.quantity })),
      );
    } else {
      await supabase.from("product_stocks").insert({ product_id: id, combo: {}, quantity: 0 });
    }
  }

  // Replace FAQs if provided
  if (faqs !== undefined) {
    await supabase.from("product_faqs").delete().eq("product_id", id);
    if (faqs.length) {
      await supabase.from("product_faqs").insert(
        faqs.map((f, i) => ({ product_id: id, question: f.question, answer: f.answer, display_order: i })),
      );
    }
  }

  const detail = await fetchProductDetail(id);
  if (!detail) return NextResponse.json({ error: "Product not found after update" }, { status: 404 });
  return NextResponse.json({ data: detail });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
