import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { refreshToken } = body as { refreshToken?: string };
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 400 });
  }

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const { data: stored } = await supabase
    .from("refresh_tokens")
    .select("id, family_id, revoked, expires_at")
    .eq("token_hash", refreshToken)
    .eq("admin_id", payload.sub)
    .maybeSingle();

  if (!stored) {
    return NextResponse.json({ error: "Refresh token not found" }, { status: 401 });
  }

  if (stored.revoked) {
    await supabase.from("refresh_tokens").update({ revoked: true }).eq("family_id", stored.family_id);
    return NextResponse.json({ error: "Token reuse detected" }, { status: 401 });
  }

  if (new Date(stored.expires_at) < new Date()) {
    return NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
  }

  await supabase.from("refresh_tokens").update({ revoked: true }).eq("id", stored.id);

  const { data: admin } = await supabase
    .from("admins")
    .select(`
      id, email, first_name, last_name, is_super, is_active,
      admin_configs!admin_id ( module_permissions )
    `)
    .eq("id", payload.sub)
    .maybeSingle();

  if (!admin || !admin.is_active) {
    return NextResponse.json({ error: "Admin account inactive" }, { status: 401 });
  }

  const config = Array.isArray(admin.admin_configs)
    ? admin.admin_configs[0]
    : admin.admin_configs;
  const permissions = config?.module_permissions ?? {};

  const newAccessToken = signAccessToken({ sub: admin.id, isSuper: admin.is_super, permissions });
  const newRefreshToken = signRefreshToken(admin.id);

  await supabase.from("refresh_tokens").insert({
    admin_id: admin.id,
    token_hash: newRefreshToken,
    family_id: stored.family_id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    user_agent: req.headers.get("user-agent"),
    ip_address: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
  });

  const res = NextResponse.json({
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  });

  res.cookies.set("admin_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });

  return res;
}
