import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { outsideOrderSchema } from "@/data";
import { customAlphabet } from "nanoid";
import { sendEmail } from "@/lib/brevo";
import { outsideOrderEmail } from "@/lib/email-templates";

const genPreviewToken = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = outsideOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid input" }, { status: 400 });

  const { fullName, email, phone, streetAddress, countryId, items } = parsed.data;

  // 1. Validate products exist and are active
  const productIds = [...new Set(items.map((i) => i.productId))];
  const { data: products } = await supabase
    .from("products")
    .select("id, is_active")
    .in("id", productIds);

  for (const item of items) {
    const p = products?.find((p) => p.id === item.productId);
    if (!p?.is_active)
      return NextResponse.json({ error: `"${item.productTitle}" is no longer available` }, { status: 400 });
  }

  // 2. Read + validate stock for each item
  type StockEntry = { stockId: string; currentQty: number; item: (typeof items)[0] };
  const stockEntries: StockEntry[] = [];

  for (const item of items) {
    const sortedCombo = Object.keys(item.variantCombo)
      .sort()
      .reduce((a, k) => ({ ...a, [k]: item.variantCombo[k] as string }), {} as Record<string, string>);

    const { data: stock } = await supabase
      .from("product_stocks")
      .select("id, quantity")
      .eq("product_id", item.productId)
      .filter("combo", "eq", JSON.stringify(sortedCombo))
      .single();

    if (!stock) return NextResponse.json({ error: `Invalid combination for "${item.productTitle}"` }, { status: 400 });
    if (stock.quantity < item.qty)
      return NextResponse.json({ error: `Not enough stock for "${item.productTitle}" (${stock.quantity} left)` }, { status: 409 });

    stockEntries.push({ stockId: stock.id, currentQty: stock.quantity, item });
  }

  // 3. Atomic stock decrement (same optimistic lock pattern as Nigerian orders)
  for (const { stockId, currentQty, item } of stockEntries) {
    const { data: updated } = await supabase
      .from("product_stocks")
      .update({ quantity: currentQty - item.qty })
      .eq("id", stockId)
      .eq("quantity", currentQty)
      .select("id");

    if (!updated || updated.length === 0)
      return NextResponse.json({ error: `Stock just ran out for "${item.productTitle}" — try again` }, { status: 409 });
  }

  // 4. Insert outside_nigeria_orders
  const token = genPreviewToken();
  const itemsSnapshot = items.map((i) => ({
    productId: i.productId,
    productTitle: i.productTitle,
    variantCombo: i.variantCombo,
    qty: i.qty,
    unitPrice: i.unitPrice,
    productImage: i.productImage ?? null,
  }));

  const { data: order, error: orderErr } = await supabase
    .from("outside_nigeria_orders")
    .insert({
      preview_token: token,
      user_name: fullName,
      user_email: email,
      user_phone: phone,
      user_country_id: countryId,
      user_address: streetAddress,
      items: itemsSnapshot,
      status: "pending",
    })
    .select("id, preview_token")
    .single();

  if (orderErr || !order) {
    // Roll back stock on failure
    await Promise.all(
      stockEntries.map(({ stockId, currentQty, item }) =>
        supabase.from("product_stocks").update({ quantity: currentQty }).eq("id", stockId).eq("quantity", currentQty - item.qty),
      ),
    );
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }

  // 5. Fire-and-forget email with preview link
  const storeUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const { data: countryRow } = await supabase.from("countries").select("name").eq("id", countryId).single();

  sendEmail({
    to: [{ email, name: fullName }],
    subject: `Your International Order — NFTNG Store`,
    htmlContent: outsideOrderEmail({
      customerName: fullName,
      previewToken: order.preview_token,
      items: items.map((i) => ({
        productTitle: i.productTitle,
        variantCombo: i.variantCombo as Record<string, string>,
        qty: i.qty,
        unitPrice: i.unitPrice,
      })),
      countryName: (countryRow as { name: string } | null)?.name ?? "your country",
      storeUrl,
    }),
  }).catch(() => null);

  return NextResponse.json({ data: { previewToken: order.preview_token } }, { status: 201 });
}
