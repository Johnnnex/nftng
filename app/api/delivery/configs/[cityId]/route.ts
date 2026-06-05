import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cityId: string }> }) {
  const { cityId } = await params;

  const { data, error } = await supabase
    .from("delivery_configs")
    .select("id, city_id, method, price, estimated_days")
    .eq("city_id", cityId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: (data ?? []).map((r) => ({
      id: r.id,
      cityId: r.city_id,
      method: r.method,
      price: Number(r.price),
      estimatedDays: r.estimated_days ?? null,
    })),
  });
}
