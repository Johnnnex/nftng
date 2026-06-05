import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json().catch(() => ({}));

  if (!code || typeof code !== "string")
    return NextResponse.json({ error: "Code is required" }, { status: 400 });

  const { data } = await supabase
    .from("promo_codes")
    .select("id, campaign_name, code, discount_type, discount_value, is_active, usage_count, max_usage, starts_at, expires_at")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (!data || !data.is_active)
    return NextResponse.json({ error: "Invalid or inactive promo code" }, { status: 404 });

  const now = new Date();

  if (data.starts_at && new Date(data.starts_at) > now)
    return NextResponse.json({ error: "Promo code is not yet active" }, { status: 400 });

  if (data.expires_at && new Date(data.expires_at) < now)
    return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });

  if (data.max_usage !== null && data.usage_count >= data.max_usage)
    return NextResponse.json({ error: "Promo code usage limit reached" }, { status: 400 });

  const sub = typeof subtotal === "number" && subtotal > 0 ? subtotal : 0;
  const discountAmount =
    data.discount_type === "percent"
      ? Math.round(sub * (Number(data.discount_value) / 100))
      : Number(data.discount_value);

  return NextResponse.json({
    data: {
      id: data.id,
      campaignName: data.campaign_name,
      code: data.code,
      discountType: data.discount_type,
      discountValue: Number(data.discount_value),
      discountAmount,
    },
  });
}
