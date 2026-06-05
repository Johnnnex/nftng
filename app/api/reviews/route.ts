import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { reviewSubmitSchema } from "@/data";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = reviewSubmitSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 });

  const { productId, reviewerName, rating, content } = parsed.data;

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { error } = await supabase.from("product_reviews").insert({
    product_id: productId,
    reviewer_name: reviewerName,
    rating,
    content,
    is_verified: false,
    is_approved: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: { message: "Review submitted — pending approval" } }, { status: 201 });
}
