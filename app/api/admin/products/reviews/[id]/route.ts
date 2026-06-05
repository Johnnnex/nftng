import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const validActions = ["verify", "unverify", "approve", "unapprove"] as const;
  if (!validActions.includes(body.action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const update: Record<string, boolean> =
    body.action === "verify"   ? { is_verified: true }
    : body.action === "unverify" ? { is_verified: false }
    : body.action === "approve"  ? { is_approved: true }
    :                              { is_approved: false };

  const { error } = await supabase
    .from("product_reviews")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: { ok: true } });
}
