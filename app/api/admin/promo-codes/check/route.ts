import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase() ?? "";
  if (!code) return NextResponse.json({ exists: false });

  const { count } = await supabase
    .from("promo_codes")
    .select("id", { count: "exact", head: true })
    .eq("code", code);

  return NextResponse.json({ exists: (count ?? 0) > 0 });
}
