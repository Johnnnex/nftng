import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hasPermission } from "@/lib/permissions";
import { getAdminFromRequest } from "@/lib/server-utils";

const LIMIT = 50;

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const offset = (page - 1) * LIMIT;

  const { data: invites, count, error } = await supabase
    .from("admin_invites")
    .select(`
      id, email, first_name, last_name, role_id, expires_at, created_at,
      admin_roles ( name )
    `, { count: "exact" })
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .range(offset, offset + LIMIT - 1);

  if (error) {
    console.error("[GET /api/admin/invites]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = (invites ?? []).map((inv) => {
    const role = Array.isArray(inv.admin_roles) ? inv.admin_roles[0] : inv.admin_roles;
    return {
      id: inv.id,
      email: inv.email,
      firstName: inv.first_name,
      lastName: inv.last_name,
      roleId: inv.role_id ?? null,
      roleName: role?.name ?? null,
      createdAt: inv.created_at,
      expiresAt: inv.expires_at,
    };
  });

  return NextResponse.json({ data: result, meta: { total: count ?? 0, page, limit: LIMIT } });
}
