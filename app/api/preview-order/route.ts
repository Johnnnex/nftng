import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const { data: order, error } = await supabase
    .from("outside_nigeria_orders")
    .select("*, countries(name)")
    .eq("preview_token", token)
    .single();

  if (error || !order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      id: order.id,
      previewToken: order.preview_token,
      userName: order.user_name,
      userEmail: order.user_email,
      userPhone: order.user_phone,
      userCountryName: (order as any).countries?.name ?? null,
      userAddress: order.user_address,
      items: order.items ?? [],
      status: order.status,
      createdAt: order.created_at,
    },
  });
}
