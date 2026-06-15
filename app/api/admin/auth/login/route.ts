import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { adminLoginSchema } from "@/data";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const { data: admin } = await supabase
    .from("admins")
    .select(
      `
      id, email, password_hash, first_name, last_name,
      is_super, is_active,
      admin_configs!admin_id ( module_permissions )
    `,
    )
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!admin || !admin.is_active) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const config = Array.isArray(admin.admin_configs)
    ? admin.admin_configs[0]
    : admin.admin_configs;
  const permissions = config?.module_permissions ?? {};

  const accessToken = signAccessToken({
    sub: admin.id,
    isSuper: admin.is_super,
    permissions,
  });

  const rawRefreshToken = signRefreshToken(admin.id);

  await supabase.from("refresh_tokens").insert({
    admin_id: admin.id,
    token_hash: rawRefreshToken,
    family_id: randomUUID(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    user_agent: req.headers.get("user-agent"),
    ip_address:
      req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
  });

  await supabase
    .from("admins")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", admin.id);

  const res = NextResponse.json({
    data: {
      accessToken,
      refreshToken: rawRefreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        isSuper: admin.is_super,
        permissions,
      },
    },
  });

  res.cookies.set("admin_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days — matches refresh token lifetime
    path: "/",
  });

  return res;
}
