import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { promoCodeUpdateSchema } from "@/data";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = promoCodeUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.isActive !== undefined) update.is_active = parsed.data.isActive;

  const { data, error } = await supabase
    .from("promo_codes")
    .update(update)
    .eq("id", id)
    .select("id, campaign_name, code, discount_type, discount_value, is_active, usage_count, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: {
      id: data.id,
      campaignName: data.campaign_name,
      code: data.code,
      discountType: data.discount_type,
      discountValue: Number(data.discount_value),
      isActive: data.is_active,
      usageCount: data.usage_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
