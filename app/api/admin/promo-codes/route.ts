import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { promoCodeSchema } from "@/data";

const SELECT = "id, campaign_name, code, discount_type, discount_value, is_active, usage_count, max_usage, starts_at, expires_at, created_at, updated_at";

function toRecord(r: Record<string, unknown>) {
  return {
    id: r.id,
    campaignName: r.campaign_name,
    code: r.code,
    discountType: r.discount_type,
    discountValue: Number(r.discount_value),
    isActive: r.is_active,
    usageCount: r.usage_count,
    maxUsage: r.max_usage ?? null,
    startsAt: r.starts_at ?? null,
    expiresAt: r.expires_at ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const LIMIT = 50;

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const offset = (page - 1) * LIMIT;

  let query = supabase
    .from("promo_codes")
    .select(SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + LIMIT - 1);

  if (search) {
    query = query.or(`code.ilike.%${search}%,campaign_name.ilike.%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: (data ?? []).map(toRecord),
    meta: { total: count ?? 0, page, limit: LIMIT },
  });
}

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = promoCodeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 });

  const { campaignName, code, discountType, discountValue, maxUsage, startsAt, expiresAt } = parsed.data;

  const { count: existing } = await supabase
    .from("promo_codes")
    .select("id", { count: "exact", head: true })
    .eq("code", code);

  if (existing && existing > 0)
    return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      campaign_name: campaignName,
      code,
      discount_type: discountType,
      discount_value: discountValue,
      max_usage: maxUsage ?? null,
      starts_at: startsAt || null,
      expires_at: expiresAt || null,
      created_by: ctx.adminId,
    })
    .select(SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: toRecord(data as Record<string, unknown>) }, { status: 201 });
}
