import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { refreshToken } = body as { refreshToken?: string };

  if (refreshToken) {
    await supabase.from("refresh_tokens").update({ revoked: true }).eq("token_hash", refreshToken);
  }

  const res = new NextResponse(null, { status: 204 });
  res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
  return res;
}
