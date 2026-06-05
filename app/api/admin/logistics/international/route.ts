import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

const LIMIT = 50;

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const offset = (page - 1) * LIMIT;

  let query = supabase
    .from("outside_nigeria_orders")
    .select("*, countries(name)", { count: "exact" })
    .range(offset, offset + LIMIT - 1)
    .order("created_at", { ascending: false });

  if (search) query = query.or(`user_name.ilike.%${search}%,user_email.ilike.%${search}%`);

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((o: any) => ({
    id: o.id,
    previewToken: o.preview_token,
    userName: o.user_name,
    userEmail: o.user_email,
    userPhone: o.user_phone,
    userCountryId: o.user_country_id,
    userCountryName: o.countries?.name ?? null,
    userAddress: o.user_address,
    items: o.items ?? [],
    status: o.status,
    resolvedAt: o.resolved_at,
    createdAt: o.created_at,
  }));

  return NextResponse.json({ data: result, meta: { total: count ?? 0, page, limit: LIMIT } });
}
