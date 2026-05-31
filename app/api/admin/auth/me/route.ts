import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("admins")
    .select(`
      id, email, first_name, last_name, is_super, is_active,
      admin_configs!admin_id ( module_permissions )
    `)
    .eq("id", payload.sub)
    .maybeSingle();

  if (!admin || !admin.is_active) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const config = Array.isArray(admin.admin_configs)
    ? admin.admin_configs[0]
    : admin.admin_configs;
  const permissions = config?.module_permissions ?? {};

  return NextResponse.json({
    data: {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      isSuper: admin.is_super,
      permissions,
    },
  });
}
